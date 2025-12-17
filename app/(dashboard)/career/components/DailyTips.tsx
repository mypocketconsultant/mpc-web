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

export default function DailyTips({ dailyTip,  tipsIcon, title = "Daily life tips" }: DailyTipsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md w-[300px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-12 w-12 items-center justify-center  flex-shrink-0">
          <Image src={tipsIcon} alt={title} width={36} height={36} />
        </div>
        <h6 className="font-medium text-xl text-gray-900">
          {title}
        </h6>
      </div>
      <ul className="space-y-3">
        <li className="flex gap-2">
          <span className="text-gray-900 font-bold flex-shrink-0">
            •
          </span>
          <div>
            <strong className="text-black text-base block mb-1">
              {dailyTip.title}
            </strong>
            <p className="text-black text-sm leading-snug">
              {dailyTip.description}
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
}
