"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StudyPlanCard, { StudyPlan } from "./StudyPlanCard";

interface WeekViewCalendarProps {
  plans: StudyPlan[];
  onEditPlan?: (plan: StudyPlan) => void;
  onCreatePlan?: () => void;
}

type ViewMode = "Week view" | "Month view" | "Day view";

export default function WeekViewCalendar({
  plans,
  onEditPlan,
  onCreatePlan,
}: WeekViewCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("Week view");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get the start of the week (Sunday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Get the end of the week (Saturday)
  const getWeekEnd = (date: Date) => {
    const d = getWeekStart(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const weekEnd = useMemo(() => getWeekEnd(currentDate), [currentDate]);

  // Generate array of days in the current week
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [weekStart]);

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
    const startMonth = weekStart.toLocaleString("default", { month: "long" });
    const endMonth = weekEnd.toLocaleString("default", { month: "long" });
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();
    const year = weekStart.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  };

  const formatDayHeader = (date: Date) => {
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    return { month, day };
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Navigation arrows */}
          <button
            onClick={goToPreviousWeek}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={goToNextWeek}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>

          {/* Date range */}
          <span className="text-base font-medium text-gray-900">
            {formatDateRange()}
          </span>

          {/* View mode dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
          <span className="text-lg">+</span>
          Create Study Plan
        </button>
      </div>

      {/* Week view calendar */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Day columns */}
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((date, index) => {
              const { month, day } = formatDayHeader(date);
              const dateKey = date.toDateString();
              const dayPlans = plansByDate[dateKey] || [];
              const today = isToday(date);

              return (
                <div key={index} className="flex flex-col">
                  {/* Day header */}
                  <div
                    className={`text-center py-3 px-2 rounded-xl mb-3 ${
                      today
                        ? "bg-[#E8E0FF] text-[#5A3FFF]"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="text-sm font-medium">{month}</div>
                    <div className="text-xl font-bold">{day}</div>
                  </div>

                  {/* Plans for this day */}
                  <div className="flex flex-col gap-3 min-h-[200px]">
                    {dayPlans.map((plan) => (
                      <StudyPlanCard
                        key={plan.id}
                        plan={plan}
                        onEdit={onEditPlan}
                        compact
                      />
                    ))}

                    {dayPlans.length === 0 && (
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-xs text-gray-400">No plans</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
