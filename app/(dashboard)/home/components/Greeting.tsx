import React from "react";
import Image from "next/image";
import profileProgress from "@/public/profile.png";

interface GreetingProps {
  name?: string;
  onCompleteProfile?: () => void;
}

export default function Greeting({
  name = "Remi",
  onCompleteProfile,
}: GreetingProps) {
  return (
    <div className="mb-8 bg-gradient-to-r from-gray-50 shadow-lg to-white rounded-2xl p-6 border border-gray-200 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Hi {name},</h2>
        <button
          onClick={onCompleteProfile}
          className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Complete Profile
        </button>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600 mb-3">You are almost done.</p>
        <Image
          src={profileProgress}
          alt="Profile Progress"
          width={150}
          height={150}
          className="rounded-xl"
        />
      </div>
    </div>
  );
}
