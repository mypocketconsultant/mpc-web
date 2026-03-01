import React from "react";
import Image from "next/image";

interface DailyTip {
  title: string;
  description: string;
}

interface DailyTipsProps {
  dailyTip: DailyTip;
  tipsIcon: any;
  title?: string;
}

export default function DailyTips({
  dailyTip,
  tipsIcon,
  title = "Daily life tips",
}: DailyTipsProps) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-md w-full sm:w-auto">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center flex-shrink-0">
          <Image
            src={tipsIcon}
            alt={title}
            width={36}
            height={36}
            className="w-7 h-7 sm:w-9 sm:h-9"
          />
        </div>
        <h6 className="font-medium text-base sm:text-xl text-gray-900">
          {title}
        </h6>
      </div>
      <ul className="space-y-2 sm:space-y-3">
        <li className="flex gap-2">
          <span className="text-gray-900 font-bold flex-shrink-0">•</span>
          <div>
            <strong className="text-black text-sm sm:text-base block mb-0.5 sm:mb-1">
              {dailyTip.title}
            </strong>
            <p className="text-black text-xs sm:text-sm leading-snug">
              {dailyTip.description}
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
}
