"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FormSectionProps {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  validationErrors: { [key: string]: string };
}

export default function FormSection({
  email,
  password,
  setEmail,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  validationErrors,
}: FormSectionProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex flex-col md:flex-row w-full max-w-4xl gap-4 md:gap-6 lg:gap-8 items-center">
      {/* Image - hidden on mobile, visible on md and up */}
      <div className="hidden md:flex flex-shrink-0 w-40 h-40 lg:w-[15.6vw] lg:h-[20.6vh] items-center justify-center">
        <img
          src="/lets-begin.svg"
          alt="Getting Started"
          className="object-contain rounded-[2.25rem] opacity-100 w-full h-full"
        />
      </div>

      <div className="flex flex-col w-full max-w-sm px-2 sm:px-0">
        <h2 className="text-lg sm:text-xl lg:text-[1.4rem] font-display font-extrabold text-black mt-2 lg:mt-[2vh]">
          Hello!
        </h2>
        <p className="text-sm sm:text-base lg:text-[1rem] font-[700] font-display text-black mb-2 lg:mb-[1vh]">
          Tell us your email address
        </p>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full lg:w-[21.8vw] h-12 lg:h-[3.0rem] mb-3 lg:mb-[2.5vh] font-railway border border-[#79747E] text-[#49454F] text-sm lg:text-[14.5px] rounded-[0.25rem] opacity-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {validationErrors.email && (
          <p className="text-red-500 text-xs lg:text-[0.7rem] font-railway mb-2 lg:mb-[2vh] -mt-2">
            {validationErrors.email}
          </p>
        )}

        <div className="relative w-full lg:w-[21.8vw] mb-3 lg:mb-[2.5vh]">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 lg:h-[3.0rem] font-railway border border-[#79747E] text-[#49454F] text-sm lg:text-[14.5px] rounded-[0.25rem] opacity-100 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {validationErrors.password && (
          <p className="text-red-500 text-xs lg:text-[0.7rem] font-railway mb-2 lg:mb-[2vh] -mt-2">
            {validationErrors.password}
          </p>
        )}

        <div className="relative w-full lg:w-[21.8vw] mb-2 lg:mb-[0.5vh]">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-12 lg:h-[3.0rem] font-railway border border-[#79747E] text-[#49454F] text-sm lg:text-[14.5px] rounded-[0.25rem] opacity-100 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {validationErrors.confirmPassword && (
          <p className="text-red-500 text-xs lg:text-[0.7rem] font-railway mb-2 lg:mb-[2vh]">
            {validationErrors.confirmPassword}
          </p>
        )}
      </div>
    </div>
  );
}
