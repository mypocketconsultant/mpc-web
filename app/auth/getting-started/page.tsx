"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FormSection from "@/components/getting-started/step1";
import FormSection2 from "@/components/getting-started/step2";
import FormSection3 from "@/components/getting-started/step3";
import FormSection4 from "@/components/getting-started/step4";
import { verifyAuth } from "@/services/auth";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";
import { useSignupStore } from "@/stores/useSignupStore";

function SignupContent() {
  const searchParams = useSearchParams();
  const authType = searchParams.get("authType") as "email" | "google" | null;
  const router = useRouter();
  const { toast, showToast } = useToast();

  // Zustand store
  const {
    currentStep,
    email,
    password,
    confirmPassword,
    firstname,
    lastname,
    country,
    career,
    idToken,
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

  // Handle hydration - wait for store to be ready
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle auth type from URL params
  useEffect(() => {
    if (!isHydrated) return;

    if (authType && authType !== storedAuthType) {
      setField("authType", authType);

      // For Google auth, start at step 3 (skip email/password and name steps)
      if (authType === "google") {
        setStep(3);
        // Retrieve the idToken from sessionStorage for Google auth
        const storedToken = sessionStorage.getItem("googleIdToken");
        if (storedToken) {
          setField("idToken", storedToken);
        }
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
        !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
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

  const handleEmailAuth = async () => {
    setIsLoading(true);
    try {
      // Only create Firebase user and get idToken, don't send to backend yet
      const { auth } = await import("@/lib/firebase");
      const { createUserWithEmailAndPassword, sendEmailVerification } =
        await import("firebase/auth");

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const token = await result.user.getIdToken();

      setField("idToken", token);

      // Send email verification
      await sendEmailVerification(result.user);

      setValidationErrors({});
      showToast(
        "success",
        "Account created! Please check your email for verification.",
      );
      setStep(currentStep + 1);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      showToast("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupCompletion = async () => {
    setIsLoading(true);
    try {
      const apiService = (await import("@/lib/api/apiService")).apiService;
      const effectiveAuthType = storedAuthType || authType;

      if (effectiveAuthType === "email") {
        // Send all collected data to backend for email signup
        await apiService.post("/v1/auth/signup", {
          idToken,
          firstName: firstname,
          lastName: lastname,
          country,
          preferredModule: career,
        });
      } else if (effectiveAuthType === "google") {
        // Send Google auth data to backend
        await apiService.post("/v1/auth/google-authentication", {
          idToken,
          country,
          preferredModule: career,
        });

        // Clear the stored token from sessionStorage
        sessionStorage.removeItem("googleIdToken");
      }

      // Verify auth with the backend
      const verifyResult = await verifyAuth();
      if (verifyResult.error) {
        showToast("error", "Authentication verification failed");
        setIsLoading(false);
        return;
      }

      setValidationErrors({});
      showToast(
        "success",
        effectiveAuthType === "email"
          ? "Account setup complete!"
          : "Google account linked successfully!",
      );

      // Clear sensitive data and reset the store
      clearSensitiveData();
      reset();

      router.push("/home");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      showToast("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      const effectiveAuthType = storedAuthType || authType;
      if (effectiveAuthType === "email" && currentStep === 1) {
        handleEmailAuth();
      } else if (currentStep === 4) {
        handleSignupCompletion();
      } else {
        setValidationErrors({});
        setStep(Math.min(currentStep + 1, 4));
      }
    }
  };

  const handleBack = () => {
    setValidationErrors({});
    const effectiveAuthType = storedAuthType || authType;
    // For Google auth, minimum step is 3 (can't go back to email/name steps)
    const minStep = effectiveAuthType === "google" ? 3 : 1;
    setStep(Math.max(currentStep - 1, minStep));
  };

  // Show loading state while hydrating
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
      {/* Logo - responsive sizing and positioning */}
      <img
        src="/logo.svg"
        alt="Logo"
        className="absolute w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-[4.75vw] lg:h-[7.34vh] top-4 left-4 sm:top-6 sm:left-6 lg:top-[6.15vh] lg:left-[6.31vw]"
      />

      {/* Progress bar - responsive width */}
      <div className="flex items-center justify-center w-[80%] sm:w-[60%] md:w-[45%] lg:w-[32.75vw] h-1 sm:h-1.5 bg-gray-300 relative mt-20 sm:mt-24 md:mt-28 lg:mt-[20.8vh] rounded-full">
        <div
          className="absolute top-0 left-0 h-full bg-[#A393FF] rounded-full transition-all duration-300"
          style={{
            width: `${(currentStep / 4) * 100}%`,
          }}
        ></div>
      </div>

      {/* Form sections - responsive container */}
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

      {/* Navigation buttons - responsive positioning */}
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
