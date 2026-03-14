"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic } from "lucide-react";
import ChatMessage, { Message } from "./ChatMessage";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface StudyChatSidebarProps {
  title?: string;
  onSendMessage?: (message: string) => Promise<string>;
  initialMessages?: Message[];
}

export default function StudyChatSidebar({
  title = "Create study plan with Ai",
  onSendMessage,
  initialMessages = [],
}: StudyChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, []);
  const { isRecording, isTranscribing, toggleRecording } = useVoiceInput();

  const handleMicrophone = () => {
    toggleRecording((text: string) => {
      setInputValue((prev) => (prev ? `${prev} ${text}` : text));
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      if (onSendMessage) {
        const response = await onSendMessage(userMessage.content);
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Default AI response for demo
        setTimeout(() => {
          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            type: "ai",
            content:
              "Your plan has been set. Check your planner for details.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
          setIsLoading(false);
        }, 1000);
        return;
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "ai",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
        <h3 className="font-semibold text-sm sm:text-base text-gray-900">{title}</h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-3 sm:px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#E8E0FF] to-[#F3F0FF] flex items-center justify-center mb-3 sm:mb-4">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-[#5A3FFF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Start a conversation to create your study plan with AI
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start mb-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#5A3FFF] to-[#300878] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-gray-100">
        <div className="flex items-end gap-1.5 sm:gap-2 bg-gray-50 rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyPress}
            placeholder={isTranscribing ? "Transcribing..." : "Type your message..."}
            className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none resize-none overflow-hidden max-h-[120px] py-1"
            disabled={isLoading || isTranscribing}
          />
          {inputValue.trim() ? (
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="flex-shrink-0 p-2 bg-gradient-to-br from-[#5A3FFF] to-[#300878] text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleMicrophone}
              disabled={isLoading || isTranscribing}
              className={`flex-shrink-0 p-2 text-white rounded-lg transition-all ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600"
                  : isTranscribing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-br from-[#5A3FFF] to-[#300878] hover:shadow-lg"
              }`}
              style={isRecording ? { animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" } : undefined}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
