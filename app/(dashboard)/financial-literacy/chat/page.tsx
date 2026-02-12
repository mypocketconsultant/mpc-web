"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mic, Paperclip, Send } from "lucide-react";
import Header from "@/app/components/header";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

const suggestedPrompts = [
  "How can I create a budget that works for me?",
  "What's the 50/30/20 rule for budgeting?",
  "How do I start building an emergency fund?",
  "Tips for reducing my monthly expenses",
];

function FinanceChatContent() {
  const searchParams = useSearchParams();
  const context = searchParams.get("context") || "finance";

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
      // Simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const aiResponses: Record<string, string> = {
        budget:
          "Creating an effective budget starts with tracking your income and expenses. I recommend the 50/30/20 rule:\n\n• 50% for needs (rent, utilities, groceries)\n• 30% for wants (entertainment, dining out)\n• 20% for savings and debt repayment\n\nWould you like me to help you set up a personalized budget plan?",
        savings:
          "Building an emergency fund is crucial for financial security. Here's a step-by-step approach:\n\n1. Start with a goal of $1,000 for unexpected expenses\n2. Then work toward 3-6 months of living expenses\n3. Keep it in a high-yield savings account\n4. Automate your savings with direct deposits\n\nHow much would you like to start saving monthly?",
        default:
          "I can help you with various aspects of personal finance including:\n\n• Budgeting and expense tracking\n• Saving strategies\n• Debt management\n• Investment basics\n• Cash flow analysis\n\nWhat specific area would you like to explore?",
      };

      let responseContent = aiResponses.default;
      const lowerInput = userMessage.content.toLowerCase();

      if (lowerInput.includes("budget") || lowerInput.includes("spending")) {
        responseContent = aiResponses.budget;
      } else if (
        lowerInput.includes("save") ||
        lowerInput.includes("saving") ||
        lowerInput.includes("emergency")
      ) {
        responseContent = aiResponses.savings;
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "ai",
        content:
          "I apologize, but I encountered an error. Please try again.",
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

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Finance Literacy" />

      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="max-w-[900px] w-full mx-auto px-4 sm:px-6 py-4 flex flex-col h-full">
          {/* Back button */}
          <Link href="/financial-literacy">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-4 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Finance Literacy / Chat with AI Agent</span>
            </button>
          </Link>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                {/* Welcome State */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E8E0FF] to-[#F3F0FF] flex items-center justify-center mb-6">
                  <svg
                    className="w-10 h-10 text-[#5A3FFF]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Financial AI Assistant
                </h2>
                <p className="text-gray-500 mb-8 max-w-md">
                  I&apos;m here to help you manage your finances better. Ask me
                  about budgeting, saving, investing, or any financial topic.
                </p>

                {/* Suggested Prompts */}
                <div className="w-full max-w-lg">
                  <p className="text-sm text-gray-500 mb-3">
                    Try one of these prompts:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestedPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedPrompt(prompt)}
                        className="text-left p-3 bg-gradient-to-br from-[#F8F6FF] to-[#F3F0FF] rounded-xl text-sm text-gray-700 hover:shadow-md hover:scale-[1.02] transition-all border border-[#E8E0FF]"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.type === "ai" ? "justify-start" : "justify-end"
                    }`}
                  >
                    {message.type === "ai" && (
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
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] ${
                        message.type === "ai"
                          ? "bg-white border border-gray-200 rounded-2xl rounded-tl-md"
                          : "bg-gradient-to-br from-[#E8E0FF] to-[#F3F0FF] rounded-2xl rounded-tr-md"
                      } px-4 py-3 shadow-sm`}
                    >
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-2 block">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {message.type === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
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
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <button
                className="flex-shrink-0 p-3 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Attach file"
              >
                <Paperclip className="h-5 w-5 text-gray-500" />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me how to make my finances better."
                className="flex-1 bg-gray-50 rounded-full px-5 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:bg-white transition-all"
                disabled={isLoading}
              />

              <button
                className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-[#5A3FFF] to-[#300878] text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                aria-label="Voice input"
              >
                <Mic className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function FinanceChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          Loading...
        </div>
      }
    >
      <FinanceChatContent />
    </Suspense>
  );
}
