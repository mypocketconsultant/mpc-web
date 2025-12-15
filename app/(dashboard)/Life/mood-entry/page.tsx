"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, X } from "lucide-react";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";
import AIEditSidebar from "../components/FoodAI";

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
  const [overallMood, setOverallMood] = useState(1);
  const [energyLevel, setEnergyLevel] = useState(1);
  const [journalText, setJournalText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarInput, setSidebarInput] = useState("");

  const moodEmojis = ["😢", "😕", "😐", "🙂", "😊", "😃", "🥰", "😍", "✨"];
  const moodLabels = ["Very Bad", "Bad", "Not Great", "Okay", "Good", "Great", "Very Good", "Excellent", "Amazing"];

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
            <button className="flex items-center my-6 gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Life Advisory / Life Planner / New Mood Entry</span>
            </button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                inputValue={sidebarInput}
                onInputChange={setSidebarInput}
              />
            </div>

            {/* Right Column - Mood Entry Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                {/* Header with Close Button */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#5A3FFF] rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      How are you feeling today?
                    </h2>
                  </div>
                  <button
                    onClick={() => window.history.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* Overall Mood Section */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-base font-semibold text-gray-900">
                      Overall Mood
                    </label>
                    <span className="text-lg font-bold text-[#5A3FFF]">
                      {overallMood}/10
                    </span>
                  </div>

                  {/* Emoji Slider */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center px-2">
                      {moodEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => setOverallMood(index + 1)}
                          className={`text-3xl transition-all ${
                            overallMood === index + 1
                              ? "scale-125"
                              : "scale-100 opacity-50"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={overallMood}
                    onChange={(e) => setOverallMood(parseInt(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        #FEE2E2 0%, 
                        #FED7AA 33%, 
                        #FEF3C7 50%, 
                        #D9F99D 66%, 
                        #BBF7D0 100%)`,
                    }}
                  />
                </div>

                {/* Energy Levels Section */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-base font-semibold text-gray-900">
                      Energy Levels
                    </label>
                    <span className="text-lg font-bold text-[#5A3FFF]">
                      {energyLevel}/10 ⚡
                    </span>
                  </div>

                  {/* Energy Slider */}
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-blue-200 to-purple-300 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        #DBEAFE 0%, 
                        #C7D2FE 50%, 
                        #DDD6FE 100%)`,
                    }}
                  />
                </div>

                {/* Journal Entry Section */}
                <div className="mb-8">
                  <label className="text-base font-semibold text-gray-900 mb-3 block">
                    Tell me in your own words
                  </label>
                  <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="How are you feeling? What's on your mind?"
                    className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent resize-none"
                  />
                </div>

                {/* Date and Time */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-500">Date</span>
                      <p className="font-semibold text-gray-900 mt-1">
                        Monday, 17. October
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500">Time</span>
                      <p className="font-semibold text-gray-900 mt-1">
                        08:00 am
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      INTERVIEW
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      CAREER
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      DESIGN
                    </span>
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-8">
                  <button className="w-full bg-[#5A3FFF] text-white font-semibold py-4 rounded-2xl hover:bg-[#4A2FEF] transition-colors shadow-lg shadow-purple-200">
                    Save Mood Entry
                  </button>
                </div>

                {/* Footer Text */}
                <p className="text-center text-xs text-gray-400 mt-6">
                  My Pocket Consultant v.1.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chat Input Footer */}
      <InputFooter
        placeholder="Ask about mood tracking..."
        onSend={(message) => console.log("Sent:", message)}
        onAttach={() => console.log("Attach clicked")}
      />
    </div>
  );
}
