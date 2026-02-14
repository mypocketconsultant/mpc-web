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
