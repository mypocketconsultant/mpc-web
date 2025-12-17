"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";
import AIEditSidebar from "../components/FoodAI";
import MoodEntryForm from "../components/MoodEntryForm";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  file?: {
    name: string;
    size: string;
  };
}

export default function MoodEntryPage() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = (message: string) => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: message,
      };
      setMessages([...messages, newMessage]);
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: "I've updated your mood entry based on your input.",
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
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

          <div className="grid grid-cols-2 mt-7 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - AI Edit */}
            <div className="lg:col-span-1 lg:sticky lg:top-6 lg:self-start">
              <AIEditSidebar
                title="Edit with AI"
                messages={messages}
                onSend={handleSend}
                onModify={handleSend}
                onAttach={() => console.log("Attach clicked")}
                onMicrophone={() => console.log("Microphone clicked")}
                placeholder="Ask me to modify a plan..."
              />
            </div>

            {/* Right Column - Mood Entry Form */}
            
            <MoodEntryForm />
          </div>
        </div>
      </main>

     
    </div>
  );
}
