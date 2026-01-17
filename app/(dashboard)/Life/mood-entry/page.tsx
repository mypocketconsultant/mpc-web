"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Header from "@/app/components/header";
import AIEditSidebar from "../components/FoodAI";
import MoodEntryForm from "../components/MoodEntryForm";
import { apiService } from "@/lib/api/apiService";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  file?: {
    name: string;
    size: string;
  };
}

interface LifeChatResponse {
  status: string;
  message: string;
  data: {
    module: string;
    intent: string;
    message: string;
    plan?: unknown;
    actions?: unknown[];
    metadata?: unknown;
  };
}

export default function MoodEntryPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `mood-${Date.now()}`);
  const { toast, showToast } = useToast();

  const handleSend = async (message: string) => {
    if (message.trim() && !isLoading) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: message,
      };
      setMessages(prev => [...prev, newMessage]);
      setIsLoading(true);

      try {
        const response = await apiService.post<LifeChatResponse>('/v1/life/chat', {
          message,
          session_id: sessionId,
        });

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.data?.message || "I've processed your request.",
        };
        setMessages(prev => [...prev, aiResponse]);
      } catch (error) {
        console.error('[MoodEntryPage] Chat error:', error);
        showToast('error', "Sorry, I couldn't process your request. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="New Mood Entry" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto max-w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          {/* Breadcrumb */}
          <Link href="/Life">
            <button className="flex items-center my-10 gap-2 text-sm text-black hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Life Advisory / Life Planner / New Mood Entry</span>
            </button>
          </Link>

          <div className="flex gap-6 mt-7">
            {/* Left Sidebar - AI Edit (35%) */}
            <div className="w-[35%] sticky top-6 self-start">
              <AIEditSidebar
                title="Chat with AI"
                messages={messages}
                onSend={handleSend}
                onModify={handleSend}
                onAttach={() => console.log("Attach clicked")}
                onMicrophone={() => console.log("Microphone clicked")}
                placeholder="Ask me to modify a plan..."
                isLoading={isLoading}
                emptyStateMessage="Tell me how you're feeling and I'll help you track your mood..."
              />
            </div>

            {/* Right Column - Mood Entry Form (65%) */}
            <div className="w-[65%] flex justify-center">
              <MoodEntryForm />
            </div>
          </div>
        </div>
      </main>

      <Toast toast={toast} />
    </div>
  );
}
