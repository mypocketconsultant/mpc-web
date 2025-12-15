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

export default function AIPoweredInsights() {
  const insights: Insight[] = [
    {
      id: "upward-momentum",
      iconImage: mood1Icon,
      iconBg: "bg-red-400",
      cardBg: "bg-[#FDEDED]",
      title: "Upward Momentum",
      titleColor: "text-red-500",
      description:
        "Your mood has been steadily improving over the past week, with a 15% increase in positive emotions.",
    },
    {
      id: "weekend-peak",
      iconImage: mood2Icon,
      iconBg: "bg-purple-500",
      cardBg: "bg-[#FCFCFC]",
      title: "Weekend Peak",
      titleColor: "text-purple-700",
      description:
        "You consistently experience higher mood levels on weekends, particularly Fridays and Saturdays.",
    },
    {
      id: "energy-correlation",
      iconImage: mood3Icon,
      iconBg: "bg-yellow-400",
      cardBg: "bg-[#FCFCFC]",
      title: "Energy Correlation",
      titleColor: "text-red-700",
      description:
        "Your energy levels closely track with your mood, suggestinstrong mind-body connection.",
    },
    {
      id: "mid-week-dip",
      iconImage: mode4Icon,
      iconBg: "bg-indigo-500",
      cardBg: "bg-[#FDEDED]",
      title: "Mid-Week Dip",
      titleColor: "text-red-600",
      description:
        "Wednesdays show slightly lower mood scores. Consider scheduling self-care activities midweek.",
    },
  ];

  return (
    <div className="space-y-4 mt-14 ">
      <h2 className="text-xl font-semibold text-gray-900">
        Ai-Powered Insights
      </h2>

      <div className="grid grid-cols-1  md:grid-cols-2 gap-5">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`${insight.cardBg} rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
          >
            {/* Icon */}
            <div
              className={``}
            >
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
