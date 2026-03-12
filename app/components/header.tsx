"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Zap, Settings, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title?: string;
  icon?: React.ReactNode;
}

export default function Header({ title = "Home", icon }: HeaderProps) {
  const router = useRouter();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // Step 1: Call backend logout endpoint to clear auth_token cookie
      const apiService = (await import("@/lib/api/apiService")).apiService;
      await apiService.post("/v1/auth/logout", {});
    } catch {
      // Continue with client-side cleanup even if backend call fails
    }

    try {
      // Step 2: Sign out from Firebase
      const { auth } = await import("@/lib/firebase");
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
    } catch {
      // Continue with cleanup even if Firebase signout fails
    }

    // Step 3: Clear all client-side storage
    sessionStorage.clear();
    localStorage.removeItem("signup-storage");

    // Step 4: Full page redirect to ensure clean state
    window.location.href = "/auth/log-in";
  };

  return (
    <header className="border-b border-gray-200 shadow-md px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 bg-white sticky top-0 z-10">
      <div className="flex items-center justify-between py-3 sm:py-4">
        {/* Title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
            {title}
          </h1>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          {/* Notifications - visible on all screens */}
          <button
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
          </button>

          {/* Quick actions - hidden on very small screens */}
          <button
            className="hidden xs:flex p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Quick actions"
          >
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
          </button>

          {/* Settings - hidden on mobile, visible on sm+ */}
          <button
            className="hidden sm:flex p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
          </button>

          {/* User profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="User profile"
              aria-expanded={isProfileDropdownOpen}
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
            </button>

            {/* Dropdown menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* Settings option visible in dropdown on mobile */}
                <button
                  onClick={() => {
                    router.push("/settings");
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full px-3 sm:px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 sm:hidden"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>

                {/* Quick actions in dropdown on mobile */}
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full px-3 sm:px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 xs:hidden"
                >
                  <Zap className="h-4 w-4" />
                  Quick Actions
                </button>

                <button
                  onClick={() => {
                    router.push("/profile");
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full px-3 sm:px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 sm:px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-gray-200 mt-2 pt-2"
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
