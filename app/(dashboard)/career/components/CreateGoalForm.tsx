"use client";

import React from "react";
import { ChevronRight, X, Zap } from "lucide-react";
import Link from "next/link";

interface SuggestedPrompt {
  id: number;
  text: string;
  icon?: string;
  hasAiPrompt?: boolean;
}

interface CreateGoalFormProps {
  goalTitle: string;
  onTitleChange: (value: string) => void;
  goalDescription: string;
  onDescriptionChange: (value: string) => void;
  selectedDate: string;
  onDateChange: (value: string) => void;
  selectedTime: string;
  onTimeChange: (value: string) => void;
  reminderEnabled: boolean;
  onReminderChange: (value: boolean) => void;
  onCreateGoal: () => void;
  onClose?: () => void;
}

export default function CreateGoalForm({
  goalTitle,
  onTitleChange,
  goalDescription,
  onDescriptionChange,
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  reminderEnabled,
  onReminderChange,
  onCreateGoal,
  onClose,
}: CreateGoalFormProps) {
  return (
    <div className=" max-w-2xl mx-auto">
      {/* Header with Publish Button and Close */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <button
          onClick={onCreateGoal}
          className="px-5 py-2 bg-[#5A3FFF] text-white rounded-full text-sm font-semibold hover:bg-[#4A2FEF] transition-all"
        >
          Publish
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
        {/* Goal Title */}
        <div className="mb-6">
          <input
            type="text"
            value={goalTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Add title"
            className="w-full text-xl font-medium text-gray-900 placeholder:text-gray-300 bg-transparent border-0 focus:outline-none pb-4 border-b border-gray-200"
          />
        </div>

        {/* Goal Description */}
        <div className="mb-6">
          <textarea
            value={goalDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Add a description"
            className="w-full px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:bg-white text-sm min-h-[120px] resize-none transition-all"
          />
        </div>

        {/* Set Reminder Section */}
        <div className="mb-6 p-4 rounded-2xl border border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              Set reminder
            </span>
            <button
              onClick={() => onReminderChange(!reminderEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                reminderEnabled ? "bg-[#5A3FFF]" : "bg-gray-300"
              }`}
              aria-label="Toggle reminder"
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  reminderEnabled ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reminder Date/Time */}
        {reminderEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                From
              </label>
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors cursor-pointer">
                <span className="text-sm font-bold text-gray-900">
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })
                    : "Monday, 17. October"}
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => onTimeChange(e.target.value)}
                    className="text-sm font-bold text-gray-900 bg-transparent border-0 focus:outline-none"
                  />
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                To
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-sm font-medium text-gray-900"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}