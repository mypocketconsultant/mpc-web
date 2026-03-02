"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Zap,
  Send,
  Lightbulb,
  Share2,
  Settings as SettingsIcon,
  User,
  Bell,
  Paperclip,
  FileText,
} from "lucide-react";
import Image from "next/image";
import resumeIcon from "@/public/daily.png";
import cvIcon from "@/public/career.png";
import careerIcon from "@/public/career.png";
import resourcesIcon from "@/public/ai.png";
import tipsIcon from "@/public/tip.png";
import SuggestedPrompts, {
  SuggestedPrompt,
} from "./components/SuggestedPrompts";
import QuickLinksSection, { QuickLink } from "./components/QuickLinksSection";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  // Check for prompt from saved-resources page on mount
  useEffect(() => {
    const savedPrompt = sessionStorage.getItem("careerPrompt");
    if (savedPrompt) {
      setInputValue(savedPrompt);
      // Clear it so it doesn't persist on refresh
      sessionStorage.removeItem("careerPrompt");
    }
  }, []);

  // Map routes to titles
  const getTitleFromPath = (path: string) => {
    if (path.includes("/home")) return "Home";
    if (path.includes("/career")) return "Career Advisory";
    if (path.includes("/tools")) return "Tools";
    if (path.includes("/settings")) return "Settings";
    return "My Pocket Consultant";
  };

  const quickLinks: QuickLink[] = [
    {
      id: "resume",
      title: "Resume Builder",
      icon: <Image src={resumeIcon} alt="Resume" width={32} height={32} />,
      color: "from-[#C4B0FF] to-[#9B7FFF]",
      href: "/career/resume-builder",
    },
    {
      id: "cv",
      title: "CV Builder",
      icon: <Image src={cvIcon} alt="CV" width={36} height={36} />,
      color: "from-[#E6E4FF] to-[#E6E4FF]",
      href: "/career/cv-builder",
    },
    {
      id: "career",
      title: "Career Planner",
      icon: <Image src={careerIcon} alt="Career" width={36} height={36} />,
      color: "rom-[#E6E4FF] to-[#E6E4FF]",
      href: "/career/create-plan",
    },
    {
      id: "resources",
      title: "Saved Career Resources",
      icon: (
        <Image src={resourcesIcon} alt="Resources" width={36} height={36} />
      ),
      color: "from-[#C4B0FF] to-[#9B7FFF]",
      href: "/career/saved-resources",
    },
  ];

  const suggestedPrompts = [
    {
      id: 1,
      iconImage: "/daily.png",
      title: "Run a 10-sec scan of my CV",
      subtitle: "(Upload CV)",
    },
    {
      id: 2,
      iconImage: "/ai.png",
      title: "Create New Resume",
      subtitle: "",
    },
    {
      id: 3,
      iconImage: "/career.png",
      title: "Write a cover letter",
      subtitle: "",
    },
  ];

  const handlePromptSelect = (promptId: string) => {
    const prompt = suggestedPrompts.find((p) => p.id.toString() === promptId);
    if (prompt) {
      const encodedPrompt = encodeURIComponent(prompt.title);
      router.push(`/career/chat?context=career&prompt=${encodedPrompt}`);
    }
  };

  return (
    <div className="flex flex-col  h-full ">
      <Header title={getTitleFromPath(pathname)} />
      {/* Main Content */}
      <main className="flex-1 overflow-auto max-w-[1100px] mx-auto scrollbar-hide w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          {/* Go back home */}
          <Link href="/home">
            <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] mb-4 sm:mb-8 transition-colors">
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Go back home</span>
            </button>
          </Link>
          <hr className="my-4 sm:my-10" />
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

          <hr className="" />
          {/* Today's Section */}
          <SuggestedPrompts
            prompts={suggestedPrompts.map((prompt) => ({
              id: prompt.id.toString(),
              title: prompt.title,
              iconImage: prompt.iconImage,
              bgColor: "bg-gradient-to-br from-[#E8D5FF] to-[#F0E6FF]",
              iconColor: "text-2xl",
            }))}
            selectedPrompt={selectedPrompt}
            onSelect={handlePromptSelect}
          />
        </div>
      </main>

      {/* Chat Input Footer */}
      <InputFooter
        placeholder="Ask me to optimize your LinkedIn..."
        onSend={(message) => {
          const encodedPrompt = encodeURIComponent(message);
          router.push(`/career/chat?context=career&prompt=${encodedPrompt}`);
        }}
        onAttach={() => {}}
        context="career"
        initialValue={inputValue}
      />
    </div>
  );
}
