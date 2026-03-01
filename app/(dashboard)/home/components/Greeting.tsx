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
    <div className="mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-gray-50 shadow-lg to-white rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200 flex items-center justify-between">
      <div>
        <h2 className="text-sm sm:text-base md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
          Hi {name},
        </h2>
        <button
          onClick={onCompleteProfile}
          className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Complete Profile
        </button>
      </div>
      <div className="text-right">
        <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-3">
          You are almost done.
        </p>
        <Image
          src={profileProgress}
          alt="Profile Progress"
          width={150}
          height={150}
          className="rounded-xl w-16 h-16 sm:w-24 sm:h-24 md:w-[150px] md:h-auto"
        />
      </div>
    </div>
  );
}
