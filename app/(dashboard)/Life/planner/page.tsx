"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";
import AIEditSidebar from "../components/FoodAI";
import PlannerCalendar from "../components/PlannerCalendar";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
}

interface CalendarEvent {
  id: number;
  date: string;
  day: number;
  title: string;
  time: string;
  description: string;
  clickToEdit: boolean;
  status?: 'unresolved' | 'resolved';
  color: string;
}

export default function LifePlannerPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'mood' | 'goals'>('all');

  const events: CalendarEvent[] = [
    {
      id: 1,
      date: "Oct 21",
      day: 21,
      title: "Feeling really sad",
      time: "10:00",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
      clickToEdit: true,
      status: 'unresolved',
      color: "bg-red-100 border-red-200"
    },
    {
      id: 2,
      date: "Oct 22",
      day: 22,
      title: "Excited for Tech...",
      time: "10:00",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
      clickToEdit: true,
      color: "bg-red-100 border-red-200"
    },
    {
      id: 3,
      date: "Oct 23",
      day: 23,
      title: "Energy levels a...",
      time: "10:00",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
      clickToEdit: true,
      color: "bg-red-200 border-red-300"
    },
    {
      id: 4,
      date: "Oct 25",
      day: 25,
      title: "My car develo...",
      time: "12:00",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
      clickToEdit: true,
      color: "bg-red-300 border-red-400"
    },
    {
      id: 5,
      date: "Oct 25",
      day: 25,
      title: "Unresolved",
      time: "10:00",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
      clickToEdit: true,
      status: 'unresolved',
      color: "bg-gray-100 border-gray-200"
    },
    {
      id: 6,
      date: "Oct 25",
      day: 25,
      title: "New hub has...",
      time: "09:00",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
      clickToEdit: true,
      color: "bg-gray-100 border-gray-200"
    },
    {
      id: 7,
      date: "Oct 27",
      day: 27,
      title: "Princess rest...",
      time: "12:00",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
      clickToEdit: true,
      color: "bg-red-300 border-red-400"
    },
    {
      id: 8,
      date: "Oct 27",
      day: 27,
      title: "Encore Guides..",
      time: "09:00",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
      clickToEdit: true,
      color: "bg-gray-100 border-gray-200"
    },
  ];

  const handleSend = (message: string) => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: message,
      };
      setMessages([...messages, newMessage]);
      
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: "I've updated your planner based on your input.",
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event);
  };

  const handleNewGoal = () => {
    console.log("New goal clicked");
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Life Planner" />

      <main className="flex-1 overflow-auto max-w-full">
        <div className="max-w-[1300px] mx-auto px-6 py-6">
          {/* Breadcrumb */}
          <Link href="/Life">
            <button className="flex items-center my-6 gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Life Advisory / Life Planner</span>
            </button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
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

            {/* Right Column - Calendar - Full Width */}
            <div className="lg:col-span-2">
              <PlannerCalendar
              //@ts-ignore
                viewMode={viewMode}
                selectedFilter={selectedFilter}
                events={events}
                onViewModeChange={setViewMode}
                onFilterChange={setSelectedFilter}
                onNewGoalClick={handleNewGoal}
                onEventClick={handleEventClick}
              />
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
