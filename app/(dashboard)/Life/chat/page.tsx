"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Paperclip, Mic } from "lucide-react";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  document?: {
    title: string;
    icon?: string;
  };
}

export default function LifeChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "user",
      content: "Can you put together a document that tells me of foods that make my mood better?",
    },
    {
      id: "2",
      type: "ai",
      content: "Here's your document",
      document: {
        title: "Foods for better moods",
        icon: "📄",
      },
    },
  ]);

  const [inputValue, setInputValue] = useState("");

  const handleSend = (message: string) => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: message,
      };
      setMessages([...messages, newMessage]);
      setInputValue("");

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: "I'm processing your request...",
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleAttach = () => {
    console.log("Attach file clicked");
  };

  const handleMicrophone = () => {
    console.log("Microphone clicked");
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      {/* Header */}
      <Header title="Life Advisory" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1200px] w-full mx-auto px-8 py-6">
          {/* Breadcrumb */}
          <Link
            href="/Life"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#5A3FFF] transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Life Advisory / Chat
          </Link>

          {/* Chat Messages */}
          <div className="space-y-6 mb-32">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "ai" ? (
                  <div className="max-w-[400px]">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-700 mb-4">
                        {message.content}
                      </p>
                      {message.document && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{message.document.icon}</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {message.document.title}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[500px]">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-800">
                        {message.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Fixed Bottom Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-[900px] mx-auto px-8 py-6">
          {/* Document Info */}
          {messages.some(m => m.document) && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-gray-900">Foods for better moods</span>
                <span className="text-gray-400">📄</span>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-3 shadow-sm hover:border-gray-300 transition-colors">
            <button
              onClick={handleAttach}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(inputValue);
                }
              }}
              placeholder="Ask me to create a plan to boost my mood..."
              className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-gray-400"
            />

            <button
              onClick={handleMicrophone}
              className="flex-shrink-0 p-3 bg-[#5A3FFF] text-white rounded-full hover:bg-[#4A2FEF] transition-colors"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
