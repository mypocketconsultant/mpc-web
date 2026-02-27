import React from "react";
import Image from "next/image";

interface DailyTipProps {
  dailyTip: {
    title: string;
    description: string;
  };
  tipsIcon: any;
  title?: string;
}

export default function DailyTips({
  dailyTip,
  tipsIcon,
  title = "Daily tips",
}: DailyTipProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col h-full relative overflow-hidden group hover:shadow-lg transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl">
          <Image src={tipsIcon} alt="Tips" width={32} height={32} />
        </div>
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-900"></span>
          {dailyTip.title}
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed relative z-10">
          {dailyTip.description}
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-100 flex items-start gap-2">
        <div className="mt-0.5 text-[#3DAA41] text-xs font-semibold px-2 py-0.5 flex items-center justify-center border border-[#3DAA41] rounded-full shrink-0">
          i
        </div>
        <p className="text-xs text-[#3DAA41]">
          You can make use of the Financial Literacy module for your business
          finances.
        </p>
      </div>
    </div>
  );
}
