"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Header from "@/app/components/header";
import StudyChatSidebar from "../components/StudyChatSidebar";
import MonthViewCalendar from "../components/MonthViewCalendar";
import CreateStudyPlanModal, {
  NewStudyPlan,
} from "../components/CreateStudyPlanModal";
import { StudyPlan } from "../components/StudyPlanCard";
import { Message } from "../components/ChatMessage";

// Sample data for demonstration
const generateSamplePlans = (): StudyPlan[] => {
  const plans: StudyPlan[] = [];
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate sample plans for the current month
  const planTitles = [
    { title: "Feeling res...", color: "purple" as const },
    { title: "Energy level...", color: "light-purple" as const },
    { title: "Study next topic...", color: "purple" as const },
    { title: "Check with Ai...", color: "light-purple" as const },
    { title: "Exam plan for t...", color: "purple" as const },
    { title: "Review notes...", color: "light-purple" as const },
  ];

  // Add plans to various days
  for (let day = 1; day <= 28; day++) {
    const numPlans =
      Math.random() > 0.6 ? Math.floor(Math.random() * 3) + 1 : 0;
    for (let i = 0; i < numPlans; i++) {
      const randomPlan =
        planTitles[Math.floor(Math.random() * planTitles.length)];
      plans.push({
        id: `plan-${day}-${i}`,
        title: randomPlan.title,
        time: `${9 + Math.floor(Math.random() * 8)}:00`,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
        date: new Date(year, month, day),
        color: randomPlan.color,
      });
    }
  }

  return plans;
};

const initialMessages: Message[] = [
  {
    id: "user-1",
    type: "user",
    content:
      "Create a plan to study English for Grade 7 and include suitable checkpoints and tasks. Set 10am October 21 as the intended date of completion",
    timestamp: new Date("2026-02-15T11:42:00"),
  },
  {
    id: "ai-1",
    type: "ai",
    content: "Your plan has been set. Check your planner for details.",
    timestamp: new Date("2026-02-15T11:43:00"),
  },
];

export default function StudyPlannerPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<StudyPlan[]>(generateSamplePlans());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>(initialMessages);

  const handleEditPlan = (plan: StudyPlan) => {
    // Navigate to edit page or open edit modal
    router.push(`/study/planner/edit/${plan.id}`);
  };

  const handleCreatePlan = () => {
    setIsModalOpen(true);
  };

  const handleSubmitPlan = (newPlan: NewStudyPlan) => {
    const plan: StudyPlan = {
      id: `plan-${Date.now()}`,
      title: newPlan.title,
      time: newPlan.time,
      description: newPlan.description || "No description provided",
      date: new Date(newPlan.date),
      color: newPlan.priority === "high" ? "purple" : "light-purple",
    };
    setPlans((prev) => [...prev, plan]);
  };

  const handleSendMessage = async (message: string): Promise<string> => {
    // In a real implementation, this would call your AI API
    // For now, we'll simulate a response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Check if the message contains keywords to create a plan
    if (
      message.toLowerCase().includes("create") ||
      message.toLowerCase().includes("plan") ||
      message.toLowerCase().includes("study")
    ) {
      return "I've analyzed your request and created a study plan based on your requirements. You can see it in the calendar view. Would you like me to adjust anything?";
    }

    return "I understand. How can I help you with your study planning today?";
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Study Support" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          {/* Back button / Breadcrumb */}
          <Link href="/study">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Study Support / Study Planner</span>
            </button>
          </Link>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Chat sidebar */}
            <div className="lg:col-span-1 h-[calc(100vh-220px)] min-h-[500px]">
              <StudyChatSidebar
                title="Create study plan with Ai"
                initialMessages={chatMessages}
                onSendMessage={handleSendMessage}
              />
            </div>

            {/* Right column - Month View Calendar */}
            <div className="lg:col-span-2">
              <MonthViewCalendar
                plans={plans}
                onEditPlan={handleEditPlan}
                onCreatePlan={handleCreatePlan}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Create Study Plan Modal */}
      <CreateStudyPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitPlan}
      />
    </div>
  );
}
