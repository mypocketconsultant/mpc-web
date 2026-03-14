"use client";

import React from "react";

export default function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="max-w-xl">
        <div className="bg-gradient-to-br from-[#F8F7FF] to-[#FEFEFF] rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-[#E8E4FF]">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Animated dots */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#5A3FFF] rounded-full animate-pulse"
                style={{ animationDuration: "1.4s", animationDelay: "0s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#7B61FF] rounded-full animate-pulse"
                style={{ animationDuration: "1.4s", animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#9B7FFF] rounded-full animate-pulse"
                style={{ animationDuration: "1.4s", animationDelay: "0.4s" }}
              ></div>
            </div>

            {/* Thinking text with fade animation */}
            <span className="text-xs sm:text-sm font-medium text-[#5A3FFF] animate-pulse">
              Thinking...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}