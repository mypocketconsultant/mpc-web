"use client";

import React from "react";
import { Mic, Paperclip, Download } from "lucide-react";

interface AIEditSidebarProps {
  title?: string;
  resumeTitle?: string;
  resumeSize?: string;
  updatedResumeTitle?: string;
  onSend?: (message: string) => void;
  onAttach?: () => void;
  onMicrophone?: () => void;
  placeholder?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

export default function AIEditSidebar({
  title = "Edit with Ai",
  resumeTitle = "Remi Ladi Resume.pdf",
  resumeSize = "55kb",
  updatedResumeTitle = "Remi Ladi Resume / CV",
  onSend,
  onAttach,
  onMicrophone,
  placeholder = "Ask me to modify a plan...",
  inputValue = "",
  onInputChange,
}: AIEditSidebarProps) {
  const handleSend = () => {
    if (inputValue.trim()) {
      onSend?.(inputValue);
      onInputChange?.("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-[calc(100vh-14rem)] flex flex-col">
      {/* Header */}
      <h3 className="font-bold text-gray-900 mb-8 text-lg">{title}</h3>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6">
        {/* Resume Scan Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-700 text-center mb-4 leading-relaxed">
            Run a 10-sec scan of my Resume
          </p>
          
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm">📄</span>
              </div>
              <span className="text-sm font-semibold text-[#5A3FFF]">
                {resumeTitle}
              </span>
            </div>
            <span className="text-xs text-gray-500 ml-2">{resumeSize}</span>
          </div>
        </div>

        {/* Updated Resume Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-700 mb-4">
            Here&apos;s your updated Resume.
          </p>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Download className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {updatedResumeTitle}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Input - Fixed at Bottom */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex gap-2 items-center bg-white rounded-full border border-gray-200 px-2 py-2 hover:border-gray-300 transition-colors">
          <button
            onClick={onAttach}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5 text-gray-600 rotate-45" />
          </button>
          
          <input
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => onInputChange?.(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none placeholder:text-gray-400"
          />
          
          <button
            onClick={onMicrophone}
            className="p-2.5 rounded-full flex-shrink-0 flex items-center justify-center transition-all hover:opacity-90 hover:shadow-md"
            style={{ backgroundColor: "#5A3FFF" }}
            aria-label="Voice input"
          >
            <Mic className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}