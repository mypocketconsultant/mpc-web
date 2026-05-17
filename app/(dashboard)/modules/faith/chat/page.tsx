"use client";


import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Settings as SettingsIcon , ArrowLeft   } from "lucide-react";
import SettingsHeader from "@/app/components/settingsHeader";
import tipsIcon from "@/public/tip.png";
import InputFooterWithMic from "@/app/components/InputFooterWithMic";
import { ClockLoading } from "@/public/icons/ClockLoading";
const page = () => {
    const pathname = usePathname();
      const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
      const router = useRouter();
  return (
    <div className="flex flex-col h-full">
       <SettingsHeader title="Faith" />
       <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide w-full">
        <div  className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                <div className="flex  flex-row items-center justify-between my-3 sm:my-6">
            <Link href="/modules/faith">
              <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors cursor-pointer">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Faith / Chat</span>
              </button>
            </Link>
             <ClockLoading/>
          </div>
           <hr className="my-4 sm:my-10" />
           <div>
            <p className="text-[#062950] font-medium text-right">What should today’s Scripture stir in me?</p>
              <div className="my-4">
                 <div  className="my-4">
                <h2 className="text-[#062950] font-bold">1. Conviction (Without Condemnation)</h2>
                <h4 className="text-[#062950] font-normal whitespace-pre-line text-sm leading-normal">
                  True conviction says:{"\n"}
              “You can grow here.”{"\n"}{"\n"}{"\n"}

              It doesn’t say:{"\n"}
              “You are failing.”{"\n"}
              If you feel tension, that’s not rejection — that’s refinement.{"\n"}

              </h4>
              </div>
              <div  className="my-4">
  <h2 className="text-[#062950] font-bold">2. Courage</h2>
   <h4 className="text-[#062950] font-normal whitespace-pre-line text-sm leading-normal">
   Scripture should stir courage to:
</h4>
 <ul className="list-disc ml-5 space-y-1.5 marker:text-[15px] mt-1">
  <li className="text-[#062950] text-sm font-normal leading-tight">
   Forgive someone.
  </li>
  <li className="text-[#062950] text-sm font-normal leading-tight">
    Take a step you’ve delayed.
  </li>
  <li className="text-[#062950] text-sm font-normal leading-tight">
  Trust God where you’ve been controlling.
  </li>
  <li className="text-[#062950] text-sm font-normal leading-tight">
    Release something you’ve been holding too tightly.
  </li>
</ul>
            </div>
                 <div  className="my-4">
                <h2 className="text-[#062950] font-bold">3. Hope</h2>
                <h4 className="text-[#062950] font-normal whitespace-pre-line text-sm leading-normal">
                  If nothing else, today’s Scripture should stir hope.{"\n"}
                  Not hype. {"\n"} Not denial.{"\n"} But grounded hope.{"\n"}
                  The kind that says:
                   <ul className="list-disc ml-5 space-y-1.5 marker:text-[15px] mt-0.5">
  <li className="text-[#062950] text-sm font-normal leading-tight">
   “God is still at work in me.
  </li>
</ul>
              </h4>
              </div>
              </div>
           </div>
       

                              <InputFooterWithMic
                                            placeholder="Ask me the bible’s stand on..."
                                            onSend={(message) => {
                                              const encodedPrompt = encodeURIComponent(message);
                                              router.push(`/Life/chat?prompt=${encodedPrompt}`);
                                            }}
                                            onAttach={() => {}}
                                            context="life"
                                          />
        </div>
       </main>
    </div>
  )
}

export default page