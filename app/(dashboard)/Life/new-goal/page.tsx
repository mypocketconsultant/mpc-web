"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, X } from "lucide-react";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";
import AIEditSidebar from "../components/FoodAI";
import GoalForm from "../components/GoalForm";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  file?: {
    name: string;
    size: string;
  };
}

interface Task {
  id: number;
  text: string;
  completed: boolean;
  aiPrompt?: string;
}

export default function NewGoalPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: "Research the parts of the body", completed: false, aiPrompt: "Run AI prompt" },
    { id: 2, text: "Gather insights on researches done over the past one year in Biology", completed: false, aiPrompt: "Run AI prompt" },
    { id: 3, text: "Sumarize topic in one page", completed: false, aiPrompt: "Run AI prompt" },
    { id: 4, text: "Create six bullet points of key area lacking research", completed: false },
  ]);

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
          content: "I've updated your goal based on your input.",
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handlePublish = () => {
    console.log("Publishing goal:", {
      title: goalTitle,
      description: goalDescription,
      tasks,
      reminderEnabled
    });
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="New Goal" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto max-w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          {/* Breadcrumb */}
          <Link href="/Life">
            <button className="flex items-center my-6 gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Life Advisory / Life Planner / New Goal</span>
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
              />
            </div>

            {/* Right Column - Goal Form */}
            <div className="lg:col-span-2">
              <GoalForm
                goalTitle={goalTitle}
                goalDescription={goalDescription}
                tasks={tasks}
                reminderEnabled={reminderEnabled}
                onGoalTitleChange={setGoalTitle}
                onGoalDescriptionChange={setGoalDescription}
                onToggleTask={toggleTask}
                onReminderToggle={setReminderEnabled}
                onPublish={handlePublish}
                onClose={() => window.history.back()}
              />
            </div>
          </div>
        </div>
      </main>

    
    </div>
  );
}
