"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Paperclip, Mic, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import FileUploadModal from "./FileUploadModal";

interface InputFooterProps {
  placeholder?: string;
  onSend?: (message: string) => void;
  onAttach?: (file: File) => void;
  onMicrophone?: () => void;
  context:
    | "career"
    | "life"
    | "financial-literacy"
    | "study"
    | "business-consultancy"
    | "faith"
    | "social";
   

  initialValue?: string;
  isRecording?: boolean;
  isTranscribing?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
}

export default function InputFooterWithMic({
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputClick = () => {
    let chatUrl = "/career/chat?context=career";
    if (context === "financial-literacy") {
      chatUrl = "/financial-literacy/chat";
    } else if (context === "life") {
      chatUrl = "/Life/chat";
    } else if (context === "study") {
      chatUrl = "/study/chat?context=study";
    } else if (context === "business-consultancy") {
      chatUrl = "/business-consultancy/chat?context=business-consultancy";
    }else if(context === 'faith'){
      "/faith/chat?context=faith";
    }else if(context === 'social'){
      chatUrl = "/social-impact/chat?context=social";
    }
    router.push(chatUrl);
  };

  const handleAttachClick = () => {
    setIsModalOpen(true);
  };

  const handleFileSelect = (file: File) => {
    onAttach?.(file);
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, []);

  const canSend = inputValue.trim().length > 0;

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex gap-1.5 sm:gap-3 items-end">
          <button
            onClick={handleAttachClick}
            className="flex-shrink-0 p-2 sm:p-3 md:p-4 shadow-md hover:bg-gray-100 rounded-lg transition-colors mb-0.5"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            onClick={handleInputClick}
            className="flex-1 min-w-0 rounded-2xl border shadow-md border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 md:py-4 text-xs sm:text-sm placeholder:text-gray-400 sm:placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] cursor-pointer resize-none overflow-hidden max-h-[140px]"
          />
          {/* <button
            onClick={handleSend}
            disabled={!canSend}
            className={`flex-shrink-0 h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center ${
              canSend
                ? "bg-[#5A3FFF] hover:bg-[#4A2FEF]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            aria-label="Send message"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </button> */}
          <button
            onClick={onMicrophone}
            disabled={isTranscribing}
            className={`flex-shrink-0 h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-2xl text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center ${
              isRecording
                ? "bg-red-500"
                : isTranscribing
                  ? "bg-gray-400 cursor-not-allowed"
                  : 'bg-[conic-gradient(from_230.46deg_at_73.85%_5.97%,#300878_-5.19deg,#5A3FFF_133.27deg,#D4AF37_254.42deg,#300878_354.81deg,#5A3FFF_493.27deg)]'
                //   : "bg-gradient-to-br from-purple-600 to-purple-800"
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
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
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
