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
      title: "Find Volunteer Opportunities",
      icon: <Image src={careerIcon} alt="Canvas" width={32} height={32} />,
      color: "from-[#E7C666] to-[#E7C666]",
      href: "/modules/social-impact/volunteer-project-finder",
    },
    {
      id: "swot",
      title: "Start a Social Impact Project",
      icon: <Image src={careerIcon} alt="SWOT" width={32} height={32} />,
      color: "from-[#F9D465] to-[#F9D465]",
      href: "/modules/social-impact/create-project",
    },
    {
      id: "ai",
      title: "Chat Agent",
      icon: <Image src={dailyIcon} alt="AI" width={32} height={32} />,
      color: "from-[#C9A428] to-[#C9A428]",
      href: "/modules/social-impact/chat",
    },
    {
      id: "resources",
      title: "Social Impact Resources",
      icon: <Image src={resourcesIcon} alt="AI" width={32} height={32} />,
      color: "from-[#D4AF37] to-[#D4AF37]",
      href: "/modules/social-impact/saved-resources",
    },
  ];

   const  suggestedPrompts = [
    {
      id: "1",
      iconImage: "/scanAI.png",
      title: "How can I be a better volunteer?",
      subtitle: "",
      bgColor: "from-[#E7C666] to-[#E7C666]",
      iconColor: "#E7C666",
    },
    {
      id: "2",
      iconImage: "/Artboard.png",
      title: "Is it possible to kick start a new career through volunteering?",
      subtitle: "",
      bgColor: "from-[#F9D465] to-[#F9D465]",
      iconColor: "#F9D465",
    },
    {
      id: "3",
      iconImage: "/coverletter.png",
      title: "Organisations in the U.S with the best volunteer support.",
      subtitle: "",
      bgColor: "from-[#D4AF37] to-[#D4AF37]",
      iconColor: "#D4AF37",
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
       <SettingsHeader title="Social Impact" />
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
              title: "Make a difference",
               bibleverse:"",
              description:
              "You can make a difference if you plan for it"
            }}
            tipsIcon={dailyTips}
            tipsTitle="Daily tips "
           
          />
          <hr className="my-6 sm:my-10" />
          
                    {/* Today's Suggested Prompts Section */}
                     <SuggestedPrompts
                                prompts={suggestedPrompts}
                                selectedPrompt={selectedPrompt}
                                onSelect={(promptId) => {
                                  const prompt = suggestedPrompts.find((p) => p.id === promptId);
                                  if (prompt) {
                                    const encodedPrompt = encodeURIComponent(prompt.title);
                                    router.push(`/modules/social-impact/chat?prompt=${encodedPrompt}`);
                                  }
                                }}
                              />


                              <InputFooterWithMic
                                            placeholder="Ask me how to volunteer better in..."
                                            onSend={(message) => {
                                              const encodedPrompt = encodeURIComponent(message);
                                              router.push(`/faith/chat?prompt=${encodedPrompt}`);
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