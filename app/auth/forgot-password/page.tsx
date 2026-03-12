/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast, showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setValidationError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError("Invalid email");
      return;
    }

    setIsLoading(true);
    setValidationError("");

    try {
      const apiService = (await import("@/lib/api/apiService")).apiService;
      await apiService.post("/v1/auth/forgot-password", { email });
      setIsSubmitted(true);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong. Please try again.";
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
      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-4xl gap-8 lg:gap-12 lg:px-8">
        {/* Left side - Logo and tagline */}
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

        {/* Right side - Form */}
        <div className="flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-[#5A3FFF] font-railway">
            Forgot Password
          </h2>

          {isSubmitted ? (
            <div className="w-full space-y-4 text-center">
              <p className="text-sm text-gray-600 font-railway">
                If an account with that email exists, we&apos;ve sent a password
                reset link. Please check your inbox.
              </p>
              <button
                onClick={() => router.push("/auth/log-in")}
                className="w-full bg-[#5A3FFF] text-[#FFD0C5] font-bold font-railway rounded-xl py-3 hover:bg-[#4a2fe8] transition-colors shadow-lg"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 text-center font-railway">
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </p>

              <form
                className="w-full space-y-3 sm:space-y-4"
                onSubmit={handleSubmit}
              >
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationError) setValidationError("");
                    }}
                    placeholder="Enter your email"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A3FFF] focus:ring-2 focus:ring-[#5A3FFF] focus:ring-opacity-20 font-railway text-sm w-full"
                  />
                  {validationError && (
                    <p className="text-xs text-red-500">{validationError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#5A3FFF] text-[#FFD0C5] font-bold font-railway rounded-xl py-3 hover:bg-[#4a2fe8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="text-sm text-gray-600 text-center">
                Remember your password?{" "}
                <button
                  onClick={() => router.push("/auth/log-in")}
                  className="text-[#5A3FFF] font-bold hover:underline"
                >
                  Log in
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
