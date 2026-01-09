"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import Header from "@/app/components/header";
import AIEditSidebar from "../components/AIEditSidebar";
import TimelineWidget, { PlanItem } from "../components/TimelineWidget";
import { apiService } from "@/lib/api/apiService";

interface PlanFromDB {
  id: string;
  name: string;
  goal: string;
  created_at: string;
  horizon: string;
  status: string;
  plan_schedule?: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'loading';
  content: string;
  fullContent?: string;
  isError?: boolean;
  isExpanded?: boolean;
}

export default function CreatePlanPage() {
  const pathname = usePathname();
  const [viewType, setViewType] = useState<"week" | "month">("week");
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  // AI Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  const getWeekDateRange = (startDate: Date): string => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const startMonth = startDate.toLocaleDateString("en-US", { month: "long" });
    const endMonth = endDate.toLocaleDateString("en-US", { month: "long" });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const year = endDate.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  };

  const transformPlansToTimelineItems = (
    plans: PlanFromDB[],
    weekStart: Date
  ): PlanItem[] => {
    const items: PlanItem[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);

      const dateStr = currentDate.toISOString().split("T")[0];
      const monthShort = currentDate.toLocaleDateString("en-US", {
        month: "short",
      });
      const dayNum = currentDate.getDate();

      const dayPlans = plans
        .filter((plan) => plan.created_at && plan.created_at.startsWith(dateStr))
        .map((plan) => ({
          id: plan.id,
          title: plan.name,
          time: "All day",
          description: plan.goal || "",
        }));

      items.push({
        date: monthShort,
        day: dayNum,
        hasEvents: dayPlans.length > 0,
        tasks: dayPlans,
      });
    }

    return items;
  };

  const fetchPlans = async () => {
    try {
      const response = await apiService.get<{ data: { items: PlanFromDB[] } }>(
        "/v1/career/plans"
      );
      const plans = response?.data?.items || [];
      console.log(plans, 'plans')
      const transformed = transformPlansToTimelineItems(plans, currentWeekStart);
      setPlanItems(transformed);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      const emptyWeek = transformPlansToTimelineItems([], currentWeekStart);
      setPlanItems(emptyWeek);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [currentWeekStart]);

  const handlePreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const getTitleFromPath = (path: string) => {
    if (path.includes("/create-plan")) return "Career Planner";
    if (path.includes("/career")) return "Career Advisory";
    return "My Pocket Consultant";
  };

  const handleSend = async (message: string, intent?: string) => {
    if (!message.trim()) return;

    // [Console 1] Log receipt of message with intent
    console.log('[CreatePlan] Received message with intent', { message: message.substring(0, 50), intent });

    // Add user message to UI
    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
    };

    // Add loading bubble
    const loadingBubbleId = (Date.now() + 1).toString();
    const loadingBubble: Message = {
      id: loadingBubbleId,
      type: 'loading',
      content: '',
    };

    setMessages((prev) => [...prev, newUserMessage, loadingBubble]);
    setInputValue('');

    try {
      const payload = {
        message,
        intent: intent,
        session_id: 'career-planner-1'
      };

      // [Console 2] Log payload before API call
      console.log('[CreatePlan] Sending to API', { payload });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/career/goal`,
        payload,
        { withCredentials: true }
      );

      // [Console 3] Log response intent
      console.log('[CreatePlan] Response received with intent', { intent: response.data?.intent });

      // Replace loading bubble with AI response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingBubbleId
            ? {
                id: msg.id,
                type: 'assistant',
                content: response.data?.message || 'No response',
              }
            : msg
        )
      );

      // Refresh plans if a plan was created
      if (response.data?.intent === 'planner_create') {
        fetchPlans();
      }
    } catch (error) {
      console.error('[CreatePlan] Error sending message:', error);

      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to send message. Please try again.';

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingBubbleId
            ? {
                id: msg.id,
                type: 'assistant',
                content: errorMessage,
                isError: true,
              }
            : msg
        )
      );
    }
  };

  const toggleMessageExpanded = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const fullContent = msg.fullContent || msg.content;
          return {
            ...msg,
            isExpanded: !msg.isExpanded,
            content: msg.isExpanded ? fullContent.substring(0, 200) + '...' : fullContent,
          };
        }
        return msg;
      })
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <Header title={getTitleFromPath(pathname)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto scrollbar-hide relative">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          {/* Breadcrumb */}
          <Link
            href="/career"
            className="flex items-center gap-2 text-gray-700 hover:text-[#5A3FFF] transition-colors mb-8 font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Career Advisory / Career Planner
          </Link>

          <hr className="my-10" />

          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - AI Chat */}
            <div className="col-span-5 sticky top-10 h-fit">
              <AIEditSidebar
                title="Plan with AI"
                messages={messages}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSend={handleSend}
                onToggleExpanded={toggleMessageExpanded}
                placeholder="Describe your career goal..."
                intent="planner_create"
              />
            </div>

            {/* Right Side - Timeline Widget */}
            <div className="col-span-7">
              <TimelineWidget
                items={planItems}
                currentWeek={getWeekDateRange(currentWeekStart)}
                viewType={viewType}
                onViewChange={setViewType}
                onPreviousWeek={handlePreviousWeek}
                onNextWeek={handleNextWeek}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
