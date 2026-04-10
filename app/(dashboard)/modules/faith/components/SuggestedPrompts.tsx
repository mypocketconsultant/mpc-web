"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export interface SuggestedPrompt {
  id: string;
  title: string;
  icon?: React.ReactNode;
  iconImage?: string;
  bgColor: string;
  iconColor: string;
  href?: string;
}

interface SuggestedPromptsProps {
  prompts: SuggestedPrompt[];
  selectedPrompt: string | null;
  onSelect: (id: string) => void;
}

export default function SuggestedPrompts({
  prompts,
  selectedPrompt,
  onSelect,
}: SuggestedPromptsProps) {
  return (
    <div className="w-full my-10 relative z-10">
      <h3 className="text-center text-gray-400 font-medium mb-6">
        Today&apos;s suggested prompt
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {prompts.map((prompt) => {
          const className = `flex flex-col items-start gap-4 p-5 rounded-2xl transition-all border ${
            selectedPrompt === prompt.id
              ? "border-[#5A3FFF] shadow-md bg-white/60 backdrop-blur-sm"
              : "border-gray-100 bg-gradient-to-br from-[#F5F3FF] to-[#E9E1FF] hover:shadow-md hover:-translate-y-1"
          }`;

          const content = (
            <>
              {/* Icon */}
            <div className="flex items-center justify-center flex-shrink-0">
  {prompt.iconImage ? (
    <Image
      src={prompt.iconImage}
      alt=""
      width={40}
      height={40}
      className="object-cover rounded-2xl"
    />
  ) : (
    <span className="text-lg text-blue-500">{prompt.icon}</span>
  )}
</div>

              {/* Title */}
              <span className="text-left text-sm font-bold text-[#2A2A42] leading-tight">
                {prompt.title} 
              </span>
            </>
          );

          if (prompt.href) {
            return (
              <Link key={prompt.id} href={prompt.href} className="w-full">
                <div className={className}>{content}</div>
              </Link>
            );
          }

          return (
            <button
              key={prompt.id}
              type="button"
              onClick={() => onSelect(prompt.id)}
              aria-pressed={selectedPrompt === prompt.id}
              className={`w-full text-left ${className}`}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
