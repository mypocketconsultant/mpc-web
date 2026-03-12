/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiService } from "@/lib/api/apiService";
import axios from "axios";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();

      await apiService.post("/v1/auth/login", { idToken });

      setValidationErrors({});
      showToast("success", "Login successful!");
      window.location.href = "/home";
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "Email not found";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
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

      // Call unified /google endpoint
      const response = await apiService.post<{ profileRequired?: boolean }>(
        "/v1/auth/google",
        { idToken },
      );

      // Check if profile is required (new user)
      if ((response as any)?.profileRequired) {
        // New user — redirect to getting-started
        sessionStorage.setItem("googleIdToken", idToken);
        router.push("/auth/getting-started?authType=google");
        return;
      }

      // Existing user — logged in successfully
      setValidationErrors({});
      showToast("success", "Login successful!");
      window.location.href = "/home";
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        // User closed the popup - no action needed
        return;
      }

      let errorMessage = "Google login failed";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

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

        {/* Right side - Login form */}
        <div className="flex flex-col items-center space-y-4 sm:space-y-6 w-full max-w-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-[#5A3FFF] font-railway">
            Log In
          </h2>

          <form
            className="w-full space-y-3 sm:space-y-4"
            onSubmit={handleEmailLogin}
          >
            {/* Email field */}
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

            {/* Password field */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors({ ...validationErrors, password: "" });
                    }
                  }}
                  placeholder="Enter your password"
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
              {validationErrors.password && (
                <p className="text-xs text-red-500">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push("/auth/forgot-password")}
                className="text-xs text-[#5A3FFF] hover:underline font-medium"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit error */}
            {validationErrors.submit && (
              <p className="text-xs text-red-500 text-center">
                {validationErrors.submit}
              </p>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5A3FFF] text-[#FFD0C5] font-bold font-railway rounded-xl py-3 hover:bg-[#4a2fe8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center gap-3">
            <hr className="flex-1 border-gray-300" />
            <span className="text-xs text-gray-500">Or</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          {/* Google login button */}
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

          {/* Sign up link */}
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
