"use client";

import React, { useState } from "react";
import { Mic, Paperclip, FileText } from "lucide-react";
import FileUploadModal from "@/app/components/FileUploadModal";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface Message {
  id: string;
  type: 'user' | 'assistant';
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
}

export default function FoodAI({
  title = "Chat with AI",
  messages = [],
  onSend,
  onAttach,
  onMicrophone,
  placeholder = "Ask me to modif...",
  isLoading = false,
}: FoodAIProps) {
  const [input, setInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isRecording, isTranscribing, toggleRecording } = useVoiceInput();

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
    console.log("File uploaded:", file);
  };

  const handleMicrophoneClick = () => {
    toggleRecording((text) => {
      setInput(text);
    });
    onMicrophone?.();
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-[calc(100vh-14rem)] flex flex-col">
      {/* Header */}
      <h3 className="font-bold text-gray-900 mb-6 text-lg">{title}</h3>

      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 min-h-0">
        {messages.length === 0 ? (
          <div className="space-y-4">
            {/* User Question Bubble */}
            <div className="flex justify-end">
              <div className="bg-white rounded-2xl p-2 border  border-gray-200 shadow-sm max-w-[80%]">
                <p className="text-sm text-gray-700 text-right leading-relaxed">
                  Can you tell me about my mood trends?
                </p>
              </div>
            </div>

            {/* AI Response Bubble */}
            <div className="flex justify-start">
              <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 max-w-[90%]">
                <p className="text-sm text-gray-600 text-center">
                  Your mood is higher during weekdays. You might thrive on routine and productivity.
                </p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              {message.type === 'user' ? (
                /* User Message Bubble */
                <div className="flex justify-end mb-4">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 max-w-[85%]">
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
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-50 rounded-2xl p-5 max-w-[85%]">
                    <p className="text-sm text-gray-800">
                      {message.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-50 rounded-2xl p-5 max-w-[85%]">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Chat Input - Fixed at Bottom */}
      <div className="pt-4 border-t border-gray-100 flex-shrink-0">

        <div className="flex gap-2 items-center bg-white rounded-full border border-gray-200 px-2 py-2 hover:border-gray-300 transition-colors">
          <button
            onClick={handleAttachClick}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5 text-gray-600 rotate-45" />
          </button>

          <input
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <button
            onClick={handleMicrophoneClick}
            disabled={isLoading || isTranscribing}
            className={`p-2.5 rounded-full flex-shrink-0 flex items-center justify-center transition-all hover:opacity-90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: isRecording
                ? '#EF4444'
                : isLoading || isTranscribing
                  ? '#B0A0FF'
                  : '#5A3FFF'
            }}
            aria-label="Voice input"
          >
            <Mic className="w-5 h-5 text-white" />
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