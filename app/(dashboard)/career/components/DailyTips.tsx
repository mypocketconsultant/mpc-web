import React from "react";
import Image from "next/image";

interface DailyTip {
  title: string;
  description: string;
}

interface DailyTipsProps {
  dailyTip: DailyTip;
  tipsIcon: any;
}

export default function DailyTips({ dailyTip, tipsIcon }: DailyTipsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg h-fit">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br flex-shrink-0">
          <Image src={tipsIcon} alt="Daily Tips" />
        </div>
        <h3 className="font-semibold text-lg text-gray-900 pt-2">
          Daily tips
        </h3>
      </div>
      <ul className="space-y-4 text-sm text-gray-700">
        <li className="flex gap-3">
          <span className="text-[#5A3FFF] font-bold flex-shrink-0 mt-1">
            •
          </span>
          <span>
            <strong className="text-gray-900">{dailyTip.title}</strong>
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">
              {dailyTip.description}
            </p>
          </span>
        </li>
      </ul>
    </div>
  );
}
