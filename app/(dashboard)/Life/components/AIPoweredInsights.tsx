"use client";

import React from "react";
import Image, { StaticImageData } from "next/image";
import mood1Icon from "@/public/Mood1.png";
import mood2Icon from "@/public/Mood2.png";
import mood3Icon from "@/public/Mood3.png";
import mode4Icon from "@/public/mode4.png";

interface Insight {
  id: string;
  iconImage: StaticImageData;
  iconBg: string;
  cardBg: string;
  title: string;
  titleColor: string;
  description: string;
}

interface AIPoweredInsightsProps {
  insights?: Insight[];
  isLoading?: boolean;
}

// Default insights when no data is available
const defaultInsights: Insight[] = [
  {
    id: "keep-tracking",
    iconImage: mood1Icon,
    iconBg: "bg-blue-400",
    cardBg: "bg-[#FCFCFC]",
    title: "Keep Tracking",
    titleColor: "text-blue-600",
    description:
      "Continue logging your mood to unlock personalized insights. The more data we have, the better patterns we can identify.",
  },
];

export default function AIPoweredInsights({
  insights,
  isLoading = false
}: AIPoweredInsightsProps) {
  // Use provided insights or default
  const displayInsights = insights && insights.length > 0 ? insights : defaultInsights;

  if (isLoading) {
    return (
      <div className="space-y-4 mt-14">
        <h2 className="text-xl font-semibold text-gray-900">
          Ai-Powered Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-2xl p-5 shadow-sm animate-pulse"
            >
              <div className="w-7 h-7 bg-gray-200 rounded-full" />
              <div className="h-5 bg-gray-200 rounded mt-4 w-32" />
              <div className="h-4 bg-gray-200 rounded mt-3 w-full" />
              <div className="h-4 bg-gray-200 rounded mt-2 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-14">
      <h2 className="text-xl font-semibold text-gray-900">
        Ai-Powered Insights
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayInsights.map((insight) => (
          <div
            key={insight.id}
            className={`${insight.cardBg} rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
          >
            {/* Icon */}
            <div>
              <Image
                src={insight.iconImage}
                alt={insight.title}
                width={26}
                height={26}
                className="object-contain"
              />
            </div>

            {/* Title */}
            <h3 className={`text-lg font-medium mt-4 ${insight.titleColor} mb-3`}>
              {insight.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-800 leading-relaxed">
              {insight.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}