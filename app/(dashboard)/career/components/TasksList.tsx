"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  status: string;
}

interface TasksListProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, newStatus: string) => void;
}

export default function TasksList({ tasks, onTaskStatusChange }: TasksListProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const handleCheckboxChange = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "todo" ? "done" : "todo";
    onTaskStatusChange(taskId, newStatus);
  };

  if (tasks.length === 0) {
    return (
      <div className="mb-6 p-4 text-center text-gray-400">
        <p>No tasks in this plan</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Tasks</h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Task Row */}
            <div className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={task.status === "done"}
                onChange={() => handleCheckboxChange(task.id, task.status)}
                className="w-5 h-5 rounded border-2 border-gray-300 text-[#5A3FFF] focus:ring-2 focus:ring-[#5A3FFF] focus:ring-offset-0 cursor-pointer flex-shrink-0"
              />

              {/* Task Title */}
              <div className="flex-1">
                <span
                  className={`text-sm font-medium ${
                    task.status === "done"
                      ? "line-through text-gray-400"
                      : "text-gray-900"
                  }`}
                >
                  {task.title}
                </span>
              </div>

              {/* Expand Arrow */}
              <button
                onClick={() => toggleExpand(task.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                aria-label="Expand task details"
              >
                <ChevronDown
                  className={`w-4 h-4 text-gray-600 transition-transform ${
                    expandedTaskId === task.id ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Expandable Details */}
            {expandedTaskId === task.id && (
              <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50 space-y-3">
                {/* Description */}
                {task.description && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Description
                    </label>
                    <p className="text-sm text-gray-700">{task.description}</p>
                  </div>
                )}

                {/* Due Date */}
                {task.due_date && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Due Date
                    </label>
                    <p className="text-sm text-gray-700">
                      {new Date(task.due_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Status
                  </label>
                  <p className="text-sm text-gray-700 capitalize">{task.status}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}