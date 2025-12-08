"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, FileText, Mic, Paperclip } from "lucide-react";
import Link from "next/link";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";
import DailyTips from "../components/DailyTips";
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
      icon: "🔄",
      title: "Run a 10-sec scan of my CV",
      subtitle: "(Upload CV)",
    },
    {
      id: 2,
      icon: "📄",
      title: "Create New Resume",
      subtitle: "",
    },
    {
      id: 3,
      icon: "✍️",
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

          <div className="flex justify-between gap-8">
            {/* Left Content - Recent Documents */}
            <div className="w-[500px]">
              <div className=" rounded-3xl p-8 ">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-bold text-gray-900">
                    Recent documents
                  </h2>
                  <button className="text-sm font-semibold text-[#5A3FFF] hover:text-[#300878] transition-colors">
                    see all...
                  </button>
                </div>

                {/* Documents List */}
                <div className="space-y-3">
                  {recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="w-5 h-5 text-[#5A3FFF] flex-shrink-0" />
                        <span className="font-medium text-gray-900 text-sm">
                          {doc.title}
                        </span>
                      </div>
                      <button className="text-xs font-semibold text-[#5A3FFF] hover:text-[#300878] transition-colors whitespace-nowrap ml-4">
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

          {/* Suggested Prompts Section */}
          <div className="mt-16">
            <h3 className="text-center text-gray-500 text-sm font-medium mb-8">
              Today's suggested prompt
            </h3>

            <div className="grid grid-cols-3 gap-6 mb-12">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => setSelectedPrompt(prompt.id.toString())}
                  className="bg-gradient-to-br from-[#E8D5FF] to-[#F0E6FF] rounded-3xl p-8 text-center hover:shadow-lg transition-all group"
                >
                  <div className="text-4xl mb-4">{prompt.icon}</div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">
                    {prompt.title}
                  </h4>
                  {prompt.subtitle && (
                    <p className="text-xs text-gray-600">{prompt.subtitle}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
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
