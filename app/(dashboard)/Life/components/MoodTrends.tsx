"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MoodTrendsProps {
  onPeriodChange?: (period: string) => void;
}

export default function MoodTrends({ onPeriodChange }: MoodTrendsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  // Sample data matching the screenshot pattern
  const moodData = [
    { day: "MON", mood1: 25, mood2: 30 },
    { day: "TUE", mood1: 50, mood2: 48 },
    { day: "WED", mood1: 45, mood2: 50 },
    { day: "THR", mood1: 70, mood2: 75 },
    { day: "FRI", mood1: 75, mood2: 70 },
    { day: "SAT", mood1: 35, mood2: 45 },
    { day: "SUN", mood1: 50, mood2: 45 },
  ];

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPeriod(value);
    onPeriodChange?.(value);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-base font-semibold text-gray-900">Mood Trends</h2>
        <select
          value={selectedPeriod}
          onChange={handlePeriodChange}
          className="px-3 py-1.5 bg-pink-50 border border-pink-200 text-pink-700 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-300 cursor-pointer"
        >
          <option value="7">7 Days</option>
          <option value="30">30 Days</option>
          <option value="90">90 Days</option>
        </select>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={moodData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorMood1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#93C5FD" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorMood2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F87171" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F87171" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#9CA3AF"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#E5E7EB"
              tick={{ fontSize: 11, fill: "#D1D5DB" }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "#6B7280", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="mood1"
              stroke="#3B82F6"
              strokeWidth={2.5}
              fill="url(#colorMood1)"
            />
            <Area
              type="monotone"
              dataKey="mood2"
              stroke="#EF4444"
              strokeWidth={2.5}
              fill="url(#colorMood2)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
