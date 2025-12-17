"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, FileText, Zap, Lightbulb } from "lucide-react";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";
import Image from "next/image";
import tipsIcon from "@/public/tip.png";
import mood1Icon from "@/public/Mood1.png";
import mood2Icon from "@/public/Mood2.png";
import mood3Icon from "@/public/Mood3.png";
import FoodAI from "../components/FoodAI";
import InsightsMainContent from "../components/InsightsMainContent";
import AIPoweredInsights from "../components/AIPoweredInsights";


export default function InsightsPage() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const recentDocuments = [
    {
      id: 1,
      name: "Foods that...y mood.pdf",
      type: "pdf",
      date: "see prompt history",
    },
  ];

  const moodMetrics = [
    {
      id: "avg-mood",
      title: "Your Avg. Mood",
      value: "7.2",
      unit: "out of 10",
      change: "0.8 from last week",
      changeType: "positive" as const,
      iconImage: mood1Icon,
      color: "from-[#FDEDED] to-[#FDEDED]",
    },
    {
      id: "mood-stability",
      title: "Mood Stability",
      value: "84%",
      unit: "out of 10",
      change: "5% improvement",
      changeType: "positive" as const,
      iconImage: mood2Icon,
      color: "from-[#FCFCFC] to-[#FCFCFC]",
    },
    {
      id: "energy-level",
      title: "Energy Level",
      value: "6.8",
      unit: "out of 10",
      change: "0.3 from last week",
      changeType: "negative" as const,
      iconImage: mood3Icon,
      color: "from-[#FDEDED] to-[#FDEDED]",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Insights and reports" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto max-w-full">
        <div className="max-w-[1300px] mx-auto px-6 py-6">
          {/* Breadcrumb */}
          <Link href="/Life">
            <button className="flex items-center my-6 gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Life Advisory / Insights and reports</span>
            </button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - FoodAI Component */}
            <div className="lg:col-span-1 lg:sticky lg:top-6 lg:self-start">
              <FoodAI
                onModify={(message) => {
                  console.log("Modify request:", message);
                  // Handle AI modification request
                }}
                onAttach={() => {
                  console.log("Attach clicked");
                  // Handle file attachment
                }}
                onMicrophone={() => {
                  console.log("Microphone clicked");
                  // Handle voice input
                }}
              />
            </div>

            {/* Right Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <InsightsMainContent
                recentDocuments={recentDocuments}
                moodMetrics={moodMetrics}
                tipsIcon={tipsIcon}
                onDocumentClick={(docId) => {
                  console.log("Document clicked:", docId);
                  setSelectedDocument(docId.toString());
                }}
                onPeriodChange={(period) => {
                  console.log("Period changed:", period);
                }}
              />

              {/* AI-Powered Insights */}
              <AIPoweredInsights />
            </div>
          </div>
        </div>
      </main>

    
    </div>
  );
}
