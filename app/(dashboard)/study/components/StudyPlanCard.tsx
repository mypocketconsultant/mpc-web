"use client";

import React from "react";

export interface StudyPlan {
  id: string;
  title: string;
  time: string;
  description: string;
  date: Date;
  color?: "purple" | "light-purple" | "blue";
}

interface StudyPlanCardProps {
  plan: StudyPlan;
  onEdit?: (plan: StudyPlan) => void;
  compact?: boolean;
}

export default function StudyPlanCard({
  plan,
  onEdit,
  compact = false,
}: StudyPlanCardProps) {
  const colorClasses = {
    purple: "bg-[#E8E0FF] border-l-4 border-l-[#7C5CFF]",
    "light-purple": "bg-[#F3F0FF] border-l-4 border-l-[#A393FF]",
    blue: "bg-[#E0F0FF] border-l-4 border-l-[#5C9CFF]",
  };

  const bgColor = colorClasses[plan.color || "purple"];

  if (compact) {
    return (
      <div
        className={`${bgColor} rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow`}
        onClick={() => onEdit?.(plan)}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm text-gray-900 truncate flex-1">
            {plan.title}
          </h4>
          <span className="text-xs text-gray-600 whitespace-nowrap">
            {plan.time}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
          {plan.description}
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
          {plan.title}
        </h4>
        <span className="text-xs text-gray-600 whitespace-nowrap">
          {plan.time}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(plan);
          }}
          className="text-[#5A3FFF] text-xs font-medium hover:underline whitespace-nowrap"
        >
          Click to edit
        </button>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{plan.description}</p>
    </div>
  );
}
