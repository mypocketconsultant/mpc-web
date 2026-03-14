"use client";

import React, { useState, useRef, useCallback } from "react";
import { Mic, Paperclip, FileText } from "lucide-react";
import FileUploadModal from "@/app/components/FileUploadModal";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  file?: {
    name: string;
    size: string;
  };
}

interface FoodAIProps {
  title?: string;
  messages?: Message[];
  onSend?: (message: string) => void;
  onModify?: (message: string) => void;
  onAttach?: () => void;
  onMicrophone?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  emptyStateMessage?: string;
}

export default function FoodAI({
  title = "Chat with AI",
  messages = [],
  onSend,
  onAttach,
  onMicrophone,
  placeholder = "Ask me to modif...",
  isLoading = false,
  emptyStateMessage = "Start a conversation",
}: FoodAIProps) {
  const [input, setInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isRecording, isTranscribing, toggleRecording } = useVoiceInput();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, []);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      // onModify?.(input);
      onSend?.(input);
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAttachClick = () => {
    setIsModalOpen(true);
  };

  const handleFileUpload = (file: File) => {
    onAttach?.();
    // File upload handled by parent component
  };

  const handleMicrophoneClick = () => {
    toggleRecording((text) => {
      setInput(text);
    });
    onMicrophone?.();
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100 h-[60vh] lg:h-[calc(100vh-14rem)] flex flex-col">
      {/* Header */}
      <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 text-base sm:text-lg">{title}</h3>

      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-4 sm:mb-6 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400 text-center">
              {emptyStateMessage}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              {message.type === "user" ? (
                /* User Message Bubble */
                <div className="flex justify-end mb-3 sm:mb-4">
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-5 max-w-[90%] sm:max-w-[85%]">
                    <p className="text-sm text-gray-700 text-right mb-3">
                      {message.content}
                    </p>
                    {message.file && (
                      <div className="flex items-center justify-between gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-sm font-semibold text-[#5A3FFF]">
                            {message.file.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {message.file.size}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Assistant Message Bubble */
                <div className="flex justify-start mb-3 sm:mb-4">
                  <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 max-w-[90%] sm:max-w-[85%]">
                    <p className="text-sm text-gray-800">{message.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex justify-start mb-3 sm:mb-4">
            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 max-w-[90%] sm:max-w-[85%]">
              <div className="flex items-center gap-1">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input - Fixed at Bottom */}
      <div className="pt-3 sm:pt-4 border-t border-gray-100 flex-shrink-0">
        <div className="flex gap-1.5 sm:gap-2 items-end bg-white rounded-2xl border border-gray-200 px-1.5 sm:px-2 py-1.5 sm:py-2 hover:border-gray-300 transition-colors">
          <button
            onClick={handleAttachClick}
            disabled={isLoading}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
            aria-label="Attach file"
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 rotate-45" />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            placeholder={placeholder}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-transparent focus:outline-none placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed resize-none overflow-hidden max-h-[120px]"
          />

          <button
            onClick={handleMicrophoneClick}
            disabled={isLoading || isTranscribing}
            className={`p-2 sm:p-2.5 rounded-full flex-shrink-0 flex items-center justify-center transition-all hover:opacity-90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording ? "animate-pulse" : ""
            }`}
            style={{
              backgroundColor: isRecording
                ? "#EF4444"
                : isLoading || isTranscribing
                  ? "#B0A0FF"
                  : "#5A3FFF",
            }}
            aria-label="Voice input"
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleFileUpload}
      />
    </div>
  );
}
