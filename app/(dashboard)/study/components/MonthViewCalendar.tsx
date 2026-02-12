"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { StudyPlan } from "./StudyPlanCard";

interface MonthViewCalendarProps {
  plans: StudyPlan[];
  onEditPlan?: (plan: StudyPlan) => void;
  onCreatePlan?: () => void;
}

type ViewMode = "Week view" | "Month view" | "Day view";

const dayNames = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];

export default function MonthViewCalendar({
  plans,
  onEditPlan,
  onCreatePlan,
}: MonthViewCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("Month view");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get the first day of the month
  const getMonthStart = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    return d;
  };

  // Get the last day of the month
  const getMonthEnd = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return d;
  };

  const monthStart = useMemo(() => getMonthStart(currentDate), [currentDate]);
  const monthEnd = useMemo(() => getMonthEnd(currentDate), [currentDate]);

  // Generate calendar grid (6 weeks x 7 days)
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];

    // Get the day of week for the first day (0 = Sunday, adjust for Monday start)
    let startDay = monthStart.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1; // Convert to Monday = 0

    // Add empty cells for days before the month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= monthEnd.getDate(); day++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }

    // Add empty cells to complete the last week
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [monthStart, monthEnd, currentDate]);

  // Group plans by date
  const plansByDate = useMemo(() => {
    const grouped: Record<string, StudyPlan[]> = {};
    plans.forEach((plan) => {
      const dateKey = new Date(plan.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(plan);
    });
    return grouped;
  }, [plans]);

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

  // Split calendar days into weeks
  const weeks = useMemo(() => {
    const result: (Date | null)[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Navigation arrows */}
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

          {/* Date range */}
          <span className="text-base font-medium text-gray-900">
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
                className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-90" : ""}`}
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

        {/* Create Study Plan button */}
        <button
          onClick={onCreatePlan}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#5A3FFF] to-[#300878] text-white rounded-xl font-medium text-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Study Plan
        </button>
      </div>

      {/* Calendar Grid */}
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
                  const dayPlans = plansByDate[dateKey] || [];
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
                          {/* Date label */}
                          <div
                            className={`text-xs font-medium mb-1 ${
                              today
                                ? "text-[#5A3FFF]"
                                : "text-gray-500"
                            }`}
                          >
                            {formatDayLabel(date)}
                          </div>

                          {/* Plans for this day */}
                          <div className="space-y-1">
                            {dayPlans.slice(0, 3).map((plan) => (
                              <div
                                key={plan.id}
                                onClick={() => onEditPlan?.(plan)}
                                className={`text-xs px-2 py-1 rounded cursor-pointer truncate hover:opacity-80 transition-opacity ${
                                  plan.color === "purple"
                                    ? "bg-[#E8E0FF] text-[#5A3FFF]"
                                    : plan.color === "light-purple"
                                    ? "bg-[#F3F0FF] text-[#7C5CFF]"
                                    : "bg-[#E0F0FF] text-[#3B82F6]"
                                }`}
                              >
                                {plan.title}
                              </div>
                            ))}
                            {dayPlans.length > 3 && (
                              <div className="text-xs text-gray-400 px-2">
                                +{dayPlans.length - 3} more
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
    </div>
  );
}
