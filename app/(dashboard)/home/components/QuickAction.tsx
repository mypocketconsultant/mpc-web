"use client";

import React from "react";
import Image from "next/image";

export interface QuickActionItem {
  title: string;
  icon?: string;
  image?: string;
  bgColor?: string;
  onClick?: () => void;
}

interface QuickActionProps {
  items?: QuickActionItem[];
}

export default function QuickAction({
  items = [
    {
      title: "Recent career docs",
      icon: "👤",
      bgColor: "bg-[#E8D5FF]",
    },
    {
      title: "Career planner",
      icon: "📊",
      bgColor: "bg-[#E8D5FF]",
    },
    {
      title: "AI career agent",
      icon: "🤖",
      bgColor: "bg-[#E8D5FF]",
    },
  ],
}: QuickActionProps) {
  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={item.onClick}
       className="rounded-3xl p-4 flex flex-col justify-between hover:shadow-lg transition-all"
          style={{ 
            background: "linear-gradient(135deg, #E8D5FF 0%, #D4C5F9 50%, #C5B5F0 100%)",
            minHeight: "auto" 
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border flex items-center justify-center flex-shrink-0">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  width={38}
                  height={38}
                  className="rounded-full w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl">{item.icon}</span>
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900">{item.title}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#5A3FFF] to-[#300878] flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-white">→</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
