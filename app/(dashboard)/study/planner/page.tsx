"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Header from "@/app/components/header";
import StudyChatSidebar from "../components/StudyChatSidebar";
import MonthViewCalendar from "../components/MonthViewCalendar";
import CreateStudyPlanModal, {
  NewStudyPlan,
} from "../components/CreateStudyPlanModal";
import { StudyTask } from "../components/StudyPlanCard";
import { apiService } from "@/lib/api/apiService";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";

interface StudyPlan {
  id: string;
  title: string;
  class_id: string;
  start_date: string;
  end_date: string;
  status: string;
}

export default function StudyPlannerPage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [planTitles, setPlanTitles] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch planner tasks and plans from backend
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, plansRes] = await Promise.all([
        apiService.get("/v1/study/planner?range=month") as Promise<any>,
        apiService.get("/v1/study/plans") as Promise<any>,
      ]);

      const tasksData = tasksRes?.data || tasksRes || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);

      // Build plan_id → plan title lookup
      const plansData = plansRes?.data || plansRes || [];
      const titleMap: Record<string, string> = {};
      if (Array.isArray(plansData)) {
        plansData.forEach((plan: StudyPlan) => {
          if (plan.id && plan.title) {
            titleMap[plan.id] = plan.title;
          }
        });
      }
      setPlanTitles(titleMap);
    } catch (error) {
      console.error("Failed to fetch planner tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleEditTask = (task: StudyTask) => {
    if (task.plan_id) {
      router.push(`/study/planner/${task.plan_id}`);
    }
  };

  const handleCreatePlan = () => {
    setIsModalOpen(true);
  };

  const handleSubmitPlan = async (newPlan: NewStudyPlan) => {
    try {
      const res: any = await apiService.post("/v1/study/plans/ai", {
        class_id: newPlan.class_id,
        prompt: newPlan.prompt,
        title: newPlan.title || undefined,
        description: newPlan.description || undefined,
        start_date: newPlan.start_date,
        end_date: newPlan.end_date,
        sessions_per_week: newPlan.sessions_per_week,
        minutes_per_session: newPlan.minutes_per_session,
      });

      // Extract plan ID from response
      const data = res?.data || res;
      const createdPlanId = data?.plan?.id;

      showToast("success", "Study plan created!", {
        label: "See plan",
        onClick: () => {
          hideToast();
          if (createdPlanId) {
            router.push(`/study/planner/${createdPlanId}`);
          }
        },
      });

      // Refresh calendar to show new tasks
      await fetchTasks();
    } catch (error) {
      console.error("Failed to create study plan:", error);
      showToast("error", "Failed to create study plan. Please try again.");
    }
  };

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      const res: any = await apiService.post("/v1/study/chat", {
        message,
      });
      const data = res?.data || res;
      return data?.message || "I understand. How can I help you with your study planning?";
    } catch (error) {
      console.error("Study chat error:", error);
      return "Sorry, I encountered an error. Please try again.";
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Toast toast={toast} onClose={hideToast} />
      <Header title="Study Support" />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          {/* Back button */}
          <Link href="/study">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Study Support / Study Planner</span>
            </button>
          </Link>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Chat sidebar */}
            <div className="lg:col-span-1 h-[calc(100vh-220px)] min-h-[500px]">
              <StudyChatSidebar
                title="Create study plan with Ai"
                onSendMessage={handleSendMessage}
              />
            </div>

            {/* Right column - Month View Calendar */}
            <div className="lg:col-span-2">
              <MonthViewCalendar
                tasks={tasks}
                planTitles={planTitles}
                onEditTask={handleEditTask}
                onCreatePlan={handleCreatePlan}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Create Study Plan Modal */}
      <CreateStudyPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitPlan}
      />
    </div>
  );
}
