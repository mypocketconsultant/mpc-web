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
  onEntryClick?: (planId: string) => void;
}

export default function PlannerCalendar({ events = [], isLoading, onEntryClick }: PlannerCalendarProps) {

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-8">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {/* Navigation Arrows */}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              {/* Date Range */}
              <button className=" py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-1">
                October 21-27, 2025
              </button>

              {/* Week View Dropdown */}
              <button className="px-4 py-4 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                Week view
                <ChevronDown className="w-4 h-4" />
              </button>

              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Mood Entries Button */}
              <div className="flex flow-row  items-center">
                <button className="px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-50 transition-colors">
                  Mood Entries
                </button>

                {/* Your Goals Button - Active State */}
                <button className="px-4 py-3 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-r-lg hover:bg-indigo-200 transition-colors">
                  Your Goals
                </button>
              </div>

              {/* New Goal Button */}
              <Link href="/Life/new-goal">
                <button className="px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                  <span className="text-xl leading-none">+</span>
                  New Goal
                </button>
              </Link>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-500">Loading plans...</span>
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 mb-4">No plans found</p>
                <Link href="/Life/new-goal">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                    Create your first goal
                  </button>
                </Link>
              </div>
            ) : (
              events.map((day) => (
                <div key={day.id} className="flex gap-6">
                  {/* Date Box */}
                  <div className="flex-shrink-0 w-20">
                    <div
                      className={`text-center py-3 px-4 rounded-2xl ${
                        day.isToday
                          ? "bg-gradient-to-br from-red-400 to-red-500 text-white shadow-md"
                          : "bg-red-50 text-gray-700"
                      }`}
                    >
                      <div
                        className={`text-xs font-bold mb-1 ${
                          day.isToday ? "text-white/90" : "text-gray-600"
                        }`}
                      >
                        {day.date.split(" ")[0]}
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          day.isToday ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {day.day}
                      </div>
                    </div>
                  </div>

                  {/* Events List */}
                  <div className="flex-1">
                    {day.entries.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {day.entries.map((entry) => (
                          <div
                            key={entry.id}
                            className={`bg-white border-gray-200 shadow-md flex flex-col rounded-2xl p-2 hover:shadow-lg transition-all cursor-pointer ${entry.leftBorder}`}
                          >
                            <div className="flex-row flex gap-3  mb-3">
                              <div className="flex gap-3 items-center">
                                <h3 className="font-semibold text-sm text-gray-900 flex-1">
                                  {entry.title}
                                </h3>
                                <span className="text-sm text-gray-500 ml-3">
                                  {entry.time}
                                </span>
                                <button
                                  onClick={() => onEntryClick?.(entry.planId)}
                                  className="text-sm text-black hover:text-indigo-700 font-medium"
                                >
                                  Click to edit
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {entry.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center">
                        <p className="text-sm text-gray-400">No entries</p>
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
