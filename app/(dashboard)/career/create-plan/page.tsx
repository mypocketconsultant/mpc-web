"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Mic, Paperclip } from "lucide-react";
import Link from "next/link";
import Header from "@/app/components/header";

export default function CreatePlanPage() {
  const pathname = usePathname();
  const [viewType, setViewType] = useState<"week" | "month">("week");

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

          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar */}
            <div className="col-span-5">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-8 flex flex-col h-fit">
                <h3 className="font-bold text-gray-900 mb-12 text-base">Edit with AI</h3>

                {/* Resume Scan Section */}
                <div className="mb-12 flex-1">
                  <p className="text-center text-sm text-gray-600 mb-6 leading-relaxed">
                    Run a 10-sec scan of my Resume
                  </p>
                  <div className="text-center bg-gray-50 rounded-2xl p-4 mb-4">
                    <div className="inline-flex items-center gap-2 mb-2">
                      <span className="text-lg">📄</span>
                      <span className="text-sm font-semibold text-[#5A3FFF]">
                        Remi Ladi Resume.pdf
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">55kb</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-6"></div>

                {/* Updated Resume Section */}
                <div className="mb-12">
                  <p className="text-sm text-gray-600 mb-3">Here's your updated Resume.</p>
                  <div className="inline-flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <span className="text-sm font-semibold text-gray-900">
                      Remi Ladi Resume / CV
                    </span>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="flex gap-3 items-center mt-auto">
                  <button className="p-3 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  <input
                    type="text"
                    placeholder="Ask me to modify a plan..."
                    className="flex-1 px-4 py-3 rounded-full bg-gray-100 text-sm focus:outline-none transition-all"
                  />
                  <button
                    className="p-3 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: "#5A3FFF" }}
                  >
                    <Mic className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Content - Timeline */}
            <div className="col-span-7">
              <div className=" rounded-3xl p-8  border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                      <ChevronLeft className="w-4 h-4 text-gray-400" />
                    </button>
                    <span className="text-xs font-medium text-gray-500 px-2">
                      October 21-27, 2025
                    </span>
                    <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <select className="text-xs font-medium text-gray-600 bg-transparent border-0 focus:outline-none px-0 py-0 ml-2">
                      <option>Week view</option>
                      <option>Month view</option>
                    </select>
                  </div>
                  <button
                    className="px-3 py-1 bg-[#5A3FFF] text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all flex items-center gap-1"
                  >
                    <span>+</span> New Goal
                  </button>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  {planItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      {/* Date */}
                      <div
                        className="flex-shrink-0 w-12 text-center py-2 rounded-xl font-bold text-sm"
                        style={{
                          backgroundColor: item.hasEvents ? "#E8D5FF" : "#f3f4f6",
                          color: item.hasEvents ? "#111827" : "#9ca3af",
                        }}
                      >
                        <div className="text-xs leading-none">{item.date}</div>
                        <div className="text-sm">{item.day}</div>
                      </div>

                      {/* Tasks */}
                      <div className="flex-1 flex flex-wrap gap-3">
                        {item.tasks.length > 0 ? (
                          item.tasks.map((task, taskIdx) => (
                            <div
                              key={taskIdx}
                              className="flex-1 min-w-[200px] bg-white border border-gray-200 rounded-xl p-3 hover:shadow-sm transition-shadow"
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 text-xs leading-tight flex-1">
                                  {task.title}
                                </h4>
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {task.time}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mb-2 leading-snug">
                                {task.description}
                              </p>
                              <button className="text-xs font-semibold text-[#5A3FFF] hover:text-[#300878] transition-colors">
                                Click to edit
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-300">-</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
