"use client"

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {  ArrowLeft  } from "lucide-react";
import InputFooterWithMic from "@/app/components/InputFooterWithMic";
import SettingsHeader from "@/app/components/settingsHeader";
const page = () => {
   const router = useRouter();
   const placeholders = [
  "Describe to me what you need help with",
  "Ask me to create a plan for...",
  "Ask me how to kickstart...",
  "Ask me to review your CV",
];
 const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % placeholders.length);
    }, 5000); // 60,000ms = 1 minute

    return () => clearInterval(interval); // cleanup
  }, []);
  return (
     <div className="flex flex-col h-full">
      <SettingsHeader title="Help Center" />
      <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
           <div className="flex items-center justify-between my-3 sm:my-6">
            <Link href="/home">
              <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Go back Home</span>
              </button>
            </Link>
          </div>
           <hr className="my-4 sm:my-10" />
           <div className="my-40">
            <h5 className="text-bold  text-medium text-[#000000] text-center">How can I help you today?</h5>
                 <InputFooterWithMic
              // placeholder="Describe to me what you need help with"
              // placeholder="Ask me to create a plan for...
              // placeholder="Ask me how to kickstart..."
              // placeholder="Ask me to review your CV"
               placeholder={placeholders[index]}
              onSend={(message) => {
                const encodedPrompt = encodeURIComponent(message);
                router.push(`/Life/chat?prompt=${encodedPrompt}`);
              }}
              onAttach={() => {}}
              context="life"
            />

            <div className="ml-10 mt-2">
              <h6 className="text-[#062950] text-medium ">Help Topics</h6>
              <h5 className="text-medium text-[#3566A2] underline py-2">Where do I find the Career Module?</h5>
               <h5 className="text-medium text-[#3566A2] underline py-2">How to use the finance module.</h5>
            
            </div>
           </div>

        </div>

      </main>
     
    </div>
  )
}

export default page