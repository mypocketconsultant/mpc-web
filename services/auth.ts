import { apiService } from "@/lib/api/apiService";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

export const signUpWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  country: string,
  preferredModule: string
) => {
  try {
    console.log("[Auth] Starting signup process...");
    console.log("[Auth] Email:", email);
    console.log("[Auth] Creating Firebase user...");

    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log("[Auth] Firebase user created successfully");
    console.log("[Auth] Firebase UID:", result.user.uid);

    const idToken = await result.user.getIdToken();
    console.log("[Auth] Got Firebase ID token");

    const user = result.user;

    console.log("[Auth] Sending signup request to backend...");
    console.log("[Auth] Payload:", { firstName, lastName, country, preferredModule });

    const response: any = await apiService.post("/v1/auth/signup", {
      idToken,
      firstName,
      lastName,
      country,
      preferredModule,
    });

    console.log("[Auth] Backend signup response:", response);

    console.log("[Auth] Sending email verification...");
    await sendEmailVerification(user);
    console.log("[Auth] Email verification sent");

    return { response, user };
  } catch (error: any) {
    console.error("[Auth] Signup error:", error);
    console.error("[Auth] Error code:", error.code);
    console.error("[Auth] Error message:", error.message);
    return { error: error.message };
  }
};

export const verifyAuth = async () => {
  try {
    const response = await apiService.get("/v1/auth/me");
    return { response };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
};