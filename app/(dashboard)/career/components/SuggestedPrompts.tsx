"use client";

import React from "react";
import Link from "next/link";

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
    <div className="w-full my-10">
      <h3 className="text-center text-sm mt text-gray-500 mb-4">
        Today&apos;s suggested prompt
      </h3>
      
      <div className="grid grid-cols-1 mt-10 md:grid-cols-3 gap-4">
        {prompts.map((prompt) => {
          const className = `flex flex-col items-start gap-3 p-5 rounded-2xl transition-all border bg-blue-100 ${
            selectedPrompt === prompt.id
              ? "border-[#9B7FFF] shadow-md"
              : "border-gray-200 hover:shadow-md"
          }`;

          const content = (
            <>
              {/* Icon */}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0"
                style={{ backgroundColor: prompt.iconColor }}
              >
                {prompt.iconImage ? (
                  <img 
                    src={prompt.iconImage} 
                    alt="" 
                    className="w-12 h-12 object-contain" 
                  />
                ) : (
                  <span className="text-2xl">{prompt.icon}</span>
                )}
              </div>

              {/* Title */}
              <span className="text-left text-sm font-semibold text-gray-900 leading-tight">
                {prompt.title}
              </span>
            </>
          );

          if (prompt.href) {
            return (
              <Link key={prompt.id} href={prompt.href}>
                <div className={className}>
                  {content}
                </div>
              </Link>
            );
          }

          return (
            <button
              key={prompt.id}
              type="button"
              onClick={() => onSelect(prompt.id)}
              aria-pressed={selectedPrompt === prompt.id}
              className={className}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}