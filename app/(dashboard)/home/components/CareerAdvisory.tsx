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
    <div className="mb-8 bg-[#CAE2FF] shadow-lg rounded-2xl p-8 border border-blue-200 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={onRunAudit}
            className="px-8 py-3 bg-gradient-to-r from-[#5A3FFF] to-[#300878] text-white rounded-full text-sm font-semibold hover:from-[#6B4FFF] hover:to-[#400A88] transition-all shadow-md"
          >
            {buttonText}
          </button>
          <span className="text-base font-light text-black">{buttonTime}</span>
        </div>
      </div>
      <div className="flex-shrink-0">
       
          <Image
            src={careerAgent}
            alt={title}
            width={208}
            height={108}
            className="rounded-xl"
          />
        
      </div>
    </div>
  );
}
