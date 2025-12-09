"use client";

import React, { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Header from "@/app/components/header";
import AIEditSidebar from "../components/AIEditSidebar";
import EditTaskForm from "../components/EditTaskForm";

export default function EditTaskPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("id");

  const [taskTitle, setTaskTitle] = useState("Job Opportunit...");
  const [taskDescription, setTaskDescription] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing"
  );
  const [taskTime, setTaskTime] = useState("10:00");
  const [taskDate, setTaskDate] = useState("2025-10-21");
  const [aiInput, setAiInput] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const suggestedActions = [
    { id: 1, text: "Research company insights using AI", hasAiPrompt: true },
    { id: 2, text: "Prepare CV", hasAiPrompt: true },
    { id: 3, text: "Prepare Cover Letter", hasAiPrompt: true },
    { id: 4, text: "Send Application", hasAiPrompt: false },
  ];

  const handleActionToggle = (actionId: number) => {
    setSelectedActions((prev) =>
      prev.includes(actionId.toString())
        ? prev.filter((id) => id !== actionId.toString())
        : [...prev, actionId.toString()]
    );
  };

  const getTitleFromPath = (path: string) => {
    if (path.includes("/edit-task")) return "Edit Task";
    if (path.includes("/career")) return "Career Advisory";
    return "My Pocket Consultant";
  };

  const handleSaveTask = () => {
    console.log("Saving task:", {
      id: taskId,
      title: taskTitle,
      description: taskDescription,
      time: taskTime,
      date: taskDate,
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
    <div className="flex flex-col h-full ">
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
                placeholder="Ask me to modify a task..."
                inputValue={aiInput}
                onInputChange={setAiInput}
                onSend={(message) => console.log("Sent:", message)}
                onAttach={() => console.log("Attach clicked")}
                onMicrophone={() => console.log("Microphone clicked")}
              />
            </div>

            {/* Right Content - Form */}
            <div className="col-span-7">
              <EditTaskForm
                taskTitle={taskTitle}
                onTitleChange={setTaskTitle}
                taskDescription={taskDescription}
                onDescriptionChange={setTaskDescription}
                taskTime={taskTime}
                onTimeChange={setTaskTime}
                taskDate={taskDate}
                onDateChange={setTaskDate}
                reminderEnabled={reminderEnabled}
                onReminderChange={setReminderEnabled}
                suggestedActions={suggestedActions}
                selectedActions={selectedActions}
                onActionToggle={handleActionToggle}
                onSave={handleSaveTask}
                onClose={() => window.location.href = "/career/create-plan"}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
