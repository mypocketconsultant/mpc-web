"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { StudyTask } from "./StudyPlanCard";

interface MonthViewCalendarProps {
  tasks: StudyTask[];
  planTitles?: Record<string, string>;
  onEditTask?: (task: StudyTask) => void;
  onCreatePlan?: () => void;
  loading?: boolean;
}

type ViewMode = "Week view" | "Month view" | "Day view";

const dayNames = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];

const statusDotColor: Record<string, string> = {
  todo: "bg-[#7C5CFF]",
  doing: "bg-[#5C9CFF]",
  done: "bg-[#5CFF7C]",
  skipped: "bg-[#AAAAAA]",
};

export default function MonthViewCalendar({
  tasks,
  planTitles = {},
  onEditTask,
  onCreatePlan,
  loading = false,
}: MonthViewCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("Month view");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getMonthStart = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);

  const getMonthEnd = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const monthStart = useMemo(() => getMonthStart(currentDate), [currentDate]);
  const monthEnd = useMemo(() => getMonthEnd(currentDate), [currentDate]);

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    let startDay = monthStart.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= monthEnd.getDate(); day++) {
      days.push(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      );
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [monthStart, monthEnd, currentDate]);

  // Group tasks by date using due_at, deduplicating by plan_id per day
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, StudyTask[]> = {};
    tasks.forEach((task) => {
      const dateKey = new Date(task.due_at).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      // Only add one task per plan per day (use plan title as label)
      const alreadyHasPlan = grouped[dateKey].some(
        (t) => t.plan_id && t.plan_id === task.plan_id
      );
      if (!alreadyHasPlan) {
        grouped[dateKey].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const formatDateRange = () => {
    const month = monthStart.toLocaleString("default", { month: "long" });
    const startDay = monthStart.getDate();
    const endDay = monthEnd.getDate();
    const year = monthStart.getFullYear();
    return `${month} ${startDay}-${endDay}, ${year}`;
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDayLabel = (date: Date) => {
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const weeks = useMemo(() => {
    const result: (Date | null)[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>

          <span className="text-xs sm:text-base font-medium text-gray-900">
            {formatDateRange()}
          </span>

          {/* View mode dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              {viewMode}
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  isDropdownOpen ? "rotate-90" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                {(["Day view", "Week view", "Month view"] as ViewMode[]).map(
                  (mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setViewMode(mode);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                        viewMode === mode
                          ? "text-[#5A3FFF] font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {mode}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onCreatePlan}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#5A3FFF] to-[#300878] text-white rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Study Plan
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-[#5A3FFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Calendar Grid */}
      {!loading && (
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-t-xl overflow-hidden">
              {dayNames.map((day, index) => (
                <div
                  key={day}
                  className={`text-center py-3 px-2 font-medium text-sm ${
                    index === 0 || index === 1
                      ? "bg-[#5A3FFF] text-white"
                      : "bg-gray-50 text-gray-700"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Weeks */}
            <div className="border border-gray-100 border-t-0 rounded-b-xl overflow-hidden">
              {weeks.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  className="grid grid-cols-7 gap-px bg-gray-100"
                >
                  {week.map((date, dayIndex) => {
                    const dateKey = date?.toDateString() || "";
                    const dayTasks = tasksByDate[dateKey] || [];
                    const today = isToday(date);

                    return (
                      <div
                        key={dayIndex}
                        className={`bg-white min-h-[100px] p-2 ${
                          !date ? "bg-gray-50" : ""
                        }`}
                      >
                        {date && (
                          <>
                            <div
                              className={`text-xs font-medium mb-1 ${
                                today ? "text-[#5A3FFF]" : "text-gray-500"
                              }`}
                            >
                              {formatDayLabel(date)}
                            </div>

                            <div className="space-y-1">
                              {dayTasks.slice(0, 3).map((task) => (
                                <div
                                  key={task.id}
                                  onClick={() => onEditTask?.(task)}
                                  className={`text-xs px-2 py-1 rounded cursor-pointer truncate hover:opacity-80 transition-opacity flex items-center gap-1 ${
                                    task.status === "done"
                                      ? "bg-[#E0FFE8] text-green-700"
                                      : task.status === "doing"
                                      ? "bg-[#E0F0FF] text-[#3B82F6]"
                                      : task.status === "skipped"
                                      ? "bg-gray-100 text-gray-500"
                                      : "bg-[#E8E0FF] text-[#5A3FFF]"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                      statusDotColor[task.status] ||
                                      statusDotColor.todo
                                    }`}
                                  />
                                  <span className="truncate">{planTitles[task.plan_id] || task.title}</span>
                                </div>
                              ))}
                              {dayTasks.length > 3 && (
                                <div className="text-xs text-gray-400 px-2">
                                  +{dayTasks.length - 3} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
