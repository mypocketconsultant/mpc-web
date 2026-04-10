"use client";


import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Settings as SettingsIcon , ArrowLeft  , ChevronRight  } from "lucide-react";
import SettingsHeader from "@/app/components/settingsHeader";
import { AIPrompt } from "@/public/icons/AIPrompt";
import tipsIcon from "@/public/tip.png";
import InputFooterWithMic from "@/app/components/InputFooterWithMic";

// Try using existing icons
import careerIcon from "@/public/career.png";
import aiIcon from "@/public/ai.png";
import dailyIcon from "@/public/daily.png";
import dailyTips from "@/public/DailyTip.png";
import resourcesIcon from "@/public/ai.png";

const page = () => {
   const [step, setStep] = useState(1);
  return (
      <div className="flex flex-col h-full">
       <SettingsHeader title="Social Impact" />
       <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide w-full">
        <div  className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                <div className="flex  flex-row items-center justify-between my-3 sm:my-6">
            <Link href="/modules/social-impact">
              <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors cursor-pointer">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Social Impact / Create a Project</span>
              </button>
            </Link>
          </div>
           <hr className="my-4 sm:my-10" />
           <div className="w-full sm:max-w-[350px] lg:max-w-[700px] mx-auto">
              <div className="inline-flex items-center justify-center px-2 py-2 rounded-[10px] bg-[#EDE6FF]">
  <p className="text-xs sm:text-base text-[#16375F] m-0">
    Save to draft
  </p>
</div>
<h5 className="font-medium text-[#062950] py-5">Create a Social Impact Project</h5>
<div className="w-full bg-gray-200 rounded-full h-1 mt-2">
  <div
    className="h-1 bg-[#A393FF] rounded-full transition-all duration-300"
    style={{ width: `${(step / 5) * 100}%` }}
  ></div>
</div>
{/* step1 */}
{step === 1 && (
  <div>
    <h4 className="text-[14px] font-bold text-black py-2">Problem Profile</h4>
    <div className="border border-[#BBBBBB] rounded-2xl p-6 my-3 w-full mt-2">
      <textarea
        placeholder="Describe the Problem You Want to Solve"
        className="w-full h-20 resize-none outline-none font-medium placeholder:text-[#CFCFCF]"
      />
    </div>
    <div className="border border-gray-300 rounded-md p-4 my-4">
      <input placeholder="-Hours of work-" className="w-full outline-none" />
    </div>
  </div>
)}

{/* step2 */}
{step === 2 && (
  <div>
    <h4 className="text-[14px] font-bold text-black py-2">Location</h4>
    <div className="border border-gray-300 rounded-md p-4 flex gap-2 my-2">
      <input
        placeholder="Where is the volunteering taking place?"
        className="w-full outline-none"
      />
    </div>
  </div>
)}

{/* step3 */}
{step === 3 && (
  <div>
    <h4 className="text-[14px] font-bold text-black py-2">Solution Idea</h4>
    <div className="border border-[#BBBBBB] rounded-2xl p-6 my-3 w-full mt-2">
      <textarea
        placeholder="Describe the solution you want to provide"
        className="w-full h-20 resize-none outline-none font-medium placeholder:text-[#CFCFCF]"
      />
    </div>
  </div>
)}

{/* step4 */}
{step === 4 && (
  <div>
    <h4 className="text-[14px] font-bold text-black py-2">How to apply</h4>
    <div className="border border-[#BBBBBB] rounded-2xl p-6 my-3 w-full mt-2">
      <textarea
        placeholder="Provide application details here"
        className="w-full h-20 resize-none outline-none font-medium placeholder:text-[#CFCFCF]"
      />
    </div>
  </div>
)}

{/* step5 */}
{step === 5 && (
  <div>
    <h4 className="text-[14px] font-bold text-black py-2">Resources & Partners</h4>
    <div className="border border-gray-300 rounded-md p-4 my-2">
      <input placeholder="Title" className="w-full outline-none" />
    </div>
    <div className="border border-gray-300 rounded-md p-4 my-4">
      <input placeholder="Address" className="w-full outline-none" />
    </div>
  </div>
)}
 <div className="flex justify-end items-start gap-2 w-full">
  {/* Stack the two divs vertically */}
  <div className="flex flex-col gap-y-5 items-end">
    <div className="inline-flex items-center justify-center px-3 py-2 rounded-[10px] cursor-pointer     bg-[conic-gradient(from_236.3deg_at_92.05%_3.9%,_#300878_-5.19deg,_#5A3FFF_133.27deg,_#D4AF37_254.42deg,_#300878_354.81deg,_#5A3FFF_493.27deg)]"
    onClick={() => setStep((prev) => Math.min(prev + 1, 5))}
    >
      <p className="text-xs sm:text-base text-white m-0">Next</p>
    </div>

    <div className="flex flex-row gap-2 items-center">
      <AIPrompt />
      <p className="text-[#8D8D8D] font-medium">Show me how similar projects work</p>
      <ChevronRight />
    </div>
  </div>
</div>
</div>
        </div>
       </main>
    </div>
  )
}

export default page