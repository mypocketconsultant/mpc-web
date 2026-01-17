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
      console.log("[Auth] Starting Google sign-up...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("[Auth] Google sign-in successful, UID:", result.user.uid);

      const idToken = await result.user.getIdToken();
      console.log("[Auth] Got Firebase ID token");

      // Try to login first to check if user exists
      try {
        const apiService = (await import("@/lib/api/apiService")).apiService;
        await apiService.post("/v1/auth/login", { idToken });

        // User exists! Login successful - redirect to home
        console.log("[Auth] User already exists, logging in directly");
        showToast('success', 'Welcome back! Login successful.');
        router.push("/home");
        return;
      } catch (loginError: any) {
        // Check if it's a 404 (user not found)
        if (loginError.response?.status === 404) {
          // User doesn't exist - proceed with signup
          console.log("[Auth] User doesn't exist, proceeding with signup flow");
          sessionStorage.setItem("googleIdToken", idToken);
          router.push("/auth/getting-started?authType=google");
        } else {
          // Other error - throw to be caught by outer catch block
          throw loginError;
        }
      }
    } catch (error: any) {
      console.error("[Auth] Google sign-up error:", error);
      // Handle specific errors
      if (error.code === "auth/popup-closed-by-user") {
        console.log("[Auth] User closed the popup");
      } else {
        const errorMessage = error.response?.data?.message || 'Google authentication failed';
        showToast('error', errorMessage);
      }
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
      <div className="flex items-center justify-between w-full max-w-4xl">
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
          <p className="text-center font-display font-semibold text-[3rem] leading-[3rem] tracking-normal text-[#5A3FFF]">
            Intelligent Counsel, <br /> Anytime, Anywhere.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <button
            className="bg-[#5A3FFF] text-[#FFD0C5] text-sm font-bold font-railway rounded-xl shadow-xl"
            style={{
              width: `${(133 / 1728) * 100}vw`,
              height: `${(54 / 1117) * 100}vh`,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
            }}
            onClick={() => {
              router.push("/auth/getting-started?authType=email");
            }}
          >
            Get started
          </button>
          <button
            className="bg-white text-[#6549CC] font-bold font-railway text-[0.8rem] rounded-lg shadow-xl hover:bg-gray-100 opacity-100 gap-2 px-3 py-4 w-[14.06vw] h-[5.01vh] flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          >
            <img
              src="/google-button.svg"
              alt="Google Icon"
              className="w-4 h-4 mt-0.5"
            />
            {isLoading ? "Loading..." : "Continue with Google"}
          </button>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}