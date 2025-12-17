"use client";

import React, { useState } from "react";
import { Sparkles, X } from "lucide-react";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  aiPrompt?: string;
}

interface GoalFormProps {
  goalTitle: string;
  goalDescription: string;
  tasks: Task[];
  reminderEnabled: boolean;
  onGoalTitleChange: (title: string) => void;
  onGoalDescriptionChange: (description: string) => void;
  onToggleTask: (id: number) => void;
  onReminderToggle: (enabled: boolean) => void;
  onPublish: () => void;
  onClose: () => void;
}

export default function GoalForm({
  goalTitle,
  goalDescription,
  tasks,
  reminderEnabled,
  onGoalTitleChange,
  onGoalDescriptionChange,
  onToggleTask,
  onReminderToggle,
  onPublish,
  onClose,
}: GoalFormProps) {
  return (
    <div className="w-full  ">
      {/* Header */}
      <div className="flex items-center justify-between p-6  border-gray-100">
        <button 
          onClick={onPublish}
          className="px-5 py-2 bg-[#5A3FFF] text-white text-sm font-semibold rounded-full hover:bg-[#4A2FEF] transition-colors"
        >
          Publish
        </button>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Goal Title Input */}
        <input
          type="text"
          value={goalTitle}
          onChange={(e) => onGoalTitleChange(e.target.value)}
          placeholder="Add goal title"
          className="w-full text-2xl font-medium text-gray-900 placeholder:text-gray-300 border-none outline-none mb-6 focus:ring-0"
        />

        {/* Goal Description */}
        <textarea
          value={goalDescription}
          onChange={(e) => onGoalDescriptionChange(e.target.value)}
          placeholder="Add a description"
          className="w-full h-36 text-sm text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent mb-6"
        />

      {/* Tasks Checklist */}
            <div className="space-y-4 mb-6">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleTask(task.id)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1 flex items-start  gap-3">
                    <span className={`text-sm leading-relaxed ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                      {task.text}
                    </span>
                    {task.aiPrompt && (
                      <button className="flex-shrink-0 text-xs text-gray-700 hover:text-gray-900 font-medium flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{task.aiPrompt}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

        {/* Set Reminder */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Set reminder</span>
            <button
              onClick={() => onReminderToggle(!reminderEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                reminderEnabled ? 'bg-[#5A3FFF]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Date/Time Selector (shown when reminder is enabled) */}
          {reminderEnabled && (
            <div className="mt-4">
              <label className="block text-xs text-gray-500 mb-2">From</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
