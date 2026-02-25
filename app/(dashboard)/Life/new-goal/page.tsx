"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Header from "@/app/components/header";
import AIEditSidebar from "../components/FoodAI";
import GoalForm from "../components/GoalForm";
import { apiService } from "@/lib/api/apiService";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  file?: {
    name: string;
    size: string;
  };
}

interface Step {
  id: string;
  title: string;
  description: string;
  due_date: string;
}

export default function NewGoalPage() {
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [horizon, setHorizon] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast, showToast } = useToast();

  // Generate session ID on component mount
  useEffect(() => {
    const newSessionId = `life-goal-${Date.now()}`;
    setSessionId(newSessionId);
  }, []);

  // Fetch and populate form from sessionStorage plan_id
  const fetchPlanDetails = useCallback(async () => {
    const planId = sessionStorage.getItem("currentGoalPlanId");

    if (!planId) {
      return;
    }

    try {
      const response: any = await apiService.get(`/v1/life/plans/${planId}`);

      // Extract plan data - could be in response.data or response.data.data
      let planData = response?.data;

      // If planData is the wrapper, check if there's a nested data property
      if (planData && !planData.goal && planData.data) {
        planData = planData.data;
      }

      if (planData) {
        setGoalTitle(planData.goal || "");
        setHorizon(planData.horizon || "");
        setDomains(planData.domains || []);

        // Transform steps from API response to component format
        const transformedSteps: Step[] = (planData.steps || []).map(
          (step: any, index: number) => ({
            id: `step-${index}-${Date.now()}`,
            title: step.title || "",
            description: step.description || "",
            due_date: step.due_date || "",
          }),
        );
        setSteps(transformedSteps);
      }
    } catch (error) {
      // Clear sessionStorage if fetch fails to prevent repeated errors
      sessionStorage.removeItem("currentGoalPlanId");
    }
  }, []);

  // Fetch plan details on mount
  useEffect(() => {
    fetchPlanDetails();
  }, [fetchPlanDetails]);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Start loading
    setIsChatLoading(true);

    try {
      const payload = {
        message: message.trim(),
        session_id: sessionId,
      };

      const response: any = await apiService.post("/v1/life/chat", payload);

      // Extract the message from response
      const aiMessage =
        response?.data?.message ||
        "I received your message but could not generate a response.";
      const toolResults = response?.data?.metadata?.tool_results || {};

      // Check if AI created a plan and extract plan_id
      const planId = toolResults?.["0_create_life_plan"]?.plan_id;
      if (planId) {
        sessionStorage.setItem("currentGoalPlanId", planId);
        // Fetch and populate the form with the new plan
        await fetchPlanDetails();
      }

      // Add AI response to chat
      const aiResponse: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: aiMessage,
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      // Add error message to chat
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get AI response";
      const errorResponse: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `Error: ${errorMessage}`,
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const existingPlanId = sessionStorage.getItem("currentGoalPlanId");

      const planData = {
        goal: goalTitle,
        horizon,
        domains,
        steps: steps.map((step) => ({
          title: step.title,
          description: step.description,
          due_date: step.due_date,
        })),
      };

      if (existingPlanId) {
        // Update existing plan
        await apiService.patch(`/v1/life/plans/${existingPlanId}`, planData);
        showToast("success", "Goal updated successfully!");
      } else {
        // Create new plan
        await apiService.post("/v1/life/plans", planData);
        showToast("success", "Goal created successfully!");
        sessionStorage.removeItem("currentGoalPlanId");

        // Clear form
        setGoalTitle("");
        setHorizon("");
        setDomains([]);
        setSteps([]);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save goal";
      showToast("error", errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="New Goal" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto max-w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          {/* Breadcrumb */}
          <Link href="/Life">
            <button className="flex items-center my-6 gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Life Advisory / Life Planner / New Goal</span>
            </button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - AI Edit */}
            <div className="lg:col-span-1 lg:sticky lg:top-6 lg:self-start">
              <AIEditSidebar
                title="Chat with AI"
                messages={messages}
                isLoading={isChatLoading}
                onSend={handleSend}
                onModify={handleSend}
                onAttach={() => {}}
                onMicrophone={() => {}}
                placeholder="Ask me to modify a plan..."
                emptyStateMessage="Ask me to help create a meaningful life goal..."
              />
            </div>

            {/* Right Column - Goal Form */}
            <div className="lg:col-span-2">
              <GoalForm
                goalTitle={goalTitle}
                horizon={horizon}
                domains={domains}
                steps={steps}
                onGoalTitleChange={setGoalTitle}
                onHorizonChange={setHorizon}
                onDomainsChange={setDomains}
                onStepsChange={setSteps}
                onPublish={handlePublish}
                onClose={() => {
                  sessionStorage.removeItem("currentGoalPlanId");
                  window.history.back();
                }}
                isPublishing={isPublishing}
              />
            </div>
          </div>
        </div>
      </main>

      <Toast toast={toast} />
    </div>
  );
}
