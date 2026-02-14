# Authentication System Redesign — Implementation Plan

## Repository Paths

**You MUST use these exact absolute paths when reading and editing files:**

- **Frontend (Next.js):** `/Users/mac/Documents/mpc/mpc-web`
- **Backend (Express):** `/Users/mac/Documents/mpc/mpc-api`

When this plan says `mpc-web/some/file.ts`, the full path is `/Users/mac/Documents/mpc/mpc-web/some/file.ts`.
When this plan says `mpc-api/some/file.ts`, the full path is `/Users/mac/Documents/mpc/mpc-api/some/file.ts`.

## Overview

This plan restructures the authentication system across `mpc-web` (Next.js frontend) and `mpc-api` (Express backend). The architecture stays the same (Firebase + custom JWT cookie), but the flow changes to eliminate orphaned accounts, reduce network round-trips, and fix existing bugs.

## Design Summary

### Four Authentication Flows

1. **Email Sign-Up**: Frontend collects all data → sends email+password+profile to backend → backend creates Firebase user + DB user atomically
2. **Email Login**: Frontend authenticates with Firebase client SDK → sends idToken to backend → backend verifies + sets cookie
3. **Google Sign-Up (new user)**: Frontend gets Google token via popup → sends to backend → backend says "profile_required" → frontend collects country+module → sends again → backend creates user
4. **Google Login (existing user)**: Frontend gets Google token via popup → sends to backend → backend finds user → sets cookie

### Backend Endpoints (after redesign)

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `POST /v1/auth/signup` | Email signup. Receives raw email+password+profile. Creates Firebase + DB user. | None |
| `POST /v1/auth/login` | Email login. Receives Firebase idToken. | None |
| `POST /v1/auth/google` | Google auth (both signup and login). | None |
| `GET /v1/auth/me` | Session check. Reads cookie. | Cookie |
| `POST /v1/auth/logout` | Clears cookie. | Cookie |

---

## Pre-Implementation: Bugs to Fix First

Before starting the redesign, fix these bugs that exist in the current code. These are independent of the redesign and should be committed separately.

### Bug 1: env.config.ts reads wrong env var name for JWT_SECRET

**File:** `mpc-api/src/common/config/env.config.ts` line 8

**Current code:**
```ts
JWT_SECRET: `${process.env.SECRET}` || "",
```

**Problem:** The env var is named `SECRET` but `.env.example` calls it `JWT_SECRET`. Also, template literal `\`${process.env.SECRET}\`` when `SECRET` is undefined evaluates to the string `"undefined"`, not `undefined`, so the `|| ""` fallback never triggers.

**Fix — change line 8 to:**
```ts
JWT_SECRET: process.env.JWT_SECRET || "",
```

**Verify:** Check the actual `.env` file to confirm the var is named `JWT_SECRET`. The `.env.example` file at line 18 shows `JWT_SECRET=your_jwt_secret_key`.

**Same template literal bug exists on lines 5, 6, 8, 9, 17, 18, 19, 20.** All `\`${process.env.X}\`` should be changed to `process.env.X`. For example:
- Line 5: `BASE_URL: process.env.BASE_URL || ""`
- Line 6: `NODE_ENV: process.env.NODE_ENV || "local"`
- Line 9: `JWT_ExPIRES_IN: process.env.JWT_EXPIRES_IN || "7d"`
- Line 17: `API_KEY: process.env.STRIPE_API_KEY || ""`
- Line 18: `ACCOUNT_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET_ACCOUNT || ""`
- Line 19: `CONNECT_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET_CONNECT || ""`
- Line 20: `VERIFICATION_FLOW: process.env.STRIPE_VERIFICATION_FLOW || ""`

Also fix the typo `JWT_ExPIRES_IN` → `JWT_EXPIRES_IN` in the key name (line 9), and update all references to `env.JWT_ExPIRES_IN` in `user-auth.controller.ts` (lines 79, 147, 208) to `env.JWT_EXPIRES_IN`.

### Bug 2: Login page uses raw axios instead of apiService

**File:** `mpc-web/app/auth/log-in/page.tsx` lines 10, 53-57, 69, 90-94, 101

**Problem:** This file imports `axios` directly and constructs URLs manually with `NEXT_PUBLIC_API_BASE_URL`, while the rest of the app uses `apiService` with `NEXT_PUBLIC_API_URL`. Also, line 54 is missing a `/` before `v1`:
```ts
// Line 54 — MISSING leading slash:
`${process.env.NEXT_PUBLIC_API_BASE_URL}v1/auth/login`
// Line 91 — HAS leading slash:
`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/login`
```

**Fix:** This file will be rewritten in Phase 2, so this bug gets fixed as part of the redesign. No separate fix needed.

### Bug 3: 401 interceptor is non-functional

**File:** `mpc-web/lib/api/axios.ts` lines 29-49

**Problem:** The response interceptor catches 401 errors, but the `try` block (lines 36-39) is empty (logout code is commented out). An empty `try` never throws, so the `catch` at line 40-42 with `window.location.href = "/auth/sign-in"` never executes. The 401 is silently rejected with no redirect.

**Fix:** This will be addressed in Phase 4 (cleanup). For now, leave it.

---

## Phase 1: Backend Changes (mpc-api)

All changes in this phase are in the `mpc-api` repository.

### Step 1.1: Update the Zod validation schemas

**File:** `mpc-api/src/modules/authentication/validation/user-auth.schema.ts`

**Current content (entire file):**
```ts
import { z } from "zod";

export const UserLoginSchema = z.object({
    idToken: z.string().nonempty("ID Token is required"),
});

export const UserSignupSchema = z.object({
    idToken: z.string().nonempty("ID Token is required"),
    firstName: z.string().nonempty("First name is required").min(2, "First name must be at least 2 characters"),
    lastName: z.string().nonempty("Last name is required").min(2, "Last name must be at least 2 characters"),
    country: z.string().nonempty("Country is required"),
    preferredModule: z.string().nonempty("Preferred module is required"),
});

export const GoogleAuthSchema = z.object({
    idToken: z.string().nonempty("ID Token is required"),
    country: z.string().nonempty("Country is required"),
    preferredModule: z.string().nonempty("Preferred module is required"),
});
```

**Replace entire file with:**
```ts
import { z } from "zod";

// Email login — frontend sends Firebase idToken after signInWithEmailAndPassword
export const UserLoginSchema = z.object({
    idToken: z.string().nonempty("ID Token is required"),
});

// Email signup — frontend sends raw credentials + profile data (NO Firebase idToken)
// Backend will create the Firebase user itself using Admin SDK
export const UserSignupSchema = z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().nonempty("First name is required").min(2, "First name must be at least 2 characters"),
    lastName: z.string().nonempty("Last name is required").min(2, "Last name must be at least 2 characters"),
    country: z.string().nonempty("Country is required"),
    preferredModule: z.string().nonempty("Preferred module is required"),
});

// Google auth — handles BOTH signup and login
// First call: just idToken (to check if user exists)
// Second call (if profile_required): idToken + country + preferredModule
export const GoogleAuthSchema = z.object({
    idToken: z.string().nonempty("ID Token is required"),
    country: z.string().optional(),
    preferredModule: z.string().optional(),
});
```

**Why each change:**
- `UserSignupSchema`: Removed `idToken`, added `email` and `password`. The backend now creates the Firebase user, so it needs raw credentials instead of a token.
- `GoogleAuthSchema`: Made `country` and `preferredModule` optional. The first call (to check if user exists) won't have them. The second call (to create the user) will.
- `UserLoginSchema`: Unchanged — email login still sends a Firebase idToken from the frontend.

### Step 1.2: Rewrite the signup controller method

**File:** `mpc-api/src/modules/authentication/controllers/user-auth.controller.ts`

**Find the `signup` method (lines 39-111). Replace the ENTIRE method with:**

```ts
    async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password, firstName, lastName, country, preferredModule } = req.body;

            // Step 1: Check if a user with this email already exists in the database
            const existingUser = await this.prismaService.getUserBy("email", email);
            if (existingUser) {
                this.httpService.Response({
                    res,
                    statuscode: StatusCode.CONFLICT,
                    status: responseStatus.error,
                    message: "User already exists",
                });
                return;
            }

            // Step 2: Create the Firebase user using Admin SDK
            // This keeps Firebase user creation on the server side,
            // so if the DB insert fails we can clean up the Firebase user
            let firebaseUser;
            try {
                firebaseUser = await admin.auth().createUser({
                    email,
                    password,
                    displayName: `${firstName} ${lastName}`,
                });
            } catch (firebaseError: any) {
                // Firebase-specific errors (e.g., email already in use in Firebase but not in our DB)
                const message = firebaseError.code === "auth/email-already-exists"
                    ? "An account with this email already exists"
                    : "Failed to create account";
                this.httpService.Response({
                    res,
                    statuscode: StatusCode.CONFLICT,
                    status: responseStatus.error,
                    message,
                });
                return;
            }

            // Step 3: Create the user in our database
            let newUser;
            try {
                newUser = await this.prismaService.prisma.user.create({
                    data: {
                        firstName,
                        lastName,
                        email,
                        firebaseId: firebaseUser.uid,
                        country,
                        preferredModule,
                        authType: authTypes.email,
                        emailVerified: false,
                    },
                });
            } catch (dbError) {
                // CRITICAL: If DB insert fails, delete the Firebase user to avoid orphaned accounts
                await admin.auth().deleteUser(firebaseUser.uid);
                throw dbError; // Re-throw to be caught by outer catch → sends 500
            }

            // Step 4: Send email verification link
            // This is non-blocking — we don't wait for the user to verify
            try {
                const verificationLink = await admin.auth().generateEmailVerificationLink(email);
                // TODO: Send this link via your email service if you want custom emails
                // For now, Firebase handles sending the verification email automatically
                // when using generateEmailVerificationLink or you can trigger it differently
            } catch {
                // Non-critical — don't fail signup if verification email fails
            }

            // Step 5: Sign our own JWT for session management
            const token = jwt.sign(
                {
                    id: newUser.id,
                    firebaseId: firebaseUser.uid,
                    email: newUser.email,
                },
                env.JWT_SECRET as string,
                {
                    expiresIn: env.JWT_EXPIRES_IN || "7d",
                } as SignOptions
            );

            const expiresIn = env.JWT_EXPIRES_IN || "7d";
            const maxAge = this.parseExpirationToMs(expiresIn);

            // Step 6: Respond with user data and set auth cookie
            this.httpService.Response({
                res,
                statuscode: StatusCode.CREATED,
                status: responseStatus.success,
                message: "User created successfully",
                data: {
                    user: {
                        firstName: newUser.firstName,
                        lastName: newUser.lastName,
                        email: newUser.email,
                    },
                },
                cookie: {
                    name: "auth_token",
                    value: token,
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge,
                },
            });
        } catch (err) {
            next(err);
        }
    }
```

**Line-by-line reasoning for what changed:**
1. `req.body` now destructures `email, password` instead of `idToken` — because the frontend sends raw credentials.
2. We check for existing user by `email` first (before touching Firebase) — fast DB check avoids unnecessary Firebase calls.
3. `admin.auth().createUser()` replaces the frontend's `createUserWithEmailAndPassword()` — this is the core architectural change.
4. If `prisma.user.create()` fails, we call `admin.auth().deleteUser()` to clean up — this is the atomic rollback that prevents orphaned accounts.
5. `generateEmailVerificationLink` replaces the frontend's `sendEmailVerification` — since the user was created server-side, we use the Admin SDK to trigger verification.
6. JWT signing and cookie setting are unchanged.
7. All references to `JWT_ExPIRES_IN` are now `JWT_EXPIRES_IN` (fixing the typo from Bug 1).

### Step 1.3: Rewrite the Google auth controller method

**File:** `mpc-api/src/modules/authentication/controllers/user-auth.controller.ts`

**Find the `googleAuthentication` method (lines 113-179). Replace the ENTIRE method with:**

```ts
    async googleAuthentication(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { idToken, country, preferredModule } = req.body;

            // Step 1: Verify the Google Firebase token
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const { uid: firebaseId, email, email_verified, name: displayName } = decodedToken;

            // Step 2: Check if user exists in our database
            const existingUser = await this.prismaService.getUserBy("firebaseId", firebaseId);

            // Step 3a: If user exists → log them in
            if (existingUser) {
                const token = jwt.sign(
                    {
                        id: existingUser.id,
                        firebaseId,
                        email: existingUser.email,
                    },
                    env.JWT_SECRET as string,
                    {
                        expiresIn: env.JWT_EXPIRES_IN || "7d",
                    } as SignOptions
                );

                const expiresIn = env.JWT_EXPIRES_IN || "7d";
                const maxAge = this.parseExpirationToMs(expiresIn);

                this.httpService.Response({
                    res,
                    statuscode: StatusCode.OK,
                    status: responseStatus.success,
                    message: "User logged in successfully",
                    data: {
                        user: {
                            firstName: existingUser.firstName,
                            lastName: existingUser.lastName,
                            email: existingUser.email,
                            currentResumeId: existingUser.currentResumeId,
                        },
                    },
                    cookie: {
                        name: "auth_token",
                        value: token,
                        httpOnly: true,
                        secure: true,
                        sameSite: "none",
                        maxAge,
                    },
                });
                return;
            }

            // Step 3b: User doesn't exist → check if profile data was provided
            if (!country || !preferredModule) {
                // First call — tell frontend to collect profile data
                // Return the user's Google display name so frontend can show it
                this.httpService.Response({
                    res,
                    statuscode: StatusCode.OK,
                    status: responseStatus.success,
                    message: "Profile required",
                    data: {
                        profileRequired: true,
                        displayName: displayName || "",
                        email: email || "",
                    },
                });
                return;
            }

            // Step 3c: Profile data provided → create the user
            const [firstName, ...lastNameParts] = displayName ? displayName.split(" ") : ["", ""];
            const lastName = lastNameParts.join(" ") || "";

            const newUser = await this.prismaService.prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email: email || "",
                    firebaseId,
                    country,
                    preferredModule,
                    authType: authTypes.google,
                    emailVerified: email_verified || false,
                },
            });

            const token = jwt.sign(
                {
                    id: newUser.id,
                    firebaseId,
                    email: newUser.email,
                },
                env.JWT_SECRET as string,
                {
                    expiresIn: env.JWT_EXPIRES_IN || "7d",
                } as SignOptions
            );

            const expiresIn = env.JWT_EXPIRES_IN || "7d";
            const maxAge = this.parseExpirationToMs(expiresIn);

            this.httpService.Response({
                res,
                statuscode: StatusCode.CREATED,
                status: responseStatus.success,
                message: "User created successfully",
                data: {
                    user: {
                        firstName: newUser.firstName,
                        lastName: newUser.lastName,
                        email: newUser.email,
                    },
                },
                cookie: {
                    name: "auth_token",
                    value: token,
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge,
                },
            });
        } catch (err) {
            next(err);
        }
    }
```

**Line-by-line reasoning for what changed:**
1. One method now handles BOTH Google login and signup (replaces the old `googleAuthentication` + `login` for Google users).
2. `country` and `preferredModule` may be undefined (made optional in the schema).
3. If user exists → immediate login. No "profile_required" check needed — they're already registered.
4. If user doesn't exist AND no profile data → respond with `{ profileRequired: true }` plus the Google display name and email. Status 200 (not an error — this is an expected flow state).
5. If user doesn't exist AND profile data provided → create user and log in.
6. Name parsing fixed: `displayName.split(" ")` now uses rest syntax `const [firstName, ...lastNameParts]` so "Mary Jane Watson" → firstName="Mary", lastName="Jane Watson" instead of dropping "Watson".
7. All `JWT_ExPIRES_IN` → `JWT_EXPIRES_IN`.

### Step 1.4: Update the login method

**File:** `mpc-api/src/modules/authentication/controllers/user-auth.controller.ts`

The `login` method (lines 181-241) is mostly correct but needs minor fixes. **Replace the ENTIRE method with:**

```ts
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { idToken } = req.body;

            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const { uid: firebaseId } = decodedToken;

            const user = await this.prismaService.getUserBy("firebaseId", firebaseId);

            if (!user) {
                this.httpService.Response({
                    res,
                    statuscode: StatusCode.NOTFOUND_ERROR,
                    status: responseStatus.error,
                    message: "User not found. Please sign up first.",
                });
                return;
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    firebaseId,
                    email: user.email,
                },
                env.JWT_SECRET as string,
                {
                    expiresIn: env.JWT_EXPIRES_IN || "7d",
                } as SignOptions
            );

            const expiresIn = env.JWT_EXPIRES_IN || "7d";
            const maxAge = this.parseExpirationToMs(expiresIn);

            this.httpService.Response({
                res,
                statuscode: StatusCode.OK,
                status: responseStatus.success,
                message: "User logged in successfully",
                data: {
                    user: {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        currentResumeId: user.currentResumeId,
                    },
                },
                cookie: {
                    name: "auth_token",
                    value: token,
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge,
                },
            });
        } catch (err) {
            next(err);
        }
    }
```

**What changed:** Only `JWT_ExPIRES_IN` → `JWT_EXPIRES_IN` (3 occurrences). Logic is identical.

### Step 1.5: Update the `me` and `logout` methods

**File:** `mpc-api/src/modules/authentication/controllers/user-auth.controller.ts`

In the `me` method (lines 243-291) and `logout` method (lines 293-341):

**Only change:** Replace `env.JWT_ExPIRES_IN` with `env.JWT_EXPIRES_IN` if it appears. Check each method — `me` doesn't use it, `logout` doesn't use it. So **no changes needed** to these methods.

### Step 1.6: Update the routes file

**File:** `mpc-api/src/modules/authentication/routes/user-auth.route.ts`

**Current content:**
```ts
import { NextFunction, Request, Response, Router } from "express";
import { container } from "tsyringe";
import UserAuthController from "../controllers/user-auth.controller";
import { validationMiddleware } from "../../../common/middlewares/validation.middleware";
import { GoogleAuthSchema, UserLoginSchema, UserSignupSchema } from "../validation/user-auth.schema";

const userAuthRouter = Router();
const controller = container.resolve(UserAuthController);

userAuthRouter.post("/login", validationMiddleware({ body: UserLoginSchema }), (req: Request, res: Response, next: NextFunction) => controller.login(req, res, next));
userAuthRouter.post("/google-authentication", validationMiddleware({ body: GoogleAuthSchema }), (req: Request, res: Response, next: NextFunction) => controller.googleAuthentication(req, res, next));
userAuthRouter.post("/signup", validationMiddleware({ body: UserSignupSchema }), (req: Request, res: Response, next: NextFunction) => controller.signup(req, res, next));
userAuthRouter.get("/me", (req: Request, res: Response, next: NextFunction) => controller.me(req, res, next));
userAuthRouter.post("/logout", (req: Request, res: Response, next: NextFunction) => controller.logout(req, res, next));

export default userAuthRouter;
```

**Replace line 11 (the google-authentication route):**

Change:
```ts
userAuthRouter.post("/google-authentication", validationMiddleware({ body: GoogleAuthSchema }), (req: Request, res: Response, next: NextFunction) => controller.googleAuthentication(req, res, next));
```

To:
```ts
userAuthRouter.post("/google", validationMiddleware({ body: GoogleAuthSchema }), (req: Request, res: Response, next: NextFunction) => controller.googleAuthentication(req, res, next));
```

**Why:** The endpoint changes from `/v1/auth/google-authentication` to `/v1/auth/google`. Shorter, cleaner. All other routes stay the same.

### Step 1.7: Verify — after all backend changes, run the API

```bash
cd /Users/mac/Documents/mpc/mpc-api
npm run build   # or whatever the build command is — check package.json
```

Confirm there are no TypeScript compilation errors. If `env.JWT_ExPIRES_IN` is referenced anywhere else in the codebase, those must also be updated to `env.JWT_EXPIRES_IN`.

**Search for any remaining references:**
```bash
grep -r "JWT_ExPIRES_IN" src/
```

All occurrences must be changed to `JWT_EXPIRES_IN`.

---

## Phase 2: Frontend Changes — Sign-Up Flow (mpc-web)

### Step 2.1: Simplify the Zustand store — remove idToken

**File:** `mpc-web/stores/useSignupStore.ts`

The `idToken` field is no longer needed — the frontend never gets a Firebase token during email signup, and for Google, we'll handle it differently (sessionStorage, not Zustand).

**Current `SignupState` interface (lines 4-35):**

Remove `idToken` from the interface. Change line 24 from:
```ts
  idToken: string;
```
**Delete this line entirely.**

**Current `initialState` (lines 37-48):**

Remove `idToken` from initialState. Change line 46 from:
```ts
  idToken: "",
```
**Delete this line entirely.**

**Current `clearSensitiveData` (lines 70-76):**

Remove `idToken` from the clear function. Change:
```ts
      clearSensitiveData: () =>
        set((state) => ({
          ...state,
          password: "",
          confirmPassword: "",
          idToken: "",
        })),
```
To:
```ts
      clearSensitiveData: () =>
        set((state) => ({
          ...state,
          password: "",
          confirmPassword: "",
        })),
```

Also remove `clearSensitiveData` from the `Omit` in the `setField` type (line 28). It currently says:
```ts
  setField: <K extends keyof Omit<SignupState, "setField" | "reset" | "clearSensitiveData" | "setStep">>(
```
This stays the same — `clearSensitiveData` is still a method, it just no longer clears `idToken`.

### Step 2.2: Rewrite the getting-started page

**File:** `mpc-web/app/auth/getting-started/page.tsx`

This is the biggest frontend change. The entire file needs to be rewritten. **Replace the full contents with:**

```tsx
"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FormSection from "@/components/getting-started/step1";
import FormSection2 from "@/components/getting-started/step2";
import FormSection3 from "@/components/getting-started/step3";
import FormSection4 from "@/components/getting-started/step4";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";
import { useSignupStore } from "@/stores/useSignupStore";

function SignupContent() {
  const searchParams = useSearchParams();
  const authType = searchParams.get("authType") as "email" | "google" | null;
  const router = useRouter();
  const { toast, showToast } = useToast();

  // Zustand store — note: no idToken anymore
  const {
    currentStep,
    email,
    password,
    confirmPassword,
    firstname,
    lastname,
    country,
    career,
    authType: storedAuthType,
    setField,
    setStep,
    reset,
    clearSensitiveData,
  } = useSignupStore();

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration — wait for Zustand persist to rehydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Sync authType from URL into store
  useEffect(() => {
    if (!isHydrated) return;

    if (authType && authType !== storedAuthType) {
      setField("authType", authType);

      if (authType === "google") {
        // Google users skip steps 1 (email/password) and 2 (name) — start at step 3 (country)
        setStep(3);
      } else if (currentStep === 0) {
        setStep(1);
      }
    }
  }, [authType, storedAuthType, isHydrated, currentStep, setField, setStep]);

  const clearError = (fieldName: string) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const validateStep = () => {
    const errors: { [key: string]: string } = {};
    if (currentStep === 1) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Invalid email";
      }
      if (
        !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^_\-~])[A-Za-z\d@$!%*?&#^_\-~]{8,}$/.test(
          password,
        )
      ) {
        errors.password =
          "Password must be at least 8 characters, include an uppercase letter, a number, and a special character";
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    } else if (currentStep === 2) {
      if (!firstname.trim()) {
        errors.firstname = "Firstname is required";
      }
      if (!lastname.trim()) {
        errors.lastname = "Lastname is required";
      }
    } else if (currentStep === 3) {
      if (!country.trim()) {
        errors.country = "Country is required";
      }
    } else if (currentStep === 4) {
      if (!career.trim()) {
        errors.career = "Career is required";
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Email signup — sends raw credentials + profile to backend
  // Backend creates Firebase user + DB user atomically
  const handleEmailSignup = async () => {
    setIsLoading(true);
    try {
      const apiService = (await import("@/lib/api/apiService")).apiService;

      await apiService.post("/v1/auth/signup", {
        email,
        password,
        firstName: firstname,
        lastName: lastname,
        country,
        preferredModule: career,
      });

      // Success — backend set the auth_token cookie
      showToast("success", "Account created successfully!");
      clearSensitiveData();
      reset();
      router.push("/home");
    } catch (error: unknown) {
      const err = error as any;
      const errorMessage =
        err?.response?.data?.message || (error instanceof Error ? error.message : "An error occurred");
      showToast("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Google signup — sends idToken + profile to backend
  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const apiService = (await import("@/lib/api/apiService")).apiService;
      const idToken = sessionStorage.getItem("googleIdToken");

      if (!idToken) {
        showToast("error", "Google authentication expired. Please try again.");
        router.push("/auth/sign-up");
        return;
      }

      await apiService.post("/v1/auth/google", {
        idToken,
        country,
        preferredModule: career,
      });

      // Success — backend set the auth_token cookie
      sessionStorage.removeItem("googleIdToken");
      showToast("success", "Account created successfully!");
      reset();
      router.push("/home");
    } catch (error: unknown) {
      const err = error as any;
      const errorMessage =
        err?.response?.data?.message || (error instanceof Error ? error.message : "An error occurred");
      showToast("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      const effectiveAuthType = storedAuthType || authType;

      if (currentStep === 4) {
        // Final step — submit to backend
        if (effectiveAuthType === "google") {
          handleGoogleSignup();
        } else {
          handleEmailSignup();
        }
      } else {
        // Not final step — just advance
        setValidationErrors({});
        setStep(Math.min(currentStep + 1, 4));
      }
    }
  };

  const handleBack = () => {
    setValidationErrors({});
    const effectiveAuthType = storedAuthType || authType;
    const minStep = effectiveAuthType === "google" ? 3 : 1;
    setStep(Math.max(currentStep - 1, minStep));
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-white px-4 pb-24 sm:pb-28 md:pb-32"
      style={{
        backgroundImage: "url('/background.svg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <img
        src="/logo.svg"
        alt="Logo"
        className="absolute w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-[4.75vw] lg:h-[7.34vh] top-4 left-4 sm:top-6 sm:left-6 lg:top-[6.15vh] lg:left-[6.31vw]"
      />

      <div className="flex items-center justify-center w-[80%] sm:w-[60%] md:w-[45%] lg:w-[32.75vw] h-1 sm:h-1.5 bg-gray-300 relative mt-20 sm:mt-24 md:mt-28 lg:mt-[20.8vh] rounded-full">
        <div
          className="absolute top-0 left-0 h-full bg-[#A393FF] rounded-full transition-all duration-300"
          style={{
            width: `${(currentStep / 4) * 100}%`,
          }}
        ></div>
      </div>

      <div className="flex flex-col items-center justify-center w-full mt-8 sm:mt-12 md:mt-16 lg:mt-20 px-4 sm:px-6 md:px-8">
        {currentStep === 1 && (
          <FormSection
            email={email}
            password={password}
            setEmail={(value) => {
              setField("email", value);
              clearError("email");
            }}
            setPassword={(value) => {
              setField("password", value);
              clearError("password");
            }}
            confirmPassword={confirmPassword}
            setConfirmPassword={(value) => {
              setField("confirmPassword", value);
              clearError("confirmPassword");
            }}
            validationErrors={validationErrors}
          />
        )}
        {currentStep === 2 && (
          <FormSection2
            setFirstname={(value) => {
              setField("firstname", value);
              clearError("firstname");
            }}
            firstname={firstname}
            lastname={lastname}
            setLastname={(value) => {
              setField("lastname", value);
              clearError("lastname");
            }}
            validationErrors={validationErrors}
          />
        )}
        {currentStep === 3 && (
          <FormSection3
            country={country}
            setCountry={(value) => {
              setField("country", value);
              clearError("country");
            }}
            validationErrors={validationErrors}
          />
        )}
        {currentStep === 4 && (
          <FormSection4
            career={career}
            setCareer={(value) => {
              setField("career", value);
              clearError("career");
            }}
            validationErrors={validationErrors}
          />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex justify-between w-full px-4 sm:px-8 md:px-16 lg:px-40 py-4 sm:py-6 bg-white/80 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none">
        <button
          className="bg-white shadow-xl text-[#6549CC] px-4 sm:px-6 py-2 sm:py-3 rounded-[16px] font-bold font-railway text-xs sm:text-sm border border-[#6549CC] hover:bg-gray-50 transition-colors"
          onClick={handleBack}
        >
          Back
        </button>
        <button
          className="bg-[#6549CC] shadow-xl text-[#FFE5DF] px-4 sm:px-6 py-2 sm:py-3 rounded-[16px] font-bold font-railway text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5a3fc2] transition-colors"
          onClick={handleNext}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Next"}
        </button>
      </div>

      <Toast toast={toast} />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
```

**Key differences from the old version — line-by-line reasoning:**

1. **Removed import** of `verifyAuth` from `@/services/auth` (line 8 old file) — no longer needed. The backend sets the cookie on signup; we don't need to verify it immediately.
2. **Removed `idToken`** from the Zustand destructuring (line 29 old file) — it's no longer in the store.
3. **Removed `handleEmailAuth` function** (old lines 114-148) — this was the function that called `createUserWithEmailAndPassword` on the frontend. Replaced by `handleEmailSignup` which sends raw credentials to backend.
4. **New `handleEmailSignup` function** — sends `{ email, password, firstName, lastName, country, preferredModule }` to `POST /v1/auth/signup`. No Firebase interaction.
5. **New `handleGoogleSignup` function** — reads `googleIdToken` from sessionStorage, sends it with profile data to `POST /v1/auth/google`.
6. **Simplified `handleNext`** — no longer has the special case for `effectiveAuthType === "email" && currentStep === 1`. Every step just advances. Only the final step (4) triggers the backend call.
7. **Removed `verifyAuth()` call** after signup — the backend already sets the cookie during the signup response. Calling `/me` immediately after is redundant.
8. **Password regex updated** — added `#^_\-~` to the allowed special character class to match more real-world passwords.
9. **All UI/styling is preserved exactly** — the JSX structure, class names, and layout are identical.

### Step 2.3: Rewrite the sign-up page (Google button)

**File:** `mpc-web/app/auth/sign-up/page.tsx`

**Find `handleGoogleSignUp` (lines 18-57). Replace the ENTIRE function with:**

```ts
  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // Send to the unified Google endpoint
      const apiService = (await import("@/lib/api/apiService")).apiService;
      const response: any = await apiService.post("/v1/auth/google", { idToken });

      if (response.data?.profileRequired) {
        // New user — need to collect country + preferred module
        sessionStorage.setItem("googleIdToken", idToken);
        router.push("/auth/getting-started?authType=google");
      } else {
        // Existing user — already logged in, cookie is set
        showToast("success", "Welcome back! Login successful.");
        router.push("/home");
      }
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        // User closed the popup — no action needed
      } else {
        const errorMessage =
          error.response?.data?.message || "Google authentication failed";
        showToast("error", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };
```

**What changed — line-by-line reasoning:**
1. Still calls `signInWithPopup` — Google popup must happen on frontend (can't open a popup from the server).
2. Calls `POST /v1/auth/google` with just `{ idToken }` — one endpoint instead of trying `/login` first.
3. Checks `response.data?.profileRequired` — if `true`, new user needs profile data, redirect to getting-started.
4. If not `profileRequired`, user exists and is logged in — cookie already set by backend.
5. **Removed** the raw `axios` import — uses `apiService` instead.
6. **Removed** the nested try/catch that tried login then fell back to signup — one call handles both.

Also **remove the unused import** on line 9:
```ts
import { signInWithPopup } from "firebase/auth";
```
This import stays — it's still used. But remove the `axios` import if it was there (it wasn't in sign-up, but verify).

### Step 2.4: Rewrite the login page

**File:** `mpc-web/app/auth/log-in/page.tsx`

This file has multiple bugs (raw axios, wrong env var, missing `/`). Replace the entire file contents with:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiService } from "@/lib/api/apiService";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast } = useToast();

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email";
    }

    if (!password.trim()) {
      errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Firebase client SDK verifies the password — Admin SDK cannot do this
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();

      // Send the verified token to our backend
      await apiService.post("/v1/auth/login", { idToken });

      setValidationErrors({});
      showToast("success", "Login successful!");
      router.push("/home");
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "Email not found";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showToast("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { signInWithPopup, GoogleAuthProvider } =
        await import("firebase/auth");
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Use the unified Google endpoint
      const response: any = await apiService.post("/v1/auth/google", { idToken });

      if (response.data?.profileRequired) {
        // New user trying to log in — they need to sign up first
        // Store the token and redirect to profile collection
        sessionStorage.setItem("googleIdToken", idToken);
        router.push("/auth/getting-started?authType=google");
      } else {
        // Existing user — logged in successfully
        setValidationErrors({});
        showToast("success", "Login successful!");
        router.push("/home");
      }
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        // User closed popup — ignore
      } else {
        let errorMessage = "Google login failed";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        showToast("error", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white px-4 py-8"
      style={{
        backgroundImage: "url('/background.svg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-4xl gap-8 lg:gap-12 lg:px-8">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.svg"
            alt="Logo"
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56"
            style={{
              borderRadius: "4rem",
            }}
            width={299}
            height={299}
          />
          <p className="text-center font-display font-semibold text-xl sm:text-2xl md:text-3xl lg:text-[3rem] lg:leading-[3rem] tracking-normal text-[#5A3FFF] mt-4">
            Intelligent Counsel, <br /> Anytime, Anywhere.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-[#5A3FFF] font-railway">
            Log In
          </h2>

          <form
            className="w-full space-y-3 sm:space-y-4"
            onSubmit={handleEmailLogin}
          >
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) {
                    setValidationErrors({ ...validationErrors, email: "" });
                  }
                }}
                placeholder="Enter your email"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A3FFF] focus:ring-2 focus:ring-[#5A3FFF] focus:ring-opacity-20 font-railway text-sm w-full"
              />
              {validationErrors.email && (
                <p className="text-xs text-red-500">{validationErrors.email}</p>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) {
                    setValidationErrors({ ...validationErrors, password: "" });
                  }
                }}
                placeholder="Enter your password"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A3FFF] focus:ring-2 focus:ring-[#5A3FFF] focus:ring-opacity-20 font-railway text-sm w-full"
              />
              {validationErrors.password && (
                <p className="text-xs text-red-500">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {validationErrors.submit && (
              <p className="text-xs text-red-500 text-center">
                {validationErrors.submit}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5A3FFF] text-[#FFD0C5] font-bold font-railway rounded-xl py-3 hover:bg-[#4a2fe8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="w-full flex items-center gap-3">
            <hr className="flex-1 border-gray-300" />
            <span className="text-xs text-gray-500">Or</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white text-[#6549CC] font-bold font-railway text-sm rounded-lg shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-3 flex items-center justify-center gap-2 border border-gray-200"
          >
            <img
              src="/google-button.svg"
              alt="Google Icon"
              className="w-4 h-4"
            />
            Continue with Google
          </button>

          <p className="text-sm text-gray-600 text-center">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => router.push("/auth/sign-up")}
              className="text-[#5A3FFF] font-bold hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
```

**What changed from the old login page — line-by-line reasoning:**
1. **Removed** `import axios from "axios"` (old line 10) — replaced with `import { apiService } from "@/lib/api/apiService"` (line 8).
2. **`handleEmailLogin`:** Replaced `axios.post(\`${process.env.NEXT_PUBLIC_API_BASE_URL}v1/auth/login\`, ...)` with `apiService.post("/v1/auth/login", ...)`. This fixes:
   - The missing `/` bug (old line 54)
   - The wrong env var (`NEXT_PUBLIC_API_BASE_URL` vs `NEXT_PUBLIC_API_URL`)
   - Missing `withCredentials` (already configured on the apiService's axios instance)
3. **`handleGoogleLogin`:** Now calls `POST /v1/auth/google` instead of `POST /v1/auth/login`. Checks for `profileRequired` — if a Google user tries to "log in" but has no account, they're redirected to the profile collection flow instead of seeing an error.
4. **All UI/styling preserved exactly** — the JSX is identical to the original.

### Step 2.5: Clean up services/auth.ts

**File:** `mpc-web/services/auth.ts`

The `signUpWithEmail` function is no longer used (the getting-started page handles signup directly). `verifyAuth` is still potentially useful. **Replace the entire file with:**

```ts
import { apiService } from "@/lib/api/apiService";

export const verifyAuth = async () => {
  try {
    const response = await apiService.get("/v1/auth/me");
    return { response };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
```

**What changed:** Removed `signUpWithEmail` function (lines 8-37) and the Firebase imports (`auth`, `createUserWithEmailAndPassword`, `sendEmailVerification`) — none of these are used anymore for signup.

---

## Phase 3: Frontend Changes — Fix the 401 Interceptor (mpc-web)

### Step 3.1: Fix the axios response interceptor

**File:** `mpc-web/lib/api/axios.ts`

**Find lines 29-49 (the response interceptor). Replace with:**

```ts
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Auth cookie expired or invalid — redirect to login
      window.location.href = "/auth/log-in";
    }
    return Promise.reject(error);
  },
);
```

**What changed — line-by-line reasoning:**
1. Removed `originalRequest._retry` logic — there's no token refresh mechanism, so retrying is pointless.
2. Removed the empty try/catch that made the redirect unreachable.
3. Simple: if 401, redirect to login. Always.
4. Still rejects the error so calling code can handle it if needed.

---

## Phase 4: Verification Checklist

After ALL changes are implemented, verify each flow manually:

### Test 1: Email Sign-Up
1. Go to `http://localhost:3000/auth/sign-up`
2. Click "Get started with Email"
3. Fill in email, password, confirm password → click Next
4. Fill in first name, last name → click Next
5. Select country → click Next
6. Select preferred module → click Next
7. **Expected:** Toast "Account created successfully!", redirected to `/home`
8. **Verify:** Check browser DevTools → Application → Cookies → `auth_token` cookie exists
9. **Verify:** Refresh the page — user should still be logged in (cookie persists)

### Test 2: Email Login
1. Go to `http://localhost:3000/auth/log-in`
2. Enter the same email and password from Test 1
3. Click "Log In"
4. **Expected:** Toast "Login successful!", redirected to `/home`

### Test 3: Google Sign-Up (new user)
1. Go to `http://localhost:3000/auth/sign-up`
2. Click "Continue with Google"
3. Complete Google popup
4. **Expected:** Redirected to getting-started page at Step 3 (country)
5. Select country → click Next
6. Select preferred module → click Next
7. **Expected:** Toast "Account created successfully!", redirected to `/home`

### Test 4: Google Login (existing user)
1. Go to `http://localhost:3000/auth/log-in`
2. Click "Continue with Google" (same Google account)
3. **Expected:** Toast "Login successful!", redirected to `/home` (no profile form)

### Test 5: Google on Sign-Up page (existing user)
1. Go to `http://localhost:3000/auth/sign-up`
2. Click "Continue with Google" (same Google account)
3. **Expected:** Toast "Welcome back! Login successful.", redirected to `/home` (no profile form)

### Test 6: Refresh resilience
1. Start email signup, complete Steps 1-3
2. Refresh the browser
3. **Expected:** User returns to Step 4 (data persisted in localStorage). No orphaned Firebase account exists because Firebase user hasn't been created yet.

### Test 7: Error handling — duplicate email
1. Try to sign up with an email that already exists
2. **Expected:** Backend returns "User already exists" or "An account with this email already exists" — no orphaned Firebase account

---

## File Change Summary

### mpc-api (backend):
| File | Action |
|------|--------|
| `src/common/config/env.config.ts` | Fix template literals, fix `SECRET` → `JWT_SECRET`, fix typo `JWT_ExPIRES_IN` → `JWT_EXPIRES_IN` |
| `src/modules/authentication/validation/user-auth.schema.ts` | Rewrite — new schemas for redesigned endpoints |
| `src/modules/authentication/controllers/user-auth.controller.ts` | Rewrite `signup`, `googleAuthentication`, minor fix in `login`. Fix all `JWT_ExPIRES_IN` references |
| `src/modules/authentication/routes/user-auth.route.ts` | Change `/google-authentication` to `/google` |

### mpc-web (frontend):
| File | Action |
|------|--------|
| `stores/useSignupStore.ts` | Remove `idToken` field |
| `app/auth/getting-started/page.tsx` | Full rewrite — no Firebase on frontend for signup |
| `app/auth/sign-up/page.tsx` | Rewrite `handleGoogleSignUp` — use unified `/google` endpoint |
| `app/auth/log-in/page.tsx` | Full rewrite — use apiService, unified `/google` endpoint |
| `services/auth.ts` | Remove `signUpWithEmail`, keep `verifyAuth` |
| `lib/api/axios.ts` | Fix 401 interceptor |
