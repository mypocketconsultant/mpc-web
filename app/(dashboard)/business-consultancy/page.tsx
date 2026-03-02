"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BarChart, FileText, Send, User, Users } from "lucide-react";
import QuickLinksSection, { QuickLink } from "./components/QuickLinksSection";
import SuggestedPrompts from "./components/SuggestedPrompts";
import { History } from "lucide-react";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";
import tipsIcon from "@/public/tip.png";
import ChatHistoryDrawer from "@/components/ChatHistoryDrawer";

// Try using existing icons
import careerIcon from "@/public/career.png";
import aiIcon from "@/public/ai.png";
import dailyIcon from "@/public/daily.png";
import Image from "next/image";

export default function BusinessConsultancyPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const getTitleFromPath = (path: string) => {
    return "Business Consultancy";
  };

  const quickLinks: QuickLink[] = [
    {
      id: "canvas",
      title: "Create Business Model Canvas",
      icon: <Image src={careerIcon} alt="Canvas" width={32} height={32} />,
      color: "from-[#C4B0FF] to-[#9B7FFF]",
      href: "/business-consultancy/canvas",
    },
    {
      id: "swot",
      title: "Create SWOT Analysis Doc",
      icon: <Image src={dailyIcon} alt="SWOT" width={32} height={32} />,
      color: "from-[#E6E4FF] to-[#E6E4FF]",
      href: "/business-consultancy/swot",
    },
    {
      id: "ai",
      title: "Chat with AI Agent",
      icon: <Image src={aiIcon} alt="AI" width={32} height={32} />,
      color: "from-[#E6E4FF] to-[#E6E4FF]",
      href: "/business-consultancy/chat",
    },
    {
      id: "resources",
      title: "Saved Business Docs",
      icon: <FileText className="h-8 w-8 text-[#5A3FFF]" />,
      color: "from-[#C4B0FF] to-[#9B7FFF]",
      href: "/business-consultancy/resources",
    },
  ];

  const suggestedPrompts = [
    {
      id: "1",
      icon: <BarChart className="h-5 w-5" />,
      title: "Suggest business names for my business.",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-500",
    },
    {
      id: "2",
      icon: <User className="h-5 w-5" />,
      title: "Create a go-to-market plan",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-500",
    },
    {
      id: "3",
      icon: <FileText className="h-5 w-5" />,
      title: "Show me best practices for my industry",
      bgColor: "bg-indigo-100",
      iconColor: "text-indigo-500",
    },
  ];

  const handlePromptSelect = (promptId: string) => {
    const prompt = suggestedPrompts.find((p) => p.id === promptId);
    if (prompt) {
      const encodedPrompt = encodeURIComponent(prompt.title);
      router.push(`/business-consultancy/chat?prompt=${encodedPrompt}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] md:bg-white">
      <Header title={getTitleFromPath(pathname)} icon={<Users className="h-6 w-6 text-[#5A3FFF]" />} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto max-w-[1100px] mx-auto scrollbar-hide w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          {/* Go back home */}
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <Link href="/home">
              <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Go back home</span>
              </button>
            </Link>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#5A3FFF] bg-[#F0EDFF] rounded-lg hover:bg-[#E8E4FF] transition-colors"
            >
              <History className="w-4 h-4" />
              Chat History
            </button>
          </div>

          <div className="w-full h-[1px] bg-gray-100 mb-4 sm:mb-10" />

          {/* Quick Links Section */}
          <QuickLinksSection
            quickLinks={quickLinks}
            dailyTip={{
              title: "Say NO",
              description:
                "Say no to opportunities that don't align with your core goal.",
            }}
            tipsIcon={tipsIcon}
            tipsTitle="Daily tips"
          />

          <div className="hidden md:block w-full h-[1px] bg-gray-100 mt-8 sm:mt-12 mb-4 sm:mb-8" />

          {/* Today's Section */}
          <SuggestedPrompts
            prompts={suggestedPrompts}
            selectedPrompt={selectedPrompt}
            onSelect={handlePromptSelect}
          />
        </div>
      </main>

      <ChatHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSession={(sessionId) => {
          setIsHistoryOpen(false);
          router.push(`/business-consultancy/chat?session_id=${sessionId}`);
        }}
        onNewChat={() => {
          setIsHistoryOpen(false);
          router.push("/business-consultancy/chat");
        }}
        module="business"
      />

      {/* Chat Input Footer */}
      <InputFooter
        placeholder="Ask me to suggest a business name..."
        onSend={(message) => {
          const encodedPrompt = encodeURIComponent(message);
          router.push(`/business-consultancy/chat?prompt=${encodedPrompt}`);
        }}
        onAttach={() => {}}
        context="business-consultancy"
        initialValue={inputValue}
      />
    </div>
  );
}
