"use client";

import React, { useState } from "react";
import { Paperclip, Send } from "lucide-react";

interface InputFooterProps {
  placeholder?: string;
  onSend?: (message: string) => void;
  onAttach?: () => void;
}

export default function InputFooter({
  placeholder = "Ask me to optimize your LinkedIn...",
  onSend,
  onAttach,
}: InputFooterProps) {
  const [inputValue, setInputValue] = useState("");

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

  return (
    <div className="border-t border-gray-200 bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-3">
          <button
            onClick={onAttach}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
            className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-3 placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A3FFF]"
          />
          <button
            onClick={handleSend}
            className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-[#5A3FFF] to-[#300878] text-white hover:from-[#6B4FFF] hover:to-[#400A88] transition-all flex items-center justify-center"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}