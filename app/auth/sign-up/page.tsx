/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast } = useToast();

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      // Step 1: Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // Step 2: Call unified /google endpoint
      const apiService = (await import("@/lib/api/apiService")).apiService;
      const response = await apiService.post("/v1/auth/google", { idToken });

      // Step 3: Check if profile is needed
      if (response.data?.profileRequired) {
        // New user — store token and redirect to getting-started
        sessionStorage.setItem("googleIdToken", idToken);
        router.push("/auth/getting-started?authType=google");
      } else {
        // Existing user — logged in successfully
        showToast("success", "Welcome back! Login successful.");
        router.push("/home");
      }
    } catch (error: any) {
      // Handle specific errors
      if (error.code === "auth/popup-closed-by-user") {
        // User closed the popup - no action needed
        return;
      }

      const errorMessage =
        error.response?.data?.message || "Google authentication failed";
      showToast("error", errorMessage);
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
      <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between w-full max-w-4xl gap-8 lg:gap-4 lg:px-8">
        {/* Left side - Logo and tagline */}
        <div className="flex flex-col items-center">
          <Image
            src="/logo.svg"
            alt="Logo"
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-[17vw] lg:h-[27vh]"
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

        {/* Right side - Sign up options */}
        <div className="flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-sm px-4 sm:px-0">
          <h2 className="text-xl sm:text-2xl font-bold text-[#5A3FFF] font-railway">
            Sign Up
          </h2>

          {/* Get started with email button */}
          <button
            className="w-full bg-[#5A3FFF] text-[#FFD0C5] font-bold font-railway rounded-xl py-3 hover:bg-[#4a2fe8] transition-colors shadow-lg text-sm sm:text-base"
            onClick={() => {
              router.push("/auth/getting-started?authType=email");
            }}
          >
            Get started with Email
          </button>

          {/* Divider */}
          <div className="w-full flex items-center gap-3">
            <hr className="flex-1 border-gray-300" />
            <span className="text-xs text-gray-500">Or</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          {/* Google sign up button */}
          <button
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full bg-white text-[#6549CC] font-bold font-railway text-sm rounded-lg shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-3 flex items-center justify-center gap-2 border border-gray-200"
          >
            <Image
              src="/google-button.svg"
              alt="Google Icon"
              className="w-4 h-4"
              width={16}
              height={16}
            />
            {isLoading ? "Loading..." : "Continue with Google"}
          </button>

          {/* Login link */}
          <p className="text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/auth/log-in")}
              className="text-[#5A3FFF] font-bold hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
