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
  //   const handlePromptSelect = (promptId: string) => {
  //   const prompt = suggestedPrompts.find((p) => p.id === promptId);
  //   if (prompt) {
  //     const encodedPrompt = encodeURIComponent(prompt.title);
  //     router.push(`/business-consultancy/chat?prompt=${encodedPrompt}`);
  //   }
  // };
  return (
<div className="flex flex-col h-screen">
  <SettingsHeader title="Social Impact" />

  <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide w-full">
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 flex flex-col min-h-full">
      
      {/* Top section */}
      <div>
        <div className="flex flex-row items-center justify-between my-3 sm:my-6">
          <Link href="/modules/social-impact/">
            <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors cursor-pointer">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Social Impact / Chat</span>
            </button>
          </Link>
          <ClockLoading />
        </div>

        <hr className="my-4 sm:my-10" />
      </div>

      {/* 🔥 Bottom section */}
      <div className="mt-auto">
        <p className="text-[#062950] font-medium text-right">
          How can I be a better volunteer?
        </p>

        <div className="my-4">
          <h2 className="text-[#062950] font-bold">
            🌍 How can you be a better volunteer?
          </h2>

          <h4 className="text-[#062950] font-normal whitespace-pre-line text-sm leading-normal">
  1. Shift from “Helping” to “Serving”. Helping can sometimes center you. Serving centers the community.
 </h4>
 <h4 className="text-[#062950] font-normal whitespace-pre-line text-sm leading-normal">
  2. Ask:
 </h4>
 <ul className="list-disc ml-5 space-y-1.5 marker:text-[10px] mt-1">
  <li className="text-[#062950] text-sm font-normal leading-tight">
  What does this community actually need?
 </li>
<li className="text-[#062950] text-sm font-normal leading-tight">
 Am I solving the right problem?
  </li>
 <li className="text-[#062950] text-sm font-normal leading-tight">
   Did I listen before acting?
  </li>
</ul>
 <h4 className="text-[#062950] font-normal whitespace-pre-line text-sm leading-normal mt-1"> The best volunteers don’t assume — they observe and ask.</h4>
        </div>

        <InputFooterWithMic
          placeholder="Ask me how to volunteer better in..."
          onSend={(message) => {
            const encodedPrompt = encodeURIComponent(message);
            router.push(`/social-impact/chat?prompt=${encodedPrompt}`);
          }}
          onAttach={() => {}}
          context="life"
        />
      </div>

    </div>
  </main>
</div>
  )
}

export default page