"use client";

import React, { useState, useRef, useEffect } from "react";
import { Paperclip, Mic, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import FileUploadModal from "./FileUploadModal";

interface InputFooterProps {
  placeholder?: string;
  onSend?: (message: string) => void;
  onAttach?: (file: File) => void;
  onMicrophone?: () => void;
  context: "career" | "life" | "study" | "business-consultancy";
  initialValue?: string;
  isRecording?: boolean;
  isTranscribing?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
}

export default function InputFooter({
  placeholder = "Ask me to optimize your LinkedIn...",
  onSend,
  onAttach,
  onMicrophone,
  context,
  initialValue = "",
  isRecording = false,
  isTranscribing = false,
  value,
  onValueChange,
}: InputFooterProps) {
  const router = useRouter();
  const [internalValue, setInternalValue] = useState(initialValue);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use controlled value if provided, otherwise use internal state
  const inputValue = value !== undefined ? value : internalValue;
  const setInputValue = onValueChange || setInternalValue;

  // Update input value when initialValue changes
  useEffect(() => {
    if (initialValue && value === undefined) {
      setInternalValue(initialValue);
    }
  }, [initialValue, value]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSend?.(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputClick = () => {
    let chatUrl = "/career/chat?context=career";
    if (context === "life") {
      chatUrl = "/Life/chat";
    } else if (context === "study") {
      chatUrl = "/study/chat?context=study";
    } else if (context === "business-consultancy") {
      chatUrl =
        "/modules/business-consultancy/chat?context=business-consultancy";
    }
    router.push(chatUrl);
  };

  const handleAttachClick = () => {
    setIsModalOpen(true);
  };

  const handleFileSelect = (file: File) => {
    onAttach?.(file);
  };

  return (
    <div className="p-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex gap-3 items-center">
          <button
            onClick={handleAttachClick}
            className="flex-shrink-0 p-4 shadow-md hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5 text-gray-600" />
          </button>
          <input
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onClick={handleInputClick}
            className="flex-1 rounded-full border shadow-md border-gray-300 bg-white px-4 py-4 placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] cursor-pointer"
          />
          <button
            onClick={onMicrophone}
            disabled={isTranscribing}
            className={`flex-shrink-0 h-12 w-12 rounded-full text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center ${
              isRecording
                ? "bg-red-500"
                : isTranscribing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-br from-purple-600 to-purple-800"
            }`}
            style={
              isRecording
                ? {
                    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  }
                : undefined
            }
            aria-label={
              isRecording
                ? "Stop recording"
                : isTranscribing
                  ? "Transcribing..."
                  : "Voice input"
            }
          >
            {isTranscribing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleFileSelect}
      />
    </div>
  );
}
