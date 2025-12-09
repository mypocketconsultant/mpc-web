"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Header from "@/app/components/header";
import AIEditSidebar from "../components/AIEditSidebar";
import CreateGoalForm from "../components/CreateGoalForm";

export default function CreateGoalPage() {
  const pathname = usePathname();
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("08:00 am");
  const [aiInput, setAiInput] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);

  const getTitleFromPath = (path: string) => {
    if (path.includes("/create-goal")) return "Create New Goal";
    if (path.includes("/career")) return "Career Advisory";
    return "My Pocket Consultant";
  };

  const suggestedPrompts = [
    { id: 1, text: "Research company insights using AI", icon: "🤖" },
    { id: 2, text: "Prepare CV", icon: "📄" },
    { id: 3, text: "Prepare Cover Letter", icon: "📝" },
    { id: 4, text: "Send Application", icon: "✉️" },
  ];

  const handlePromptToggle = (promptId: number) => {
    setSelectedPrompts((prev) =>
      prev.includes(promptId.toString())
        ? prev.filter((id) => id !== promptId.toString())
        : [...prev, promptId.toString()]
    );
  };

  const handleCreateGoal = () => {
    console.log("Creating goal:", {
      goalTitle,
      goalDescription,
      selectedDate,
      selectedTime,
      selectedPrompts,
    });
  };

  const handleSendAI = () => {
    if (aiInput.trim()) {
      console.log("AI Message:", aiInput);
      setAiInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendAI();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <Header title={getTitleFromPath(pathname)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto scrollbar-hide">
        <div className="max-w-[1100px] mx-auto px-8 py-8">
          {/* Breadcrumb */}
          <Link
            href="/career/create-plan"
            className="flex items-center gap-2 text-gray-700 hover:text-[#5A3FFF] transition-colors mb-8 font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Career Advisory / Career Planner
          </Link>

          <hr  className="my-10" />

          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar - AI Editor */}

            <div className="col-span-5 sticky top-8 h-fit">
              <AIEditSidebar
                title="Edit with AI"
                resumeTitle="Remi Ladi Resume.pdf"
                resumeSize="55kb"
                updatedResumeTitle="Remi Ladi Resume / CV"
                placeholder="Ask me to modify a plan..."
                inputValue={aiInput}
                onInputChange={setAiInput}
                onSend={(message) => console.log("Sent:", message)}
                onAttach={() => console.log("Attach clicked")}
                onMicrophone={() => console.log("Microphone clicked")}
              />
            </div>
            {/* Right Content - Form */}
            <div className="col-span-7">
              <CreateGoalForm
                goalTitle={goalTitle}
                onTitleChange={setGoalTitle}
                goalDescription={goalDescription}
                onDescriptionChange={setGoalDescription}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                selectedTime={selectedTime}
                onTimeChange={setSelectedTime}
                reminderEnabled={reminderEnabled}
                onReminderChange={setReminderEnabled}
                suggestedPrompts={suggestedPrompts}
                selectedPrompts={selectedPrompts}
                onPromptToggle={handlePromptToggle}
                onCreateGoal={handleCreateGoal}
                onClose={() => window.location.href = "/career/create-plan"}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
