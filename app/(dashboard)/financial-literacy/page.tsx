"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import SuggestedPrompts from "../career/components/SuggestedPrompts";
import QuickLinksSection, {
  QuickLink,
} from "../career/components/QuickLinksSection";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";
import { useUser } from "@/hooks/useUser";

export default function FinancialLiteracyPage() {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const { user } = useUser();

  const quickLinks: QuickLink[] = [
    {
      id: "budget-planner",
      title: "Budget planner",
      icon: (
        <div className="flex h-6 w-6 max-[640px]:h-5 max-[640px]:w-5 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#1E3A5F]">
          <svg
            className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
      ),
      color: "from-[#C4B0FF] to-[#9B7FFF]",
      href: "/financial-literacy/budget-planner",
    },
    {
      id: "resources",
      title: "Insights & Resources",
      icon: (
        <div className="flex h-6 w-6 max-[640px]:h-5 max-[640px]:w-5 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#10B981]">
          <svg
            className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      ),
      color: "from-[#A7F3D0] to-[#6EE7B7]",
      href: "/financial-literacy/resources",
    },
    {
      id: "reports",
      title: "Financial reports and exports",
      icon: (
        <div className="flex h-6 w-6 max-[640px]:h-5 max-[640px]:w-5 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#EC4899]">
          <svg
            className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      ),
      color: "from-[#FBCFE8] to-[#F9A8D4]",
      href: "/financial-literacy/reports",
    },
    {
      id: "chat",
      title: "Chat with AI Agent",
      icon: (
        <div className="flex h-6 w-6 max-[640px]:h-5 max-[640px]:w-5 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#8B5CF6]">
          <svg
            className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
      ),
      color: "from-[#E6E4FF] to-[#D4D0FF]",
      href: "/financial-literacy/chat",
    },
  ];

  const financeTip = {
    title: "Consistency",
    description:
      "Spend less than you earn—consistency matters more than amount.",
  };

  const suggestedPrompts = [
    {
      id: "1",
      iconImage: "/daily.png",
      title: "Tell me how to make my finances better",
      bgColor: "bg-gradient-to-br from-[#E0F2FE] to-[#BAE6FD]",
      iconColor: "text-2xl",
      href: `/financial-literacy/chat?prompt=${encodeURIComponent("Tell me how to make my finances better")}`,
    },
    {
      id: "2",
      iconImage: "/ai.png",
      title: "Do a trend analysis of my cash flows",
      bgColor: "bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0]",
      iconColor: "text-2xl",
      href: `/financial-literacy/chat?prompt=${encodeURIComponent("Do a trend analysis of my cash flows")}`,
    },
    {
      id: "3",
      iconImage: "/career.png",
      title: "How I can save more money?",
      bgColor: "bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A]",
      iconColor: "text-2xl",
      href: `/financial-literacy/chat?prompt=${encodeURIComponent("How I can save more money?")}`,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Finance Literacy" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto scrollbar-hide">
        <div className="max-w-[1100px] mx-auto px-2 max-[640px]:px-3 sm:px-6 py-4 max-[640px]:py-4 sm:py-8">
          {/* Go back home */}
          <Link href="/home">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 sm:mb-8 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Go back home</span>
            </button>
          </Link>

          {/* Quick Links Section */}
          <QuickLinksSection
            quickLinks={quickLinks}
            dailyTip={financeTip}
            tipsIcon="/tip.png"
            tipsTitle="Daily tips"
          />

          <hr className="my-8 sm:my-10" />

          {/* Today's Suggested Prompts Section */}
          <SuggestedPrompts
            prompts={suggestedPrompts}
            selectedPrompt={selectedPrompt}
            onSelect={(id) => setSelectedPrompt(id)}
          />
        </div>
      </main>

      {/* Chat Input Footer */}
      <InputFooter
        placeholder="Ask me how to make my finances better."
        onSend={() => {}}
        onAttach={() => {}}
        context="financial-literacy"
      />
    </div>
  );
}
