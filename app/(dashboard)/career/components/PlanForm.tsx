"use client";

import React from "react";
import { X } from "lucide-react";

interface PlanFormProps {
  planName: string;
  onNameChange: (value: string) => void;
  planGoal: string;
  onGoalChange: (value: string) => void;
  createdDate: string;
  onDateChange: (value: string) => void;
  onSave: () => void;
  onClose?: () => void;
  isSaving?: boolean;
  planSchedule: string
}

export default function PlanForm({
  planName,
  onNameChange,
  planGoal,
  onGoalChange,
  createdDate,
  planSchedule,
  onDateChange,
  onSave,
  onClose,
  isSaving = false,
}: PlanFormProps) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with Save Button and Close */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-5 py-2 bg-[#5A3FFF] text-white rounded-full text-sm font-semibold hover:bg-[#4A2FEF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-hide">
        {/* Plan Name */}
        <div className="mb-6">
          <input
            type="text"
            value={planName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Add plan name"
            className="w-full text-xl font-medium text-gray-900 placeholder:text-gray-300 bg-transparent border-0 focus:outline-none pb-4 border-b border-gray-200"
          />
        </div>

        {/* Plan Goal */}
        <div className="mb-6">
          <textarea
            value={planGoal}
            onChange={(e) => onGoalChange(e.target.value)}
            placeholder="Add plan goal"
            className="w-full px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:bg-white text-sm min-h-[120px] resize-none transition-all"
          />
        </div>

        {/* Created Date */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Created On
          </label>
          <input
            type="date"
            value={createdDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-sm font-medium text-gray-900"
          />
        </div>

        {/* <div className="mb-6">
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Scheduled for
          </label>
          <input
            type="date"
            value={planSchedule}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-sm font-medium text-gray-900"
          />
        </div> */}
      </div>
    </div>
  );
}