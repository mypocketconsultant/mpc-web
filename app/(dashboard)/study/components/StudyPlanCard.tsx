"use client";

import React from "react";

export interface StudyTask {
  id: string;
  user_id: string;
  class_id: string;
  plan_id: string;
  title: string;
  description?: string;
  due_at: string;
  ai_prompts?: string[];
  status: "todo" | "doing" | "done" | "skipped";
  created_at: string;
  updated_at: string;
}

interface StudyPlanCardProps {
  task: StudyTask;
  onEdit?: (task: StudyTask) => void;
  compact?: boolean;
}

const statusColors: Record<string, string> = {
  todo: "bg-[#E8E0FF] border-l-4 border-l-[#7C5CFF]",
  doing: "bg-[#E0F0FF] border-l-4 border-l-[#5C9CFF]",
  done: "bg-[#E0FFE8] border-l-4 border-l-[#5CFF7C]",
  skipped: "bg-[#F5F5F5] border-l-4 border-l-[#AAAAAA]",
};

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function StudyPlanCard({
  task,
  onEdit,
  compact = false,
}: StudyPlanCardProps) {
  const bgColor = statusColors[task.status] || statusColors.todo;

  if (compact) {
    return (
      <div
        className={`${bgColor} rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow`}
        onClick={() => onEdit?.(task)}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm text-gray-900 truncate flex-1">
            {task.title}
          </h4>
          <span className="text-xs text-gray-600 whitespace-nowrap">
            {formatTime(task.due_at)}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
          {task.description || ""}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${bgColor} rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow min-w-[200px] max-w-[280px]`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm text-gray-900 truncate flex-1">
          {task.title}
        </h4>
        <span className="text-xs text-gray-600 whitespace-nowrap">
          {formatTime(task.due_at)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(task);
          }}
          className="text-[#5A3FFF] text-xs font-medium hover:underline whitespace-nowrap"
        >
          Click to edit
        </button>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">
        {task.description || ""}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            task.status === "done"
              ? "bg-green-100 text-green-700"
              : task.status === "doing"
              ? "bg-blue-100 text-blue-700"
              : task.status === "skipped"
              ? "bg-gray-100 text-gray-500"
              : "bg-purple-100 text-purple-700"
          }`}
        >
          {task.status}
        </span>
      </div>
    </div>
  );
}
