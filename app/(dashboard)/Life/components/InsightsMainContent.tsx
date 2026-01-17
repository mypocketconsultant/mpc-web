"use client";

import React from "react";
import { FileText } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import MoodTrends from "./MoodTrends";

interface Document {
  id: number;
  name: string;
  type: string;
  date: string;
}

interface MoodMetric {
  id: string;
  title: string;
  value: string;
  unit: string;
  change: string;
  changeType: "positive" | "negative";
  iconImage: StaticImageData;
  color: string;
}

interface TrendData {
  day: string;
  mood1: number;
  mood2: number;
}

interface InsightsMainContentProps {
  moodMetrics: MoodMetric[];
  moodTrends?: TrendData[];
  selectedPeriod?: string;
  tipsIcon: StaticImageData;
  onDocumentClick?: (docId: number) => void;
  onPeriodChange?: (period: string) => void;
}

export default function InsightsMainContent({
  moodMetrics,
  moodTrends,
  selectedPeriod,
  tipsIcon,
  onPeriodChange,
}: InsightsMainContentProps) {
  return (
    <div className="col-span-2 space-y-6">
      {/* Recent Documents & Daily Tips Row */}
      <div className="grid grid-cols-2 gap-6 ">
        {/* Daily Tips */}
        <div className="bg-white rounded-2xl py-6 flex-col items-center shadow-md px-3 border w-[268px] border-gray-100 ">
          <div className="flex items-start gap-3">
            <Image
              src={tipsIcon}
              alt="Daily Tips"
              width={40}
              height={40}
              className="rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <h6 className="text-lg font-medium text-black mb-3">
                Daily life tips
              </h6>
           
            </div>
          </div>
             <div className="space-y-2 text-sm p-5 text-gray-600">
                <h2 className="font-semibold text-base text-black">• Eat good food</h2>
                <p className="text-base text-black max-w-xs  leading-snug">
                  Improve your diet to include fibre and fruits. This
                  ensures proper dietary nutrition.
                </p>
              </div>
        </div>
      </div>

      {/* Mood Metrics */}
      <div className="grid grid-cols-3 mt-10 gap-4">
        {moodMetrics.map((metric) => (
          <div
            key={metric.id}
            className={`bg-gradient-to-br ${metric.color} rounded-2xl p-5 shadow-md border border-gray-100`}
          >
            <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center mb-3">
              <Image
                src={metric.iconImage}
                alt={metric.title}
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <p className="text-sm text-[#8A1420] font-medium mb-2">
              {metric.title}
            </p>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {metric.value}
            </p>
            <p className="text-xs text-gray-600 mb-2">{metric.unit}</p>
            <p
              className={`text-xs font-medium ${
                metric.changeType === "positive"
                  ? "text-[#B61E2E]"
                  : "text-[#B61E2E]"
              }`}
            >
              {metric.change}
            </p>
          </div>
        ))}
      </div>

      {/* Mood Trends */}
      <MoodTrends
        data={moodTrends}
        selectedPeriod={selectedPeriod}
        onPeriodChange={onPeriodChange}
      />
    </div>
  );
}
