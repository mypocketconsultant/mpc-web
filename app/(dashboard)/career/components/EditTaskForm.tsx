"use client";

import React from "react";
import { ChevronRight, X, Zap } from "lucide-react";

interface SuggestedAction {
  id: number;
  text: string;
  hasAiPrompt?: boolean;
}

interface EditTaskFormProps {
  taskTitle: string;
  onTitleChange: (value: string) => void;
  taskDescription: string;
  onDescriptionChange: (value: string) => void;
  taskTime: string;
  onTimeChange: (value: string) => void;
  taskDate: string;
  onDateChange: (value: string) => void;
  reminderEnabled: boolean;
  onReminderChange: (value: boolean) => void;
  suggestedActions?: SuggestedAction[];
  selectedActions?: string[];
  onActionToggle?: (actionId: number) => void;
  onSave: () => void;
  onClose?: () => void;
  isSaving?: boolean;
}

export default function EditTaskForm({
  taskTitle,
  onTitleChange,
  taskDescription,
  onDescriptionChange,
  taskTime,
  onTimeChange,
  taskDate,
  onDateChange,
  reminderEnabled,
  onReminderChange,
  suggestedActions = [],
  selectedActions = [],
  onActionToggle,
  onSave,
  onClose,
  isSaving = false,
}: EditTaskFormProps) {
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
        {/* Task Title */}
        <div className="mb-6">
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Add title"
            className="w-full text-xl font-medium text-gray-900 placeholder:text-gray-300 bg-transparent border-0 focus:outline-none pb-4 border-b border-gray-200"
          />
        </div>

        {/* Task Description */}
        <div className="mb-6">
          <textarea
            value={taskDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Add a description"
            className="w-full px-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:bg-white text-sm min-h-[120px] resize-none transition-all"
          />
        </div>

        {/* Suggested Actions */}
        {suggestedActions.length > 0 && (
          <div className="mb-6 space-y-3">
            {suggestedActions.map((action) => (
              <label
                key={action.id}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedActions.includes(action.id.toString())}
                  onChange={() => onActionToggle?.(action.id)}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-[#5A3FFF] focus:ring-2 focus:ring-[#5A3FFF] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 flex-1">
                  {action.text}
                </span>
                {action.hasAiPrompt && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    <Zap className="w-3 h-3" />
                    Run AI prompt
                  </span>
                )}
              </label>
            ))}
          </div>
        )}

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
                  {taskDate
                    ? new Date(taskDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })
                    : "Monday, 17. October"}
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={taskTime}
                    onChange={(e) => onTimeChange(e.target.value)}
                    className="text-sm font-bold text-gray-900 bg-transparent border-0 focus:outline-none"
                  />
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
