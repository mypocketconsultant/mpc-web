import React from "react";
import Image from "next/image";
import careerAgent from "@/public/CareerAgent.png";

interface CareerAdvisoryProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonTime?: string;
  onRunAudit?: () => void;
  image?: string;
}

export default function CareerAdvisory({
  title = "Career Advisory",
  description = "1-min resume scan ready",
  buttonText = "Run Resume Audit",
  buttonTime = "- takes 60s",
  onRunAudit,
  image,
}: CareerAdvisoryProps) {
  return (
    <div className="mb-4 sm:mb-6 md:mb-8 bg-[#CAE2FF] shadow-lg rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-200 flex items-center justify-between">
      <div>
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">
          {description}
        </p>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onRunAudit}
            className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-[#5A3FFF] to-[#300878] text-white rounded-full text-xs sm:text-sm font-semibold hover:from-[#6B4FFF] hover:to-[#400A88] transition-all shadow-md"
          >
            {buttonText}
          </button>
          <span className="text-xs sm:text-sm font-light text-black">
            {buttonTime}
          </span>
        </div>
      </div>
      <div className="flex-shrink-0 hidden sm:block">
        <Image
          src={careerAgent}
          alt={title}
          width={208}
          height={108}
          className="rounded-xl w-24 sm:w-32 md:w-[208px] h-auto"
        />
      </div>
    </div>
  );
}
