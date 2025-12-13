"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";

export default function InsightsPage() {
  const pathname = usePathname();
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  const insights = [
    {
      id: "mood-patterns",
      title: "Mood Patterns",
      description: "Your mood tends to be highest on weekends",
      metrics: "↑ 35% positive mood",
      icon: "📊",
    },
    {
      id: "activity-impact",
      title: "Activity Impact",
      description: "Exercise correlates with better mood",
      metrics: "Correlation: 0.78",
      icon: "🏃",
    },
    {
      id: "sleep-quality",
      title: "Sleep Quality",
      description: "7-8 hours of sleep improves next day mood",
      metrics: "↑ 42% improvement",
      icon: "😴",
    },
    {
      id: "stress-factors",
      title: "Stress Factors",
      description: "Work deadlines increase stress levels",
      metrics: "Peak stress: Fridays",
      icon: "😰",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Life Insights" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto max-w-[1100px] mx-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Go back button */}
          <Link href="/Life">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-8 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Life Advisor</span>
            </button>
          </Link>

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Life Insights
            </h1>
            <p className="text-gray-600">
              Discover patterns and trends based on your mood data and lifestyle
            </p>
          </div>

          <hr className="my-8" />

          {/* Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight) => (
              <div
                key={insight.id}
                onClick={() => setSelectedInsight(insight.id)}
                className={`p-6 rounded-2xl cursor-pointer transition-all ${
                  selectedInsight === insight.id
                    ? "bg-[#5A3FFF] text-white shadow-lg"
                    : "bg-gradient-to-br from-[#E8D5FF] to-[#F0E6FF] hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{insight.icon}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{insight.title}</h3>
                <p
                  className={`text-sm mb-4 ${
                    selectedInsight === insight.id
                      ? "text-gray-100"
                      : "text-gray-700"
                  }`}
                >
                  {insight.description}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    selectedInsight === insight.id
                      ? "text-yellow-200"
                      : "text-[#5A3FFF]"
                  }`}
                >
                  {insight.metrics}
                </p>
              </div>
            ))}
          </div>

          <hr className="my-12" />

          {/* Detailed Insights Section */}
          {selectedInsight && (
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {insights.find((i) => i.id === selectedInsight)?.title}
              </h2>
              <p className="text-gray-600 mb-6">
                {insights.find((i) => i.id === selectedInsight)?.description}
              </p>
              <div className="bg-gradient-to-r from-[#E8D5FF] to-[#F0E6FF] p-6 rounded-xl">
                <p className="text-gray-700">
                  Based on your recent activity and mood tracking, we've
                  identified key patterns that could help you optimize your
                  lifestyle. Consider implementing the recommendations provided
                  to improve your overall well-being.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Chat Input Footer */}
      <InputFooter
        placeholder="Ask about your insights..."
        onSend={(message) => console.log("Sent:", message)}
        onAttach={() => console.log("Attach clicked")}
      />
    </div>
  );
}
