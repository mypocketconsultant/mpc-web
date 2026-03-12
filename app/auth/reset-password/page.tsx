/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const { toast, showToast } = useToast();

  // Verify token on page load
  useEffect(() => {
    if (!token) {
      router.push("/auth/log-in");
      return;
    }

    const verifyToken = async () => {
      try {
        const apiService = (await import("@/lib/api/apiService")).apiService;
        await apiService.post("/v1/auth/verify-reset-token", { token });
        setIsTokenValid(true);
      } catch {
        setIsTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, router]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!newPassword.trim()) {
      errors.newPassword = "Password is required";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const apiService = (await import("@/lib/api/apiService")).apiService;
      await apiService.post("/v1/auth/reset-password", {
        token,
        newPassword,
      });
      showToast(
        "success",
        "Password reset successful. Please log in with your new password.",
      );
      setTimeout(() => {
        router.push("/auth/log-in");
      }, 2000);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to reset password. Please try again.";
      showToast("error", errorMessage);

      // If token is expired/invalid, update state so user sees the expired view
      if (error?.response?.status === 400) {
        setIsTokenValid(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-white"
        style={{
          backgroundImage: "url('/background.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="animate-pulse text-gray-500 font-railway">
          Verifying reset link...
        </div>
      </div>
    );
  }

  // Token is invalid or expired
  if (!isTokenValid) {
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
              style={{ borderRadius: "4rem" }}
              width={299}
              height={299}
            />
            <p className="text-center font-display font-semibold text-xl sm:text-2xl md:text-3xl lg:text-[3rem] lg:leading-[3rem] tracking-normal text-[#5A3FFF] mt-4">
              Intelligent Counsel, <br /> Anytime, Anywhere.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-sm text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-[#5A3FFF] font-railway">
              Link Expired
            </h2>
            <p className="text-sm text-gray-600 font-railway">
              This password reset link has expired or is invalid. Please request
              a new one.
            </p>
            <button
              onClick={() => router.push("/auth/forgot-password")}
              className="w-full bg-[#5A3FFF] text-[#FFD0C5] font-bold font-railway rounded-xl py-3 hover:bg-[#4a2fe8] transition-colors shadow-lg"
            >
              Request a New Link
            </button>
            <button
              onClick={() => router.push("/auth/log-in")}
              className="text-sm text-[#5A3FFF] font-bold hover:underline"
            >
              Back to Login
            </button>
          </div>
        </div>

        <Toast toast={toast} />
      </div>
    );
  }

  // Token is valid — show reset form
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

        {/* Right side - Reset form */}
        <div className="flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-[#5A3FFF] font-railway">
            Reset Password
          </h2>

          <p className="text-sm text-gray-600 text-center font-railway">
            Enter your new password below.
          </p>

          <form
            className="w-full space-y-3 sm:space-y-4"
            onSubmit={handleSubmit}
          >
            {/* New Password field */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (validationErrors.newPassword) {
                      setValidationErrors({
                        ...validationErrors,
                        newPassword: "",
                      });
                    }
                  }}
                  placeholder="Enter new password"
                  className="px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A3FFF] focus:ring-2 focus:ring-[#5A3FFF] focus:ring-opacity-20 font-railway text-sm w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.newPassword && (
                <p className="text-xs text-red-500">
                  {validationErrors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password field */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (validationErrors.confirmPassword) {
                      setValidationErrors({
                        ...validationErrors,
                        confirmPassword: "",
                      });
                    }
                  }}
                  placeholder="Confirm new password"
                  className="px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A3FFF] focus:ring-2 focus:ring-[#5A3FFF] focus:ring-opacity-20 font-railway text-sm w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-xs text-red-500">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5A3FFF] text-[#FFD0C5] font-bold font-railway rounded-xl py-3 hover:bg-[#4a2fe8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
