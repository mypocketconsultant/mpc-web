"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Header from "@/app/components/header";
import AIEditSidebar from "../components/AIEditSidebar";
import PlanForm from "../components/PlanForm";
import TasksList from "../components/TasksList";
import { apiService } from "@/lib/api/apiService";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'loading';
  content: string;
  fullContent?: string;
  isError?: boolean;
  isExpanded?: boolean;
  file?: {
    name: string;
    size: string;
  };
}

interface Plan {
  id: string;
  name: string;
  goal: string;
  created_at: string;
  horizon: string;
  status: string;
  plan_schedule: string
}

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  status: string;
}

function EditTaskContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const taskId = searchParams.get("id");
  const { toast, showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planGoal, setPlanGoal] = useState("");
  const [planschedule, setPlanschedule] = useState("")
  const [createdDate, setCreatedDate] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const getTitleFromPath = (path: string) => {
    if (path.includes("/edit-task")) return planId ? "Edit Plan" : "Edit Task";
    if (path.includes("/career")) return "Career Advisory";
    return "My Pocket Consultant";
  };

  const fetchPlan = async () => {
    if (!planId) return;

    try {
      setIsLoading(true);
      const response = await apiService.get<{
        data: {
          plan: Plan;
          tasks: Task[];
        };
      }>(`/v1/career/plans/${planId}/details`);

      const plan = response?.data?.plan;
      console.log(plan, "check plan")
      if (plan) {
        setPlanName(plan.name || "");
        setPlanGoal(plan.goal || "");
        setPlanschedule(plan.plan_schedule || "")
        setCreatedDate(plan.created_at?.split("T")[0] || "");
      }

      const planTasks = response?.data?.tasks || [];
      setTasks(planTasks);
    } catch (error) {
      console.error("Failed to fetch plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (planId) {
      fetchPlan();
    }
  }, [planId]);

  const handleTaskStatusChange = async (taskIdToUpdate: string, newStatus: string) => {
    try {
      await apiService.patch(`/v1/career/tasks/${taskIdToUpdate}`, {
        status: newStatus,
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskIdToUpdate ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleSavePlan = async () => {
    if (!planId) return;

    try {
      setIsSaving(true);
      await apiService.patch(`/v1/career/plans/${planId}`, {
        name: planName,
        goal: planGoal,
        created_at: createdDate,
      });
      setIsSaving(false);
      showToast('success', 'Plan saved successfully!');
    } catch (error) {
      console.error("Failed to save plan:", error);
      setIsSaving(false);
      showToast('error', 'Failed to save plan. Please try again.');
    }
  };

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
    };

    const loadingBubbleId = (Date.now() + 1).toString();
    const loadingBubble: Message = {
      id: loadingBubbleId,
      type: 'loading',
      content: '',
    };

    setMessages((prev) => [...prev, newUserMessage, loadingBubble]);
    setInputValue('');

    try {
      const response = await apiService.post<{ data: { message: string } }>(
        '/v1/career/goal',
        {
          message,
          session_id: `edit-plan-${planId}`,
        }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingBubbleId
            ? {
                id: msg.id,
                type: 'assistant' as const,
                content: response?.data?.message || 'No response',
              }
            : msg
        )
      );
    } catch (error) {
      console.error('[EditTask] Error sending message:', error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingBubbleId
            ? {
                id: msg.id,
                type: 'assistant' as const,
                content: 'Failed to send message. Please try again.',
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
    <div className="flex flex-col h-full ">
      {/* Header */}
      <Header title={getTitleFromPath(pathname)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto scrollbar-hide">
        <div className="max-w-[1100px] mx-auto px-8 py-8">
          {/* Breadcrumb */}
          <Link
            href="/career/create-plan"
            className="flex items-center gap-2 text-gray-700 hover:text-[#5A3FFF] transition-colors mb-8 font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Career Advisory / Career Planner
          </Link>
<hr  className="my-10" />
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar - AI Editor */}
            <div className="col-span-5 sticky top-8 h-fit">
              <AIEditSidebar
                title="Edit with AI"
                messages={messages}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSend={handleSend}
                onToggleExpanded={toggleMessageExpanded}
                placeholder="Ask me to help refine this plan..."
                emptyStateMessage="Ask me to help edit and refine your career plan..."
              />
            </div>

            {/* Right Content - Form */}
            <div className="col-span-7">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading plan...</div>
                </div>
              ) : planId ? (
                <>
                  <PlanForm
                    planName={planName}
                    onNameChange={setPlanName}
                    planGoal={planGoal}
                    planSchedule={planschedule}
                    onGoalChange={setPlanGoal}
                    createdDate={createdDate}
                    onDateChange={setCreatedDate}
                    onSave={handleSavePlan}
                    onClose={() => window.location.href = "/career/create-plan"}
                    isSaving={isSaving}
                  />
                  <TasksList tasks={tasks} onTaskStatusChange={handleTaskStatusChange} />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      <Toast toast={toast} />
    </div>
  );
}

export default function EditTaskPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditTaskContent />
    </Suspense>
  );
}
