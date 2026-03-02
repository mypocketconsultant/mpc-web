"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Mic,
  Paperclip,
  Loader2,
  History,
  Plus,
} from "lucide-react";
import ChatHistoryDrawer from "@/components/ChatHistoryDrawer";
import Header from "@/app/components/header";
import FormattedMessage from "@/components/FormattedMessage";
import ThinkingBubble from "@/components/ThinkingBubble";
import FileUploadModal from "@/app/components/FileUploadModal";
import { apiService } from "@/lib/api/apiService";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";
import { useVoiceInput } from "@/hooks/useVoiceInput";

// ── Types ──────────────────────────────────────────────

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  actions?: Array<{ type: string; payload: any }>;
  metadata?: Record<string, any>;
}

interface AgentResponse {
  module: string;
  intent: string;
  message: string;
  plan?: Record<string, unknown>;
  actions?: Array<{ type: string; payload: any }>;
  metadata?: Record<string, unknown>;
}

// ── Suggested prompts for welcome state ────────────────

const suggestedPrompts = [
  "How can I create a budget that works for me?",
  "What's the 50/30/20 rule for budgeting?",
  "How do I start building an emergency fund?",
  "Tips for reducing my monthly expenses",
];

// ── ChatMessage component (matches study chat pattern) ─

function ChatMessage({ message }: { message: Message }) {
  const isAI = message.type === "ai";

  return (
    <div
      className={`flex gap-3 ${isAI ? "justify-start" : "justify-end"} mb-4`}
    >
      {isAI && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#5A3FFF] to-[#300878] flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      )}

      <div
        className={`max-w-[80%] ${
          isAI
            ? "bg-gradient-to-br from-white to-[#FEFEFF] border border-[#E8E4FF] rounded-2xl rounded-tl-md"
            : "bg-gradient-to-br from-[#5A3FFF] to-[#7B61FF] rounded-2xl rounded-tr-md"
        } px-4 py-3 shadow-sm`}
      >
        <FormattedMessage
          content={message.content}
          variant={isAI ? "light" : "dark"}
        />

        <span
          className={`text-[10px] mt-2 block ${isAI ? "text-gray-400" : "text-white/60"}`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {!isAI && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// ── Main content component ─────────────────────────────

function FinanceChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  const { isRecording, isTranscribing, toggleRecording } = useVoiceInput();
  const { toast, showToast, hideToast } = useToast();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();

    const sessionIdParam = searchParams.get("session_id");
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      loadSession(sessionIdParam);
    }

    const promptParam = searchParams.get("prompt");
    if (promptParam) {
      try {
        setInputValue(decodeURIComponent(promptParam));
      } catch {
        setInputValue(promptParam);
      }
    }
  }, [searchParams]);

  // ── Load a persisted session from chat_sessions ──────

  const loadSession = async (sid: string) => {
    try {
      const response = await apiService.get<{
        status: string;
        data: {
          id: string;
          messages: Array<{ role: string; content: string; timestamp: string }>;
        };
      }>(`/v1/chat-sessions/${sid}`);
      const sessionData = response?.data;
      if (sessionData?.messages) {
        const loaded: Message[] = sessionData.messages.map(
          (msg: any, idx: number) => ({
            id: `loaded_${idx}`,
            type: msg.role === "user" ? "user" : "ai",
            content: msg.content,
            timestamp: new Date(msg.timestamp || Date.now()),
          }),
        );
        setMessages(loaded);
      }
    } catch {
      // session may not exist yet
    }
  };

  // ── Process agent actions and show toasts ────────────

  const processAgentActions = (agentResponse: AgentResponse) => {
    const actions = agentResponse.actions;
    const metadata = agentResponse.metadata as Record<string, any> | undefined;

    if (actions && actions.length > 0) {
      for (const action of actions) {
        switch (action.type) {
          case "finance.create_transaction": {
            const txId = metadata?.created_transaction_id;
            showToast(
              "success",
              "Transaction created!",
              txId
                ? {
                    label: "View in Budget Planner",
                    onClick: () =>
                      router.push("/financial-literacy/budget-planner"),
                  }
                : undefined,
            );
            break;
          }
          case "finance.update_transaction": {
            showToast("success", "Transaction updated.");
            break;
          }
          case "finance.create_budget": {
            const budgetId = metadata?.created_budget_id;
            showToast(
              "success",
              "Budget created!",
              budgetId
                ? {
                    label: "View Budget",
                    onClick: () =>
                      router.push("/financial-literacy/budget-planner"),
                  }
                : undefined,
            );
            break;
          }
          case "finance.update_budget": {
            showToast("success", "Budget updated.");
            break;
          }
          case "finance.publish_budget": {
            showToast("success", "Budget published!");
            break;
          }
          case "finance.export_cashflow_pdf": {
            const docId =
              metadata?.created_doc_id || (action.payload as any)?.doc_id;
            if (docId) {
              showToast("success", "PDF export started. Generating...", {
                label: "View Reports",
                onClick: () => router.push("/financial-literacy/reports"),
              });
            }
            break;
          }
          case "finance.list_transactions":
          case "finance.list_budgets":
          case "finance.get_transaction":
          case "finance.get_budget":
          case "finance.get_doc":
          case "finance.poll_doc":
            // Data-fetching actions — info is in the agent message
            break;
          default:
            break;
        }
      }
    }
  };

  // ── History drawer handlers ───────────────────────────

  const handleNewChat = () => {
    setMessages([]);
    setSessionId("");
    window.history.replaceState(null, "", "/financial-literacy/chat");
  };

  const handleSelectSession = (selectedSessionId: string) => {
    setIsDrawerOpen(false);
    setMessages([]);
    setSessionId(selectedSessionId);
    window.history.replaceState(
      null,
      "",
      `/financial-literacy/chat?session_id=${selectedSessionId}`,
    );
    loadSession(selectedSessionId);
  };

  // ── Send message handler ─────────────────────────────

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const payload: Record<string, unknown> = {
        message: userMessage.content,
        session_id: sessionId || undefined,
      };

      const httpResponse = await apiService.post<{
        status: string;
        message: string;
        data: AgentResponse;
      }>("/v1/finance/chat", payload);

      const agentResponse = httpResponse.data;
      console.log("[mpc-web][finance.chat] ←", {
        intent: agentResponse?.intent,
        actions: agentResponse?.actions?.map((a: any) => a.type),
        created_budget_id: agentResponse?.metadata?.created_budget_id ?? null,
      });

      // Capture session_id from response metadata
      const returnedSessionId = agentResponse?.metadata?.session_id as string;
      if (returnedSessionId && returnedSessionId !== sessionId) {
        setSessionId(returnedSessionId);
        window.history.replaceState(
          null,
          "",
          `/financial-literacy/chat?session_id=${returnedSessionId}`,
        );
      }

      // Extract message content with fallbacks (same pattern as study/life chats)
      const aiContent =
        agentResponse?.message ||
        (httpResponse as any)?.data?.data?.message ||
        "I received your message but could not generate a response.";

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: aiContent,
        timestamp: new Date(),
        actions: agentResponse?.actions ?? undefined,
        metadata: (agentResponse?.metadata as Record<string, any>) ?? undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Process actions — show toasts, navigate, etc.
      processAgentActions(agentResponse);
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : "Failed to get AI response";
      showToast("error", errorText);

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "ai",
        content:
          "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const handleMicrophone = () => {
    toggleRecording((text) => {
      setInputValue(text);
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Finance Literacy" />

      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="max-w-[900px] w-full mx-auto px-4 sm:px-6 py-4 flex flex-col h-full">
          {/* Back button + History actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <Link href="/financial-literacy">
              <button className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors">
                <ChevronLeft className="h-4 w-4" />
                <span className="truncate max-w-[200px] sm:max-w-none">
                  Finance Literacy / Chat with AI Agent
                </span>
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewChat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#5A3FFF] bg-[#F0EDFF] rounded-lg hover:bg-[#E8E4FF] transition-colors"
              >
                <History className="w-4 h-4" />
                History
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6 mb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                {/* Welcome State */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8E0FF] to-[#F3F0FF] flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-[#5A3FFF]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Financial AI Assistant
                </h2>
                <p className="text-gray-500 text-sm max-w-md">
                  I&apos;m here to help you manage your finances better. Ask me
                  about budgeting, saving, investing, or any financial topic.
                </p>

                {/* Suggested Prompts */}
                <div className="w-full max-w-lg mt-8">
                  <p className="text-sm text-gray-500 mb-3">
                    Try one of these prompts:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestedPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedPrompt(prompt)}
                        className="text-left p-3 bg-gradient-to-br from-[#F8F6FF] to-[#F3F0FF] rounded-xl text-sm text-gray-700 hover:shadow-md hover:scale-[1.02] transition-all border border-[#E8E0FF]"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {/* Loading indicator — same ThinkingBubble as study chat */}
                {isLoading && <ThinkingBubble />}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-2 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                onClick={() => setIsFileModalOpen(true)}
                className="flex-[0_0_auto] p-2 sm:p-3 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors shrink-0"
                aria-label="Attach file"
              >
                <Paperclip className="h-5 w-5 text-gray-500" />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me how to make my finances better."
                className="flex-1 min-w-0 bg-gray-50 rounded-full px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:bg-white transition-all"
                disabled={isLoading}
              />

              <button
                onClick={handleMicrophone}
                disabled={isTranscribing}
                className={`flex-[0_0_auto] shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center ${
                  isRecording
                    ? "bg-red-500"
                    : isTranscribing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-br from-[#5A3FFF] to-[#300878]"
                }`}
                style={
                  isRecording
                    ? {
                        animation:
                          "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      }
                    : undefined
                }
                aria-label="Voice input"
              >
                {isTranscribing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <ChatHistoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        module="finance"
        currentSessionId={sessionId}
      />

      <FileUploadModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onUpload={(file) => {
          setIsFileModalOpen(false);
          showToast("success", `File "${file.name}" attached.`);
        }}
      />

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

// ── Page export ────────────────────────────────────────

export default function FinanceChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          Loading...
        </div>
      }
    >
      <FinanceChatContent />
    </Suspense>
  );
}
