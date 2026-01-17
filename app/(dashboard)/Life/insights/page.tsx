"use client";

import React, { useState, useEffect, useCallback } from "react";
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

// Type definitions
interface Message {
  id: string;
  type: 'user' | 'assistant';
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
  avg_mood: { value: number; change: number; changeType: "positive" | "negative" };
  stability: { value: number; change: number; changeType: "positive" | "negative" };
  energy: { value: number; change: number; changeType: "positive" | "negative" };
}

interface ApiInsight {
  id: string;
  title: string;
  description: string;
  type: "positive" | "negative" | "neutral";
}

export default function InsightsPage() {
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
  const transformInsights = useCallback((insights: ApiInsight[]): InsightData[] => {
    // Map insight types to styling
    const styleMap: Record<string, { iconImage: StaticImageData; iconBg: string; cardBg: string; titleColor: string }> = {
      "upward-momentum": { iconImage: mood1Icon, iconBg: "bg-red-400", cardBg: "bg-[#FDEDED]", titleColor: "text-red-500" },
      "downward-trend": { iconImage: mood1Icon, iconBg: "bg-red-400", cardBg: "bg-[#FDEDED]", titleColor: "text-red-500" },
      "stable-mood": { iconImage: mood1Icon, iconBg: "bg-green-400", cardBg: "bg-[#FCFCFC]", titleColor: "text-green-600" },
      "weekend-peak": { iconImage: mood2Icon, iconBg: "bg-purple-500", cardBg: "bg-[#FCFCFC]", titleColor: "text-purple-700" },
      "weekday-warrior": { iconImage: mood2Icon, iconBg: "bg-purple-500", cardBg: "bg-[#FCFCFC]", titleColor: "text-purple-700" },
      "energy-correlation": { iconImage: mood3Icon, iconBg: "bg-yellow-400", cardBg: "bg-[#FCFCFC]", titleColor: "text-red-700" },
      "day-pattern": { iconImage: mode4Icon, iconBg: "bg-indigo-500", cardBg: "bg-[#FDEDED]", titleColor: "text-red-600" },
      "keep-tracking": { iconImage: mood1Icon, iconBg: "bg-blue-400", cardBg: "bg-[#FCFCFC]", titleColor: "text-blue-600" },
    };

    // Default styles for unknown insight types
    const defaultStyles = [
      { iconImage: mood1Icon, iconBg: "bg-red-400", cardBg: "bg-[#FDEDED]", titleColor: "text-red-500" },
      { iconImage: mood2Icon, iconBg: "bg-purple-500", cardBg: "bg-[#FCFCFC]", titleColor: "text-purple-700" },
      { iconImage: mood3Icon, iconBg: "bg-yellow-400", cardBg: "bg-[#FCFCFC]", titleColor: "text-red-700" },
      { iconImage: mode4Icon, iconBg: "bg-indigo-500", cardBg: "bg-[#FDEDED]", titleColor: "text-red-600" },
    ];

    return insights.map((insight, index) => {
      const styles = styleMap[insight.id] || defaultStyles[index % defaultStyles.length];
      return {
        id: insight.id,
        title: insight.title,
        description: insight.description,
        ...styles,
      };
    });
  }, []);

  // Fetch insights data
  const fetchInsights = useCallback(async (period: string) => {
    setIsLoading(true);
    try {
      const window = `${period}d`;
      console.log('[InsightsPage] Fetching insights with window:', window);

      const response: any = await apiService.get(`/v1/life/insights?window=${window}`);
      console.log('[InsightsPage] API Response:', response);

      // Extract data from response (could be response.data or response.data.data)
      let data = response?.data;
      if (data && !data.metrics && data.data) {
        data = data.data;
      }

      if (data) {
        // Transform and set metrics
        if (data.metrics) {
          const transformedMetrics = transformMetrics(data.metrics);
          setMoodMetrics(transformedMetrics);
          console.log('[InsightsPage] Transformed metrics:', transformedMetrics);
        }

        // Set trends directly (API format matches component format)
        if (data.trends) {
          setMoodTrends(data.trends);
          console.log('[InsightsPage] Trends:', data.trends);
        }

        // Transform and set insights
        if (data.insights) {
          const transformedInsights = transformInsights(data.insights);
          setAiInsights(transformedInsights);
          console.log('[InsightsPage] Transformed insights:', transformedInsights);
        }
      }
    } catch (error) {
      console.error('[InsightsPage] Error fetching insights:', error);
      // Keep existing data or show empty state
    } finally {
      setIsLoading(false);
    }
  }, [transformMetrics, transformInsights]);

  // Fetch on mount and when period changes
  useEffect(() => {
    fetchInsights(selectedPeriod);
  }, [selectedPeriod, fetchInsights]);

  // Generate session ID for chat
  useEffect(() => {
    const newSessionId = `life-insights-${Date.now()}`;
    setSessionId(newSessionId);
    console.log('[InsightsPage] Session ID generated:', newSessionId);
  }, []);

  // Handle chat message send
  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
    };
    setMessages(prev => [...prev, userMessage]);

    setIsChatLoading(true);

    try {
      const payload = {
        message: message.trim(),
        session_id: sessionId,
      };

      console.log('[InsightsPage] Sending to /v1/life/chat:', payload);

      const response: any = await apiService.post('/v1/life/chat', payload);

      console.log('[InsightsPage] Response from /v1/life/chat:', response);

      const aiMessage = response?.data?.message || response?.data?.data?.message || 'I received your message but could not generate a response.';

      // Add AI response to chat
      const aiResponse: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: aiMessage,
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('[InsightsPage] Error calling chat API:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to get AI response';
      const errorResponse: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Error: ${errorMessage}`,
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    console.log('[InsightsPage] Period changed to:', period);
    setSelectedPeriod(period);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Insights and reports" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto max-w-full">
        <div className="max-w-[1300px] mx-auto px-6 py-6">
          {/* Breadcrumb */}
          <Link href="/Life">
            <button className="flex items-center my-6 gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
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
                onAttach={() => console.log("Attach clicked")}
                onMicrophone={() => console.log("Microphone clicked")}
                placeholder="Ask about your mood insights..."
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
                  console.log("Document clicked:", docId);
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
    </div>
  );
}