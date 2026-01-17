"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, FileText } from "lucide-react";
import Link from "next/link";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";
import DailyTips from "../components/DailyTips";
import SuggestedPrompts from "../components/SuggestedPrompts";
import tipsIcon from "@/public/daily.png";
import { apiService } from "@/lib/api/apiService";

interface ResumeDocument {
  id: string;
  title: string | null;
  status: string | null;
  created_at: string | null;
}

const INITIAL_LIMIT = 5;

export default function SavedResourcesPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [documents, setDocuments] = useState<ResumeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const getTitleFromPath = (path: string) => {
    if (path.includes("/saved-resources")) return "Saved Resources";
    if (path.includes("/career")) return "Career Advisory";
    return "My Pocket Consultant";
  };

  const fetchResumes = async (currentOffset: number = 0, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await apiService.get<{
        data: {
          items: ResumeDocument[];
          total: number;
          limit: number;
          offset: number;
        }
      }>(`/v1/resume-builder?limit=${INITIAL_LIMIT}&offset=${currentOffset}`);

      const resumes = response?.data?.items || [];
      const totalCount = response?.data?.total || 0;

      if (append) {
        setDocuments((prev) => [...prev, ...resumes]);
      } else {
        setDocuments(resumes);
      }
      setTotal(totalCount);
      setOffset(currentOffset + resumes.length);
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      if (!append) {
        setDocuments([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchResumes(0, false);
  }, []);

  const handleLoadMore = () => {
    fetchResumes(offset, true);
  };

  const handleSeeChat = (resumeId: string) => {
    sessionStorage.setItem('currentResumeId', resumeId);
    router.push('/career/resume-builder');
  };

  const hasMore = documents.length < total;

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
                <div className="flex items-center gap-5 mb-8">
                  <h2 className="text-lg font-bold text-gray-900">
                    Recent documents
                  </h2>
                  {total > 0 && (
                    <span className="text-sm text-gray-500">
                      {documents.length} of {total}
                    </span>
                  )}
                </div>

                {/* Documents List */}
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      Loading documents...
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No documents found
                    </div>
                  ) : (
                    <>
                      {documents.map((doc) => (
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
                              {doc.title || "Untitled Resume"}
                            </span>
                          </div>

                          {/* Action button */}
                          <button
                            onClick={() => handleSeeChat(doc.id)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors whitespace-nowrap ml-4"
                          >
                            see chat
                          </button>
                        </div>
                      ))}

                      {/* Load More Button */}
                      {hasMore && (
                        <button
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                          className="w-full mt-4 py-2 text-sm font-semibold text-[#5A3FFF] hover:text-[#4832CC] transition-colors disabled:opacity-50"
                        >
                          {isLoadingMore ? "Loading..." : "Load more"}
                        </button>
                      )}
                    </>
                  )}
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
            context="career"
          />
        </div>
      </div>
    </div>
  );
}
