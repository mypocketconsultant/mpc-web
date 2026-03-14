import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

export interface DayEntry {
  id: number;
  planId: string;
  title: string;
  time: string;
  description: string;
  type: 'mood' | 'goal';
  leftBorder: string;
}

export interface DayData {
  id: number;
  date: string;
  day: string;
  isToday?: boolean;
  entries: DayEntry[];
}

interface PlannerCalendarProps {
  events?: DayData[];
  isLoading?: boolean;
  onEntryClick?: (entryId: string, type?: "mood" | "goal") => void;
  activeTab?: "mood" | "goal";
  onTabChange?: (tab: "mood" | "goal") => void;
}

export default function PlannerCalendar({ events = [], isLoading, onEntryClick, activeTab = "goal", onTabChange }: PlannerCalendarProps) {

  return (
    <div className="bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-gray-100 p-3 sm:p-5 md:p-8">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-gray-200">
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Navigation Arrows */}
              <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>

              {/* Date Range */}
              <button className="py-2 sm:py-4 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-1">
                October 21-27, 2025
              </button>

              {/* Week View Dropdown */}
              <button className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 sm:gap-2">
                Week view
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mood Entries Button */}
              <div className="flex flow-row items-center">
                <button
                  onClick={() => onTabChange?.("mood")}
                  className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-l-lg transition-colors ${
                    activeTab === "mood"
                      ? "text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                      : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Mood Entries
                </button>

                <button
                  onClick={() => onTabChange?.("goal")}
                  className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-r-lg transition-colors ${
                    activeTab === "goal"
                      ? "text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                      : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Your Goals
                </button>
              </div>

              {/* New Goal Button */}
              <Link href="/Life/new-goal">
                <button className="px-2.5 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-xl leading-none">+</span>
                  New Goal
                </button>
              </Link>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-3 sm:space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-sm sm:text-base text-gray-500">{activeTab === "mood" ? "Loading mood entries..." : "Loading plans..."}</span>
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <p className="text-sm sm:text-base text-gray-500 mb-4">
                  {activeTab === "mood" ? "No mood entries found" : "No plans found"}
                </p>
                {activeTab === "goal" && (
                  <Link href="/Life/new-goal">
                    <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                      Create your first goal
                    </button>
                  </Link>
                )}
                {activeTab === "mood" && (
                  <Link href="/Life/mood-entry">
                    <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-pink-500 rounded-lg hover:bg-pink-600 transition-colors">
                      Record your first mood
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              events.map((day) => (
                <div key={day.id} className="flex gap-2 sm:gap-4 md:gap-6">
                  {/* Date Box */}
                  <div className="flex-shrink-0 w-14 sm:w-20">
                    <div
                      className={`text-center py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-2xl ${
                        day.isToday
                          ? "bg-gradient-to-br from-red-400 to-red-500 text-white shadow-md"
                          : "bg-red-50 text-gray-700"
                      }`}
                    >
                      <div
                        className={`text-[10px] sm:text-xs font-bold mb-0.5 sm:mb-1 ${
                          day.isToday ? "text-white/90" : "text-gray-600"
                        }`}
                      >
                        {day.date.split(" ")[0]}
                      </div>
                      <div
                        className={`text-lg sm:text-2xl font-bold ${
                          day.isToday ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {day.day}
                      </div>
                    </div>
                  </div>

                  {/* Events List */}
                  <div className="flex-1 min-w-0">
                    {day.entries.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                        {day.entries.map((entry) => (
                          <div
                            key={entry.id}
                            className={`bg-white border-gray-200 shadow-md flex flex-col rounded-lg sm:rounded-2xl p-2 sm:p-3 hover:shadow-lg transition-all cursor-pointer ${entry.leftBorder}`}
                          >
                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 mb-2 sm:mb-3">
                              <div className="flex flex-wrap gap-1 sm:gap-3 items-center">
                                <h3 className="font-semibold text-xs sm:text-sm text-gray-900 flex-1">
                                  {entry.title}
                                </h3>
                                <span className="text-xs sm:text-sm text-gray-500">
                                  {entry.time}
                                </span>
                                <button
                                  onClick={() => onEntryClick?.(entry.planId, entry.type)}
                                  className="text-xs sm:text-sm text-black hover:text-indigo-700 font-medium"
                                >
                                  {entry.type === "mood" ? "View entry" : "Click to edit"}
                                </button>
                              </div>
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                              {entry.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center">
                        <p className="text-xs sm:text-sm text-gray-400">No entries</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
