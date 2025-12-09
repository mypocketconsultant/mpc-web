"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Header from "@/app/components/header";
import TimelineWidget from "../components/TimelineWidget";
import AIEditSidebar from "../components/AIEditSidebar";

export default function CreatePlanPage() {
  const pathname = usePathname();
  const [viewType, setViewType] = useState<"week" | "month">("week");
  const [aiInput, setAiInput] = useState("");

  const getTitleFromPath = (path: string) => {
    if (path.includes("/create-plan")) return "Career Planner";
    if (path.includes("/career")) return "Career Advisory";
    return "My Pocket Consultant";
  };

  const planItems = [
    {
      date: "Oct",
      day: 21,
      hasEvents: true,
      tasks: [
        {
          title: "Job Opportunit...",
          time: "10:00",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
        },
        {
          title: "Meeting with d...",
          time: "10:00",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
        },
      ],
    },
    {
      date: "Oct",
      day: 22,
      hasEvents: true,
      tasks: [
        {
          title: "Optimize Link...",
          time: "10:00",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
        },
      ],
    },
    {
      date: "Oct",
      day: 23,
      hasEvents: true,
      tasks: [
        {
          title: "Create study...",
          time: "10:00",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
        },
      ],
    },
    {
      date: "Oct",
      day: 24,
      hasEvents: false,
      tasks: [],
    },
    {
      date: "Oct",
      day: 25,
      hasEvents: true,
      tasks: [
        {
          title: "Create study not...",
          time: "12:00",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
        },
        {
          title: "Meeting with de...",
          time: "09:00",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
        },
      ],
    },
    {
      date: "Oct",
      day: 26,
      hasEvents: false,
      tasks: [],
    },
    {
      date: "Oct",
      day: 27,
      hasEvents: true,
      tasks: [
        {
          title: "Optimize Linked...",
          time: "12:00",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
        },
        {
          title: "Create study no...",
          time: "09:00",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing",
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <Header title={getTitleFromPath(pathname)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto scrollbar-hide">
        <div className="max-w-[1100px] mx-auto px-8 py-8">
          {/* Breadcrumb */}
          <Link
            href="/career"
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

            {/* Right Content - Timeline */}
            <div className="col-span-7">
              <TimelineWidget
                items={planItems}
                currentWeek="October 21-27, 2025"
                viewType={viewType}
                onViewChange={setViewType}
                onPreviousWeek={() => console.log("Previous week")}
                onNextWeek={() => console.log("Next week")}
                onAddGoal={() => console.log("Add goal")}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
