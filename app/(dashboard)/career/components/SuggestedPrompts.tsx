"use client";

import React from "react";

export interface SuggestedPrompt {
  id: string;
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Today&apos;s suggested prompt
          </h3>
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                onClick={() => onSelect(prompt.id)}
                aria-pressed={selectedPrompt === prompt.id}
                className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all border-2 ${
                  selectedPrompt === prompt.id
                    ? "bg-gradient-to-r from-[#E8D5FF] to-[#F0E5FF] border-[#9B7FFF]"
                    : `${prompt.bgColor} border-transparent hover:border-gray-200`
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${prompt.bgColor} flex-shrink-0`}
                >
                  <span className={prompt.iconColor}>{prompt.icon}</span>
                </div>
                <span className="text-left text-sm font-medium text-gray-700">
                  {prompt.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
