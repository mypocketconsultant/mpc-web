"use client";

import React from "react";
import { Mic, Paperclip, FileText } from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  file?: {
    name: string;
    size: string;
  };
}

interface AIEditSidebarProps {
  title?: string;
  messages?: Message[];
  onSend?: (message: string) => void;
  onAttach?: () => void;
  onMicrophone?: () => void;
  placeholder?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

export default function AIEditSidebar({
  title = "Edit with Ai",
  messages = [],
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
      <h3 className="font-bold text-gray-900 mb-6 text-lg">{title}</h3>

      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400 text-center">
              Start a conversation
            </p>
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

        {/* Bottom Document Reference */}
        {messages.length > 0 && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm font-semibold text-gray-900">
              Remi Ladi Resume / CV
            </span>
            <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
              <FileText className="w-3 h-3 text-blue-600" />
            </div>
          </div>
        )}
      </div>

      {/* Chat Input - Fixed at Bottom */}
      <div className="pt-4 border-t border-gray-100 flex-shrink-0">
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