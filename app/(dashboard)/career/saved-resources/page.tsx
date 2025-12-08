"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, FileText, Mic, Paperclip } from "lucide-react";
import Link from "next/link";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";
import DailyTips from "../components/DailyTips";
import SuggestedPrompts from "../components/SuggestedPrompts";
import tipsIcon from "@/public/daily.png";

export default function SavedResourcesPage() {
  const pathname = usePathname();
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const getTitleFromPath = (path: string) => {
    if (path.includes("/saved-resources")) return "Saved Resources";
    if (path.includes("/career")) return "Career Advisory";
    return "My Pocket Consultant";
  };

  const recentDocuments = [
    {
      id: 1,
      title: "Remi Ladi Resume / CV.doc",
      promptHistory: "see prompt history",
    },
    {
      id: 2,
      title: "Remi Ladi Cover Letter.doc",
      promptHistory: "see prompt history",
    },
    {
      id: 3,
      title: "Remi Ladi Professional Bio.doc",
      promptHistory: "see prompt history",
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

  const dailyTip = {
    title: "Update your CV regularly",
    description:
      "Updating your CV regularly ensures that all important contexts with regards to your skills are fully represented in your resume.",
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <Header title={getTitleFromPath(pathname)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto scrollbar-hide">
        <div className="max-w-[1100px] mx-auto px-8 py-8">
          {/* Breadcrumb */}
          <Link
            href="/career"
            className="flex items-center gap-2 text-gray-700 hover:text-[#5A3FFF] transition-colors mb-8 font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Career Advisory / Saved Resources
          </Link>

          <hr className="my-14" />

          <div className="flex justify-between gap-8">
            {/* Left Content - Recent Documents */}
            <div className="w-[500px]">
              <div className=" rounded-3xl p-8 ">
                <div className="flex items-center  gap-5 mb-8">
                  <h2 className="text-lg font-bold text-gray-900">
                    Recent documents
                  </h2>
                  <button className="text-sm font-semibold text-[#656565] hover:text-[#656565] transition-colors">
                    see all...
                  </button>
                </div>

                {/* Documents List */}
                <div className="space-y-2">
                  {recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Document icon with background */}
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>

                        {/* Document title */}
                        <span className="font-medium text-gray-700 text-sm truncate">
                          {doc.title}
                        </span>
                      </div>

                      {/* Action button */}
                      <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors whitespace-nowrap ml-4">
                        {doc.promptHistory}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Daily Tips */}
            <div className="w-80 flex-shrink-0">
              <DailyTips dailyTip={dailyTip} tipsIcon={tipsIcon} />
            </div>
          </div>
          <hr className="my-4" />
          {/* Suggested Prompts Section */}
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
      <div className="border-t border-gray-200 bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <InputFooter
            placeholder="Ask me to optimize your LinkedIn..."
            onSend={(message) => console.log("Sent:", message)}
            onAttach={() => console.log("Attach clicked")}
          />
        </div>
      </div>
    </div>
  );
}
