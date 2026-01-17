"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

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

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/login`,
        { idToken },
        { withCredentials: true }
      );

      setValidationErrors({});
      router.push("/home");
    } catch (error: any) {
      console.error("[Auth] Login error:", error);

      let errorMessage = "Login failed. Please try again.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "Email not found";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }

      setValidationErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const idToken = await result.user.getIdToken();
  
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/login`,
        { idToken },
        { withCredentials: true }
      );

      setValidationErrors({});
      router.push("/home");
    } catch (error: any) {
      console.error("[Auth] Google login error:", error);

      let errorMessage = "Google login failed";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setValidationErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="flex items-center justify-between w-full max-w-4xl px-8">
        {/* Left side - Logo and tagline */}
        <div className="flex flex-col items-center">
          <Image
            src="/logo.svg"
            alt="Logo"
            style={{
              borderRadius: "4rem",
              width: `${(299 / 1728) * 100}vw`,
              height: `${(299 / 1117) * 100}vh`,
            }}
            width={299}
            height={299}
          />
          <p className="text-center font-display font-semibold text-[3rem] leading-[3rem] tracking-normal text-[#5A3FFF] mt-4">
            Intelligent Counsel, <br /> Anytime, Anywhere.
          </p>
        </div>

        {/* Right side - Login form */}
        <div className="flex flex-col items-center space-y-6 w-full max-w-sm">
          <h2 className="text-2xl font-bold text-[#5A3FFF] font-railway">Log In</h2>

          <form className="w-full space-y-4" onSubmit={handleEmailLogin}>
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
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A3FFF] focus:ring-2 focus:ring-[#5A3FFF] focus:ring-opacity-20 font-railway text-sm"
              />
              {validationErrors.email && (
                <p className="text-xs text-red-500">{validationErrors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
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
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5A3FFF] focus:ring-2 focus:ring-[#5A3FFF] focus:ring-opacity-20 font-railway text-sm"
              />
              {validationErrors.password && (
                <p className="text-xs text-red-500">{validationErrors.password}</p>
              )}
            </div>

            {/* Submit error */}
            {validationErrors.submit && (
              <p className="text-xs text-red-500 text-center">{validationErrors.submit}</p>
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
            Don't have an account?{" "}
            <button
              onClick={() => router.push("/auth/sign-up")}
              className="text-[#5A3FFF] font-bold hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
