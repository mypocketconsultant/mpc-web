"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import chatIcon from "@/public/Robot.png";
import SuggestedPrompts from "../career/components/SuggestedPrompts";
import QuickLinksSection, {
  QuickLink,
} from "../career/components/QuickLinksSection";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";
import { useUser } from "@/hooks/useUser";

export default function StudySupportPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const { user } = useUser();

  const quickLinks: QuickLink[] = [
    {
      id: "create-class",
      title: "Create a class",
      icon: (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5A3FFF]">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
      ),
      color: "from-[#C4B0FF] to-[#9B7FFF]",
      href: "/study/create-class",
    },
    {
      id: "study-planner",
      title: "Study Planner",
      icon: (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5A3FFF]">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      ),
      color: "from-[#E6E4FF] to-[#D4D0FF]",
      href: "/study/planner",
    },
    {
      id: "saved-resources",
      title: "Saved Study Resources",
      icon: (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5A3FFF]">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>
      ),
      color: "from-[#C4B0FF] to-[#9B7FFF]",
      href: "/study/saved-resources",
    },
    {
      id: "chat",
      title: "Chat with me",
      icon: <Image src={chatIcon} alt="Chat" width={36} height={36} />,
      color: "from-[#E6E4FF] to-[#D4D0FF]",
      href: "/study/chat?context=study",
    },
  ];

  const studyTip = {
    title: "Ask questions",
    description:
      "When in class, always ask questions that will help give clarity to what you hear and what you hope to learn.",
  };

  const suggestedPrompts = [
    {
      id: "1",
      iconImage: "/daily.png",
      title:
        "Create a summarized study note of one page from this attached document",
      bgColor: "bg-gradient-to-br from-[#E8D5FF] to-[#F0E6FF]",
      iconColor: "text-2xl",
    },
    {
      id: "2",
      iconImage: "/ai.png",
      title: "Track most studied topics; suggest spaced repetition schedule",
      bgColor: "bg-gradient-to-br from-[#E8D5FF] to-[#F0E6FF]",
      iconColor: "text-2xl",
    },
    {
      id: "3",
      iconImage: "/career.png",
      title: "Create an exam plan for my biology class",
      bgColor: "bg-gradient-to-br from-[#E8D5FF] to-[#F0E6FF]",
      iconColor: "text-2xl",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Study Support" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto scrollbar-hide">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Go back home */}
          <Link href="/home">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 sm:mb-8 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Go home</span>
            </button>
          </Link>

          {/* Greeting */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-[#5A3FFF] mb-8 sm:mb-10">
            Hey {user?.firstName || "there"}, let me be your class buddy. What
            do you need?
          </h2>

          {/* Quick Links Section */}
          <QuickLinksSection
            quickLinks={quickLinks}
            dailyTip={studyTip}
            tipsIcon="/tip.png"
            tipsTitle="Study tips"
          />

          <hr className="my-8 sm:my-10" />

          {/* Today's Suggested Prompts Section */}
          <SuggestedPrompts
            prompts={suggestedPrompts}
            selectedPrompt={selectedPrompt}
            onSelect={(id) => {
              const prompt = suggestedPrompts.find((p) => p.id === id);
              if (prompt) {
                const encodedPrompt = encodeURIComponent(prompt.title);
                router.push(`/study/chat?context=study&prompt=${encodedPrompt}`);
              }
            }}
          />
        </div>
      </main>

      {/* Chat Input Footer */}
      <InputFooter
        placeholder="What will you like to..."
        onSend={(message) => {
          const encodedPrompt = encodeURIComponent(message);
          router.push(`/study/chat?context=study&prompt=${encodedPrompt}`);
        }}
        onAttach={() => {}}
        context="study"
      />
    </div>
  );
}
