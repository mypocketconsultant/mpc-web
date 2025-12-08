"use client";

import React, { useState } from "react";
import { Paperclip, Mic } from "lucide-react";

interface InputFooterProps {
  placeholder?: string;
  onSend?: (message: string) => void;
  onAttach?: () => void;
  onMicrophone?: () => void;
}

export default function InputFooter({
  placeholder = "Ask me to optimize your LinkedIn...",
  onSend,
  onAttach,
  onMicrophone,
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
    <div className=" border-gray-200 bg-white p-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex gap-3 items-center">
          <button
            onClick={onAttach}
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
            className="flex-1 rounded-full border shadow-md border-gray-300 bg-white px-4 py-4 placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A3FFF]"
          />
          <button
            onClick={onMicrophone}
            className="flex-shrink-0 h-12 w-12 rounded-full text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800"
            aria-label="Voice input"
          >
            <Mic className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
