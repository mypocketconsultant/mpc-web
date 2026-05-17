"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

import SettingsHeader from "@/app/components/settingsHeader";
import InputFooterWithMic from "@/app/components/InputFooterWithMic";
import QuickLinksSection, { QuickLink } from "./components/QuickLink";
import SuggestedPrompts from "./components/SuggestedPrompts";

import careerIcon from "@/public/career.png";
import dailyIcon from "@/public/daily.png";
import dailyTips from "@/public/DailyTip.png";
import resourcesIcon from "@/public/ai.png";
import { ClockLoading } from "@/public/icons/ClockLoading";

const quickLinks: QuickLink[] = [
  {
    id: "canvas",
    title: "Faith journal",
    icon: <Image src={careerIcon} alt="Faith journal" width={32} height={32} />,
    color: "from-[#EADAC6] to-[#EADAC6]",
    href: "/modules/faith/faith-journal",
  },
  {
    id: "devotional",
    title: "View Today's Devotional",
    icon: <Image src={careerIcon} alt="Devotional" width={32} height={32} />,
    color: "from-[#A79276] to-[#A79276]",
    href: "/modules/faith/Devotional-planner",
  },
  {
    id: "chat",
    title: "Chat Agent",
    icon: <Image src={dailyIcon} alt="Chat Agent" width={32} height={32} />,
    color: "from-[#C1A888] to-[#C1A888]",
    href: "/modules/faith/chat",
  },
  {
    id: "resources",
    title: "Saved Resources",
    icon: <Image src={resourcesIcon} alt="Saved Resources" width={32} height={32} />,
    color: "from-[#D4B996] to-[#D4B996]",
    href: "/modules/faith/Saved-Resources",
  },
];

const suggestedPrompts = [
  {
    id: "1",
    iconImage: "/scanAI.png",
    title: "What should today’s Scripture stir in me?",
    subtitle: "",
    bgColor: "bg-[#F6F0E9]",
    iconColor: "bg-[#EADAC6]",
  },
  {
    id: "2",
    iconImage: "/Artboard.png",
    title: "Should I feel God’s presence today?",
    subtitle: "",
    bgColor: "bg-[#F6F0E9]",
    iconColor: "bg-[#EADAC6]",
  },
  {
    id: "3",
    iconImage: "/coverletter.png",
    title: "Write a letter to God for me",
    subtitle: "",
    bgColor: "bg-[#F6F0E9]",
    iconColor: "bg-[#EADAC6]",
  },
];

export default function Page() {
  const router = useRouter();
  const [inputValue] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const handlePromptSelect = (promptId: string) => {
    setSelectedPrompt(promptId);

    const prompt = suggestedPrompts.find((item) => item.id === promptId);

    if (!prompt) return;

    const encodedPrompt = encodeURIComponent(prompt.title);
    router.push(`/modules/faith/chat?prompt=${encodedPrompt}`);
  };

  const handleSendMessage = (message: string) => {
    const encodedPrompt = encodeURIComponent(message);
    router.push(`/modules/faith/chat?prompt=${encodedPrompt}`);
  };

  return (
    <div className="flex h-full flex-col">
      <SettingsHeader title="Faith" />

      <main className="mx-auto w-full max-w-[1200px] flex-1 overflow-auto scrollbar-hide">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
          <div className="my-3 flex flex-row items-center justify-between sm:my-6">
            <Link href="/home">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 text-xs text-gray-700 transition-colors hover:text-[#5A3FFF] sm:text-sm"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Go back Home</span>
              </button>
            </Link>

            <ClockLoading />
          </div>

          <hr className="my-4 sm:my-10" />

          <QuickLinksSection
            quickLinks={quickLinks}
            dailyTip={{
              title: "The Nature Of The Prophetic",
              bibleverse: "📖 James 3:17",
              description:
                "The Father greatly desires a pure expression of the prophetic. He longs for an unblemished representation of His heart which draws people back to Himself.",
            }}
            tipsIcon={dailyTips}
            tipsTitle="Today's Word"
          />

          <hr className="my-6 sm:my-10" />

          <SuggestedPrompts
            prompts={suggestedPrompts}
            selectedPrompt={selectedPrompt}
            onSelect={handlePromptSelect}
          />

          <InputFooterWithMic
            placeholder="Ask me the bible’s stand on..."
            onSend={handleSendMessage}
            onAttach={() => {}}
            context="faith"
            initialValue={inputValue}
          />
        </div>
      </main>
    </div>
  );
}