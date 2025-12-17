"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,

  Settings as SettingsIcon,

} from "lucide-react";
import Image from "next/image";
import resumeIcon from "@/public/Talk.png";
import chatIcon from "@/public/Robot.png";
import careerIcon from "@/public/career.png";
import resourcesIcon from "@/public/ai.png";
import tipsIcon from "@/public/tip.png";
import SuggestedPrompts, {
  SuggestedPrompt,
} from "../career/components/SuggestedPrompts";
import QuickLinksSection, {
  QuickLink,
} from "../career/components/QuickLinksSection";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";
import MoodSelector from "./components/MoodSelector";

export default function LifeAdvisorPage() {
  const pathname = usePathname();
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  const quickLinks: QuickLink[] = [
    {
      id: "mood",
      title: "Talk about how you feel",
      icon: <Image src={resumeIcon} alt="Mood" width={32} height={32} />,
      color: "from-[#FBD2D3] to-[#FBD2D3]",
      href: "/Life/mood-entry",
    },
    {
      id: "chat",
      title: "Chat with me",
      icon: <Image src={chatIcon} alt="Chat" width={36} height={36} />,
      color: "from-[#FDEDED] to-[#FDEDED]",
      href: "/Life/chat",
    },
    {
      id: "planner",
      title: "Life Planner",
      icon: <Image src={careerIcon} alt="Planner" width={36} height={36} />,
      color: "from-[#FBD2D3] to-[#FBD2D3]",
      href: "/Life/planner",
    },
    {
      id: "insights",
      title: "Insights and saved resources",
      icon: <Image src={resourcesIcon} alt="Insights" width={36} height={36} />,
      color: "from-[#F5D5E3] to-[#F0C4D4]",
      href: "/Life/insights",
    },
  ];

  const suggestedPrompts = [
    {
      id: 1,
      iconImage: "/daily.png",
      title: "Create morning routine that boosts mood",
      subtitle: "",
    },
    {
      id: 2,
      iconImage: "/ai.png",
      title: "Create routine with 20% social activities",
      subtitle: "",
    },
    {
      id: 3,
      iconImage: "/career.png",
      title: "Create routine that ensures 7 hours sleep",
      subtitle: "",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Life Advisor" />
      {/* Main Content */}
      <main className="flex-1 overflow-auto max-w-[1200px] mx-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Go back home */}
          <Link href="/home">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] my-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Home</span>
            </button>
          </Link>
          <h2 className="text-xl  font-medium text-gray-900 mb-8">
            How are you feeling today, Remi?
          </h2>
          {/* Mood Question */}
          <div className="mb-8">
            <MoodSelector />
          </div>
          {/* Quick Links Section */}
          <QuickLinksSection
            quickLinks={quickLinks}
            dailyTip={{
              title: "Update your CV regularly",
              description:
                "Updating your CV regularly ensures that all important contexts with regards to your skills are fully represented in your resume.",
            }}
            tipsIcon={tipsIcon}
          />

          <hr className="my-10" />

          {/* Today's Suggested Prompts Section */}
          <SuggestedPrompts
            prompts={suggestedPrompts.map((prompt) => ({
              id: prompt.id.toString(),
              title: prompt.title,
              iconImage: prompt.iconImage,
              bgColor: "bg-gradient-to-br from-[#E8D5FF] to-[#F0E6FF]",
              iconColor: "text-2xl",
            }))}
            selectedPrompt={selectedPrompt}
            onSelect={(id) => setSelectedPrompt(id)}
          />
        </div>
      </main>

      {/* Chat Input Footer */}
      <InputFooter
        placeholder="Ask me to create a plan to boost my mood..."
        onSend={(message) => console.log("Sent:", message)}
        onAttach={() => console.log("Attach clicked")}
      />
    </div>
  );
}
