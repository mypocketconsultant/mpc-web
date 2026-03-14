"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Header from "@/app/components/header";
import Image, { StaticImageData } from "next/image";
import tipsIcon from "@/public/tip.png";
import mood1Icon from "@/public/Mood1.png";
import mood2Icon from "@/public/Mood2.png";
import mood3Icon from "@/public/Mood3.png";
import mode4Icon from "@/public/mode4.png";
import FoodAI from "../components/FoodAI";
import InsightsMainContent from "../components/InsightsMainContent";
import AIPoweredInsights from "../components/AIPoweredInsights";
import { apiService } from "@/lib/api/apiService";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";

// Type definitions
interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
}

interface MoodMetric {
  id: string;
  title: string;
  value: string;
  unit: string;
  change: string;
  changeType: "positive" | "negative";
  iconImage: StaticImageData;
  color: string;
}

interface TrendData {
  day: string;
  mood1: number;
  mood2: number;
}

interface InsightData {
  id: string;
  iconImage: StaticImageData;
  iconBg: string;
  cardBg: string;
  title: string;
  titleColor: string;
  description: string;
}

// API response types
interface ApiMetrics {
  avg_mood: {
    value: number;
    change: number;
    changeType: "positive" | "negative";
  };
  stability: {
    value: number;
    change: number;
    changeType: "positive" | "negative";
  };
  energy: {
    value: number;
    change: number;
    changeType: "positive" | "negative";
  };
}

interface ApiInsight {
  id: string;
  title: string;
  description: string;
  type: "positive" | "negative" | "neutral";
}

interface JournalEntry {
  id: string;
  entry_type: string;
  mood: string | null;
  energy_level: string | null;
  text: string;
  created_at: string;
}

export default function InsightsPage() {
  const router = useRouter();
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const [isLoading, setIsLoading] = useState(true);

  // State for API data
  const [moodMetrics, setMoodMetrics] = useState<MoodMetric[]>([]);
  const [moodTrends, setMoodTrends] = useState<TrendData[]>([]);
  const [aiInsights, setAiInsights] = useState<InsightData[]>([]);

  // State for chat functionality
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  // Transform API metrics to component format
  const transformMetrics = useCallback((metrics: ApiMetrics): MoodMetric[] => {
    return [
      {
        id: "avg-mood",
        title: "Your Avg. Mood",
        value: metrics.avg_mood.value.toString(),
        unit: "out of 10",
        change: `${Math.abs(metrics.avg_mood.change)} from last week`,
        changeType: metrics.avg_mood.changeType,
        iconImage: mood1Icon,
        color: "from-[#FDEDED] to-[#FDEDED]",
      },
      {
        id: "mood-stability",
        title: "Mood Stability",
        value: `${metrics.stability.value}%`,
        unit: "stability score",
        change: `${Math.abs(metrics.stability.change)}% ${metrics.stability.changeType === "positive" ? "improvement" : "decrease"}`,
        changeType: metrics.stability.changeType,
        iconImage: mood2Icon,
        color: "from-[#FCFCFC] to-[#FCFCFC]",
      },
      {
        id: "energy-level",
        title: "Energy Level",
        value: metrics.energy.value.toString(),
        unit: "out of 10",
        change: `${Math.abs(metrics.energy.change)} from last week`,
        changeType: metrics.energy.changeType,
        iconImage: mood3Icon,
        color: "from-[#FDEDED] to-[#FDEDED]",
      },
    ];
  }, []);

  // Transform API insights to component format
  const transformInsights = useCallback(
    (insights: ApiInsight[]): InsightData[] => {
      // Map insight types to styling
      const styleMap: Record<
        string,
        {
          iconImage: StaticImageData;
          iconBg: string;
          cardBg: string;
          titleColor: string;
        }
      > = {
        "upward-momentum": {
          iconImage: mood1Icon,
          iconBg: "bg-red-400",
          cardBg: "bg-[#FDEDED]",
          titleColor: "text-red-500",
        },
        "downward-trend": {
          iconImage: mood1Icon,
          iconBg: "bg-red-400",
          cardBg: "bg-[#FDEDED]",
          titleColor: "text-red-500",
        },
        "stable-mood": {
          iconImage: mood1Icon,
          iconBg: "bg-green-400",
          cardBg: "bg-[#FCFCFC]",
          titleColor: "text-green-600",
        },
        "weekend-peak": {
          iconImage: mood2Icon,
          iconBg: "bg-purple-500",
          cardBg: "bg-[#FCFCFC]",
          titleColor: "text-purple-700",
        },
        "weekday-warrior": {
          iconImage: mood2Icon,
          iconBg: "bg-purple-500",
          cardBg: "bg-[#FCFCFC]",
          titleColor: "text-purple-700",
        },
        "energy-correlation": {
          iconImage: mood3Icon,
          iconBg: "bg-yellow-400",
          cardBg: "bg-[#FCFCFC]",
          titleColor: "text-red-700",
        },
        "day-pattern": {
          iconImage: mode4Icon,
          iconBg: "bg-indigo-500",
          cardBg: "bg-[#FDEDED]",
          titleColor: "text-red-600",
        },
        "keep-tracking": {
          iconImage: mood1Icon,
          iconBg: "bg-blue-400",
          cardBg: "bg-[#FCFCFC]",
          titleColor: "text-blue-600",
        },
      };

      // Default styles for unknown insight types
      const defaultStyles = [
        {
          iconImage: mood1Icon,
          iconBg: "bg-red-400",
          cardBg: "bg-[#FDEDED]",
          titleColor: "text-red-500",
        },
        {
          iconImage: mood2Icon,
          iconBg: "bg-purple-500",
          cardBg: "bg-[#FCFCFC]",
          titleColor: "text-purple-700",
        },
        {
          iconImage: mood3Icon,
          iconBg: "bg-yellow-400",
          cardBg: "bg-[#FCFCFC]",
          titleColor: "text-red-700",
        },
        {
          iconImage: mode4Icon,
          iconBg: "bg-indigo-500",
          cardBg: "bg-[#FDEDED]",
          titleColor: "text-red-600",
        },
      ];

      return insights.map((insight, index) => {
        const styles =
          styleMap[insight.id] || defaultStyles[index % defaultStyles.length];
        return {
          id: insight.id,
          title: insight.title,
          description: insight.description,
          ...styles,
        };
      });
    },
    [],
  );

  // Fallback: compute trends from journal entries if API returns no data
  const computeJournalTrends = useCallback(async (period: string) => {
    try {
      const response: any = await apiService.get("/v1/life/journals?limit=100");
      const items: JournalEntry[] = response?.data?.items || response?.items || [];
      const moodEntries = items.filter(
        (item: JournalEntry) => item.entry_type === "mood"
      );

      if (moodEntries.length === 0) return null;

      const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const dayData: Record<string, { moodSum: number; energySum: number; count: number }> = {};
      dayNames.forEach((d) => {
        dayData[d] = { moodSum: 0, energySum: 0, count: 0 };
      });

      const periodDays = parseInt(period);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - periodDays);

      moodEntries.forEach((entry: JournalEntry) => {
        const entryDate = new Date(entry.created_at);
        if (entryDate < cutoff) return;

        const dayName = dayNames[entryDate.getDay()];
        const moodVal = entry.mood ? parseInt(entry.mood.split("/")[0]) : 0;
        const energyVal = entry.energy_level ? parseInt(entry.energy_level.split("/")[0]) : 0;

        dayData[dayName].moodSum += moodVal;
        dayData[dayName].energySum += energyVal;
        dayData[dayName].count += 1;
      });

      const trends: TrendData[] = [
        "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN",
      ].map((day) => ({
        day,
        mood1: dayData[day].count > 0
          ? Math.round((dayData[day].moodSum / dayData[day].count) * 10)
          : 0,
        mood2: dayData[day].count > 0
          ? Math.round((dayData[day].energySum / dayData[day].count) * 10)
          : 0,
      }));

      return { trends, moodEntries };
    } catch (error) {
      console.error("[Insights] Failed to fetch journal trends:", error);
      return null;
    }
  }, []);

  // Fetch insights data
  const fetchInsights = useCallback(
    async (period: string) => {
      setIsLoading(true);
      try {
        const window = `${period}d`;

        const response: any = await apiService.get(
          `/v1/life/insights?window=${window}`,
        );

        console.log("[Insights] Raw API response:", response);

        // Extract data from response (could be response.data or response.data.data)
        let data = response?.data;
        if (data && !data.metrics && data.data) {
          data = data.data;
        }

        console.log("[Insights] Extracted data:", data);

        let hasMetrics = false;
        let hasTrends = false;

        if (data) {
          // Transform and set metrics
          if (data.metrics) {
            const transformedMetrics = transformMetrics(data.metrics);
            setMoodMetrics(transformedMetrics);
            hasMetrics = true;
          }

          // Set trends — auto-scale if values appear to be on 1-10 scale
          if (data.trends && Array.isArray(data.trends) && data.trends.length > 0) {
            const maxVal = Math.max(
              ...data.trends.map((t: any) => Math.max(t.mood1 || 0, t.mood2 || 0))
            );
            if (maxVal > 0 && maxVal <= 10) {
              const scaled = data.trends.map((t: any) => ({
                day: t.day,
                mood1: (t.mood1 || 0) * 10,
                mood2: (t.mood2 || 0) * 10,
              }));
              setMoodTrends(scaled);
            } else {
              setMoodTrends(data.trends);
            }
            hasTrends = true;
          }

          // Transform and set insights
          if (data.insights) {
            const transformedInsights = transformInsights(data.insights);
            setAiInsights(transformedInsights);
          }
        }

        // Fallback: if API returned no metrics or trends, compute from journals
        if (!hasMetrics || !hasTrends) {
          console.log("[Insights] Using journal fallback for", !hasMetrics ? "metrics" : "", !hasTrends ? "trends" : "");
          const journalResult = await computeJournalTrends(period);
          if (journalResult) {
            if (!hasTrends && journalResult.trends) {
              setMoodTrends(journalResult.trends);
            }
            if (!hasMetrics && journalResult.moodEntries.length > 0) {
              const moods = journalResult.moodEntries.map((e) =>
                parseInt(e.mood?.split("/")[0] || "0")
              );
              const energies = journalResult.moodEntries.map((e) =>
                parseInt(e.energy_level?.split("/")[0] || "0")
              );
              const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;
              const avgEnergy = energies.reduce((a, b) => a + b, 0) / energies.length;
              const moodMean = avgMood;
              const variance = moods.reduce((sum, m) => sum + Math.pow(m - moodMean, 2), 0) / moods.length;
              const stability = Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(variance) * 10)));

              const fallbackMetrics: ApiMetrics = {
                avg_mood: { value: Math.round(avgMood * 10) / 10, change: 0, changeType: "positive" },
                stability: { value: stability, change: 0, changeType: "positive" },
                energy: { value: Math.round(avgEnergy * 10) / 10, change: 0, changeType: "positive" },
              };
              setMoodMetrics(transformMetrics(fallbackMetrics));
            }
          }
        }
      } catch (error) {
        console.error("[Insights] Failed to load insights:", error);

        // Even if the insights API fails, try to get data from journals
        try {
          const journalResult = await computeJournalTrends(period);
          if (journalResult) {
            if (journalResult.trends) {
              setMoodTrends(journalResult.trends);
            }
            if (journalResult.moodEntries.length > 0) {
              const moods = journalResult.moodEntries.map((e) =>
                parseInt(e.mood?.split("/")[0] || "0")
              );
              const energies = journalResult.moodEntries.map((e) =>
                parseInt(e.energy_level?.split("/")[0] || "0")
              );
              const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;
              const avgEnergy = energies.reduce((a, b) => a + b, 0) / energies.length;
              const moodMean = avgMood;
              const variance = moods.reduce((sum, m) => sum + Math.pow(m - moodMean, 2), 0) / moods.length;
              const stability = Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(variance) * 10)));
              const fallbackMetrics: ApiMetrics = {
                avg_mood: { value: Math.round(avgMood * 10) / 10, change: 0, changeType: "positive" },
                stability: { value: stability, change: 0, changeType: "positive" },
                energy: { value: Math.round(avgEnergy * 10) / 10, change: 0, changeType: "positive" },
              };
              setMoodMetrics(transformMetrics(fallbackMetrics));
            }
          }
        } catch (journalError) {
          console.error("[Insights] Journal fallback also failed:", journalError);
        }

        showToast("error", "Failed to load insights");
      } finally {
        setIsLoading(false);
      }
    },
    [transformMetrics, transformInsights, showToast, computeJournalTrends],
  );

  // Fetch on mount and when period changes
  useEffect(() => {
    fetchInsights(selectedPeriod);
  }, [selectedPeriod, fetchInsights]);

  // Generate session ID for chat
  useEffect(() => {
    const newSessionId = `life-insights-${Date.now()}`;
    setSessionId(newSessionId);
  }, []);

  // Handle chat message send
  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsChatLoading(true);

    try {
      const payload = {
        message: message.trim(),
        session_id: sessionId,
      };

      const response: any = await apiService.post("/v1/life/chat", payload);

      const aiMessage =
        response?.data?.message ||
        response?.data?.data?.message ||
        "I received your message but could not generate a response.";

      // Add AI response to chat
      const aiResponse: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: aiMessage,
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Check if a life plan was created
      const toolResults = response?.data?.metadata?.tool_results || response?.data?.data?.metadata?.tool_results;
      if (toolResults) {
        // Look for create_life_plan action
        const planCreationKey = Object.keys(toolResults).find(key => key.includes('create_life_plan'));
        if (planCreationKey) {
          const planId = toolResults[planCreationKey]?.plan_id;
          if (planId) {
            // Store plan ID in sessionStorage and show toast with navigation
            sessionStorage.setItem("currentGoalPlanId", planId);
            showToast(
              "success",
              "A Life Plan was created!",
              {
                label: "View Details",
                onClick: () => {
                  router.push("/Life/new-goal");
                }
              }
            );
          }
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get AI response";
      showToast("error", errorMessage);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Insights and reports" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto max-w-full">
        <div className="max-w-[1300px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
          {/* Breadcrumb */}
          <Link href="/Life">
            <button className="flex items-center my-4 sm:my-6 gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] mb-4 sm:mb-6 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Life Advisory / Insights and reports</span>
            </button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - FoodAI Component */}
            <div className="lg:col-span-1 lg:sticky lg:top-6 lg:self-start">
              <FoodAI
                title="Chat with AI"
                messages={messages}
                isLoading={isChatLoading}
                onSend={handleSend}
                onModify={handleSend}
                onAttach={() => {}}
                onMicrophone={() => {}}
                placeholder="Ask about your mood insights..."
                emptyStateMessage="Ask me about your mood trends and insights..."
              />
            </div>

            {/* Right Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <InsightsMainContent
                moodMetrics={moodMetrics}
                moodTrends={moodTrends}
                selectedPeriod={selectedPeriod}
                tipsIcon={tipsIcon}
                onDocumentClick={(docId) => {
                  setSelectedDocument(docId.toString());
                }}
                onPeriodChange={handlePeriodChange}
              />

              {/* AI-Powered Insights */}
              <AIPoweredInsights insights={aiInsights} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </main>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
