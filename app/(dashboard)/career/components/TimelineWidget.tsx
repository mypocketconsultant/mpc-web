"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export interface PlanItem {
  date: string;
  day: number;
  hasEvents: boolean;
  tasks: Array<{
    id: string;
    title: string;
    time: string;
    description: string;
  }>;
}

interface TimelineWidgetProps {
  items: PlanItem[];
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
  onAddGoal?: () => void;
  currentWeek?: string;
  viewType?: "week" | "month";
  onViewChange?: (view: "week" | "month") => void;
}

export default function TimelineWidget({
  items,
  onPreviousWeek,
  onNextWeek,
  onAddGoal,
  currentWeek = "October 21-27, 2025",
  viewType = "week",
  onViewChange,
}: TimelineWidgetProps) {
  return (
    <div className="rounded-3xl p-6 bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onPreviousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center p-5 bg-white gap-2">
            <span className="text-base font-medium text-gray-700">
              {currentWeek}
            </span>
            <select
              value={viewType}
              onChange={(e) => onViewChange?.(e.target.value as "week" | "month")}
              className="text-base text-gray-600 bg-transparent border-0 focus:outline-none cursor-pointer"
            >
              <option value="week">Week view</option>
              <option value="month">Month view</option>
            </select>
          </div>

          <button
            onClick={onNextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next week"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <Link href="/career/create-goal">
          <button
            onClick={onAddGoal}
            className="px-4 py-2 bg-[#5A3FFF] text-white rounded-xl text-base font-semibold hover:bg-[#4A2FEF] hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            <span>New Goal</span>
          </button>
        </Link>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-4 items-start">
            {/* Date Badge */}
            <div
              className={`flex-shrink-0 w-16 text-center py-3 rounded-xl transition-all ${
                item.hasEvents
                  ? "bg-[#E8D5FF] shadow-sm"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="text-xs font-medium text-gray-600 mb-0.5">
                {item.date}
              </div>
              <div className={`text-lg font-bold ${
                item.hasEvents ? "text-gray-900" : "text-gray-400"
              }`}>
                {item.day}
              </div>
            </div>

            {/* Tasks Container */}
            <div className="flex-1">
              {item.tasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {item.tasks.map((task, taskIdx) => (
                    <div
                      key={taskIdx}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-bold text-base text-gray-900 leading-tight">
                          {task.title}
                        </h4>
                        <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                          {task.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        {task.description}
                      </p>
                      <Link href={`/career/edit-task?planId=${task.id}`}>
                        <button className="text-sm font-semibold text-gray-900 underline hover:text-[#5A3FFF] transition-colors">
                          Click to edit
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center">
                  <span className="text-gray-300">—</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}