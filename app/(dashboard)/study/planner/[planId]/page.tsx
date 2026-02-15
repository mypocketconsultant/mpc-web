"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Calendar,
  BookOpen,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  PlayCircle,
  SkipForward,
} from "lucide-react";
import Header from "@/app/components/header";
import { apiService } from "@/lib/api/apiService";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";

interface StudyPlan {
  id: string;
  user_id: string;
  class_id: string;
  title: string;
  description?: string;
  prompt: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface StudyClass {
  id: string;
  title: string;
  subject?: string;
  instructor?: string;
  color?: string;
}

interface StudyTask {
  id: string;
  user_id: string;
  class_id: string;
  plan_id: string;
  title: string;
  description?: string;
  due_at: string;
  ai_prompts?: string[];
  status: "todo" | "doing" | "done" | "skipped";
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  todo: {
    icon: Circle,
    color: "text-[#5A3FFF]",
    bg: "bg-[#E8E0FF]",
    label: "To Do",
  },
  doing: {
    icon: PlayCircle,
    color: "text-[#3B82F6]",
    bg: "bg-[#E0F0FF]",
    label: "In Progress",
  },
  done: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-[#E0FFE8]",
    label: "Done",
  },
  skipped: {
    icon: SkipForward,
    color: "text-gray-500",
    bg: "bg-gray-100",
    label: "Skipped",
  },
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast, showToast } = useToast();
  const planId = params.planId as string;

  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [studyClass, setStudyClass] = useState<StudyClass | null>(null);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!planId) return;

    try {
      setLoading(true);

      // Fetch plans list and tasks for this plan in parallel
      const [plansRes, tasksRes] = await Promise.all([
        apiService.get("/v1/study/plans") as Promise<any>,
        apiService.get(
          `/v1/study/planner?range=month&plan_id=${planId}`
        ) as Promise<any>,
      ]);

      // Find the specific plan
      const plansData = plansRes?.data || plansRes || [];
      const foundPlan = Array.isArray(plansData)
        ? plansData.find((p: StudyPlan) => p.id === planId)
        : null;

      if (foundPlan) {
        setPlan(foundPlan);

        // Fetch class details
        try {
          const classRes: any = await apiService.get(
            `/v1/study/classes/${foundPlan.class_id}`
          );
          const classData = classRes?.data || classRes;
          if (classData?.id) {
            setStudyClass(classData);
          }
        } catch {
          // Class fetch failed, continue without it
        }
      }

      // Set tasks sorted by due_at
      const tasksData = tasksRes?.data || tasksRes || [];
      const sortedTasks = Array.isArray(tasksData)
        ? tasksData.sort(
            (a: StudyTask, b: StudyTask) =>
              new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
          )
        : [];
      setTasks(sortedTasks);
    } catch (error) {
      console.error("Failed to fetch plan details:", error);
      showToast("error", "Failed to load plan details.");
    } finally {
      setLoading(false);
    }
  }, [planId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateTaskStatus = async (
    taskId: string,
    newStatus: StudyTask["status"]
  ) => {
    setUpdatingTaskId(taskId);
    try {
      await apiService.patch(`/v1/study/planner/tasks/${taskId}`, {
        status: newStatus,
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      showToast("success", `Task marked as ${statusConfig[newStatus].label}`);
    } catch (error) {
      console.error("Failed to update task:", error);
      showToast("error", "Failed to update task status.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Calculate progress
  const completedCount = tasks.filter((t) => t.status === "done").length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Toast toast={toast} />
      <Header title="Study Support" />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6">
          {/* Back button */}
          <Link href="/study/planner">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Planner</span>
            </button>
          </Link>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#5A3FFF] animate-spin" />
            </div>
          ) : !plan ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-gray-500 text-lg mb-4">Plan not found</p>
              <button
                onClick={() => router.push("/study/planner")}
                className="px-4 py-2 bg-[#5A3FFF] text-white rounded-xl text-sm font-medium hover:bg-[#4A2FEF] transition-colors"
              >
                Back to Planner
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Plan Header Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      {plan.title}
                    </h1>
                    {studyClass && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <BookOpen className="w-4 h-4" />
                        <span>
                          {studyClass.title}
                          {studyClass.subject
                            ? ` — ${studyClass.subject}`
                            : ""}
                        </span>
                        {studyClass.instructor && (
                          <span className="text-gray-400">
                            &middot; {studyClass.instructor}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      plan.status === "active"
                        ? "bg-green-100 text-green-700"
                        : plan.status === "completed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {plan.status}
                  </span>
                </div>

                {/* Date range & prompt */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#5A3FFF]" />
                    <span>
                      {formatDate(plan.start_date)} — {formatDate(plan.end_date)}
                    </span>
                  </div>
                </div>

                {plan.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {plan.description}
                  </p>
                )}

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    AI Prompt
                  </p>
                  <p className="text-sm text-gray-700">{plan.prompt}</p>
                </div>

                {/* Progress bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress
                    </span>
                    <span className="text-sm text-gray-500">
                      {completedCount}/{totalCount} tasks ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#5A3FFF] to-[#300878] rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Study Sessions ({tasks.length})
                </h2>

                {tasks.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No tasks found for this plan.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task, index) => {
                      const config = statusConfig[task.status] || statusConfig.todo;
                      const StatusIcon = config.icon;
                      const isUpdating = updatingTaskId === task.id;

                      return (
                        <div
                          key={task.id}
                          className={`${config.bg} rounded-xl p-4 transition-all`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Status icon / toggle */}
                            <button
                              onClick={() => {
                                const next =
                                  task.status === "todo"
                                    ? "doing"
                                    : task.status === "doing"
                                    ? "done"
                                    : task.status === "done"
                                    ? "todo"
                                    : "todo";
                                handleUpdateTaskStatus(task.id, next);
                              }}
                              disabled={isUpdating}
                              className={`mt-0.5 flex-shrink-0 ${config.color} hover:opacity-70 transition-opacity disabled:opacity-50`}
                              title={`Status: ${config.label}. Click to change.`}
                            >
                              {isUpdating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <StatusIcon className="w-5 h-5" />
                              )}
                            </button>

                            {/* Task content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h4
                                  className={`font-semibold text-sm text-gray-900 ${
                                    task.status === "done"
                                      ? "line-through opacity-60"
                                      : ""
                                  }`}
                                >
                                  Session {index + 1}: {task.title}
                                </h4>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color} ${config.bg} border border-current/10`}
                                >
                                  {config.label}
                                </span>
                              </div>

                              {/* Due date */}
                              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(task.due_at)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(task.due_at)}
                                </div>
                              </div>

                              {/* Description */}
                              {task.description && (
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              {/* AI Prompts */}
                              {task.ai_prompts &&
                                task.ai_prompts.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {task.ai_prompts.map((prompt, i) => (
                                      <span
                                        key={i}
                                        className="text-xs px-2 py-1 bg-white/60 rounded-lg text-gray-600 border border-gray-200/50"
                                      >
                                        {prompt}
                                      </span>
                                    ))}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
