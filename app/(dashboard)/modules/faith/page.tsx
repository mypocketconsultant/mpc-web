"use client";


import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Settings as SettingsIcon , ArrowLeft   } from "lucide-react";
import SettingsHeader from "@/app/components/settingsHeader";
import QuickLinksSection , { QuickLink} from "./components/QuickLink";
import tipsIcon from "@/public/tip.png";
import InputFooterWithMic from "@/app/components/InputFooterWithMic";

// Try using existing icons
import careerIcon from "@/public/career.png";
import aiIcon from "@/public/ai.png";
import dailyIcon from "@/public/daily.png";
import dailyTips from "@/public/DailyTip.png";
import resourcesIcon from "@/public/ai.png";
import SuggestedPrompts from "./components/SuggestedPrompts";
import { ClockLoading } from "@/public/icons/ClockLoading";

const page = () => {
   const quickLinks: QuickLink[] = [
    {
      id: "canvas",
      title: "Faith journal",
      icon: <Image src={careerIcon} alt="Canvas" width={32} height={32} />,
      color: "from-[#EADAC6] to-[#EADAC6]",
      href: "/modules/faith/faith-journal",
    },
    {
      id: "swot",
      title: "View Today's Devotional",
      icon: <Image src={careerIcon} alt="SWOT" width={32} height={32} />,
      color: "from-[#A79276] to-[#A79276]",
      href: "/modules/faith/Devotional-planner",
    },
    {
      id: "ai",
      title: "Chat Agent",
      icon: <Image src={dailyIcon} alt="AI" width={32} height={32} />,
      color: "from-[#C1A888] to-[#C1A888]",
      href: "/modules/faith/chat",
    },
    {
      id: "resources",
      title: "Saved Resources",
      icon: <Image src={resourcesIcon} alt="AI" width={32} height={32} />,
      color: "from-[#D4B996] to-[#D4B996]",
      href: "/modules/faith/Saved-Resources",
    },
  ];

    const  suggestedPrompts = [
    {
      id: 1,
      iconImage: "/scanAI.png",
      title: "What should today’s Scripture stir in me?",
      subtitle: "",
    },
    {
      id: 2,
      iconImage: "/Artboard.png",
      title: "Should I feel God’s presence today?",
      subtitle: "",
    },
    {
      id: 3,
      iconImage: "/coverletter.png",
      title: "Write a letter to God for me",
      subtitle: "",
    },
  ];
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
    <div className="flex flex-col h-full">
       <SettingsHeader title="Faith" />
       <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide w-full">
        <div  className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                <div className="flex  flex-row items-center justify-between my-3 sm:my-6">
            <Link href="/home">
              <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors cursor-pointer">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Go back Home</span>
              </button>
            </Link>
             <ClockLoading/>
          </div>
           <hr className="my-4 sm:my-10" />
            {/* Quick Links Section */}
          <QuickLinksSection
            quickLinks={quickLinks}
            dailyTip={{
              title: "The Nature Of The Prophetic",
               bibleverse:" 📖 James 3:17",
              description:
              " The Father greatly desires a pure expression of the prophetic. He longs for an unblemished representation of His heart which draws people back to Himself "
            }}
            tipsIcon={dailyTips}
            tipsTitle="Today's Word "
           
          />
          <hr className="my-6 sm:my-10" />
          
                    {/* Today's Suggested Prompts Section */}
                     <SuggestedPrompts
                                prompts={suggestedPrompts}
                                selectedPrompt={selectedPrompt}
                                
                                // onSelect={handlePromptSelect}
                              />


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