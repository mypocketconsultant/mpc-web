"use client";

import React, { useState } from "react";
import { Bell, Zap, Settings, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Home" }: HeaderProps) {
  const router = useRouter();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      console.log("[Header] Starting logout process");

      // Get currentResumeId from localStorage
      const currentResumeId = typeof window !== "undefined" ? localStorage.getItem("currentResumeId") : null;
      console.log("[Header] Current Resume ID from localStorage:", currentResumeId);

      // Call logout endpoint
      console.log("[Header] Calling logout endpoint");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currentResumeId }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      console.log("[Header] Logout endpoint response received");

      // Sign out from Firebase
      const { auth } = await import("@/lib/firebase");
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
      console.log("[Header] Firebase sign out successful");

      // Clear localStorage
      localStorage.removeItem("currentResumeId");
      console.log("[Header] Cleared localStorage");

      // Redirect to login page
      console.log("[Header] Redirecting to login page");
      router.push("/auth/log-in");
    } catch (error) {
      console.error("[Header] Logout error:", error);
      // Still redirect even if there's an error
      localStorage.removeItem("currentResumeId");
      router.push("/auth/log-in");
    } finally {
      setIsProfileDropdownOpen(false);
    }
  };

  return (
    <header className="border-b border-gray-200 shadow-md px-40 bg-white sticky top-0 z-10">
      <div className="flex items-center justify-between  py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-black " />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Quick actions"
          >
            <Zap className="h-5 w-5 text-black" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5 text-black" />
          </button>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="User profile"
            >
              <User className="h-5 w-5 text-black" />
            </button>

            {/* Dropdown menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    router.push("/profile");
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-gray-200 mt-2 pt-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}