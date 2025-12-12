"use client";

import React from "react";
import { Bell, Zap, Settings, User } from "lucide-react";

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Home" }: HeaderProps) {
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
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="User profile"
          >
            <User className="h-5 w-5 text-black " />
          </button>
        </div>
      </div>
    </header>
  );
}