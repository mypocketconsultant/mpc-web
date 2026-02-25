"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Paperclip, Mic, History, Plus, Loader2 } from "lucide-react";
import Header from "@/app/components/header";
import { apiService } from "@/lib/api/apiService";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";
import ThinkingBubble from "@/components/ThinkingBubble";
import ChatHistoryDrawer from "@/components/ChatHistoryDrawer";
import FormattedMessage from "@/components/FormattedMessage";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  document?: {
    title: string;
    icon?: string;
  };
}

function LifeChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isRecording, isTranscribing, toggleRecording } = useVoiceInput();
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    // Check for session_id in URL
    const sessionIdParam = searchParams.get("session_id");
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      loadSession(sessionIdParam);
    }

    // Get prompt from URL parameter
    const promptParam = searchParams.get("prompt");
    if (promptParam) {
      try {
        setInputValue(decodeURIComponent(promptParam));
      } catch {
        setInputValue(promptParam);
      }
    }
  }, [searchParams]);

  const loadSession = async (sid: string) => {
    setIsLoadingSession(true);
    try {
      const response = await apiService.get<{
        status: string;
        data: {
          id: string;
          messages: Array<{
            role: string;
            content: string;
            timestamp: string;
          }>;
        };
      }>(`/v1/chat-sessions/${sid}`);

      const sessionData = response?.data;
      if (sessionData?.messages) {
        const loadedMessages: Message[] = sessionData.messages.map(
          (msg: any, idx: number) => ({
            id: `loaded_${idx}`,
            type: msg.role === "user" ? "user" : "ai",
            content: msg.content,
          })
        );
        setMessages(loadedMessages);
      }
    } catch (error) {
      showToast("error", "Failed to load chat session.");
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const payload = {
        message: message.trim(),
        session_id: sessionId || undefined,
      };

      const response: any = await apiService.post("/v1/life/chat", payload);

      // Capture session_id from response
      const returnedSessionId =
        response?.data?.metadata?.session_id ||
        response?.data?.data?.metadata?.session_id;
      if (returnedSessionId && returnedSessionId !== sessionId) {
        setSessionId(returnedSessionId);
        window.history.replaceState(
          null,
          "",
          `/Life/chat?session_id=${returnedSessionId}`
        );
      }

      const aiMessage =
        response?.data?.message ||
        response?.data?.data?.message ||
        "I received your message but could not generate a response.";

      const aiResponse: Message = {
        id: Date.now().toString(),
        type: "ai",
        content: aiMessage,
      };
      setMessages((prev) => [...prev, aiResponse]);

      const toolResults =
        response?.data?.metadata?.tool_results ||
        response?.data?.data?.metadata?.tool_results;
      if (toolResults) {
        const planCreationKey = Object.keys(toolResults).find((key) =>
          key.includes("create_life_plan")
        );
        if (planCreationKey) {
          const planId = toolResults[planCreationKey]?.plan_id;
          if (planId) {
            sessionStorage.setItem("currentGoalPlanId", planId);
            showToast("success", "A Life Plan was created!", {
              label: "View Details",
              onClick: () => {
                router.push("/Life/new-goal");
              },
            });
          }
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get AI response";
      showToast("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttach = () => {};

  const handleMicrophone = () => {
    toggleRecording((text) => {
      setInputValue(text);
    });
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId("");
    setInputValue("");
    window.history.replaceState(null, "", "/Life/chat");
  };

  const handleSelectSession = (selectedSessionId: string) => {
    setIsDrawerOpen(false);
    setMessages([]);
    setSessionId(selectedSessionId);
    window.history.replaceState(
      null,
      "",
      `/Life/chat?session_id=${selectedSessionId}`
    );
    loadSession(selectedSessionId);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      <Header title="Life Advisory" />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1200px] w-full mx-auto px-8 py-6">
          {/* Breadcrumb + Actions */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/Life"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#5A3FFF] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Life Advisory / Chat
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

          {/* Chat Messages */}
          <div className="space-y-6 mb-32">
            {isLoadingSession ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Start a conversation with your Life Coach
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.type === "ai" ? (
                    <div className="max-w-[600px]">
                      <div className="bg-gradient-to-br from-white to-[#FEFEFF] rounded-2xl p-6 shadow-md border border-[#E8E4FF] hover:shadow-lg transition-shadow">
                        <FormattedMessage content={message.content} variant="light" />
                        {message.document && (
                          <div className="mt-4 pt-4 border-t border-[#E8E4FF]">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">
                                {message.document.icon}
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {message.document.title}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[600px]">
                      <div className="bg-gradient-to-br from-[#5A3FFF] to-[#7B61FF] rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                        <FormattedMessage content={message.content} variant="dark" />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && <ThinkingBubble />}
          </div>
        </div>
      </main>

      {/* Fixed Bottom Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-[900px] mx-auto px-8 py-6">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-3 shadow-sm hover:border-gray-300 transition-colors">
            <button
              onClick={handleAttach}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(inputValue);
                }
              }}
              placeholder="Ask me to create a plan to boost my mood..."
              className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-gray-400"
            />

            <button
              onClick={handleMicrophone}
              disabled={isTranscribing}
              className={`flex-shrink-0 p-3 text-white rounded-full transition-colors ${
                isRecording
                  ? "bg-red-500"
                  : isTranscribing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#5A3FFF] hover:bg-[#4A2FEF]"
              }`}
              style={
                isRecording
                  ? {
                      animation:
                        "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    }
                  : undefined
              }
            >
              {isTranscribing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <ChatHistoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        module="life"
        currentSessionId={sessionId}
      />

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

export default function LifeChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LifeChatPageContent />
    </Suspense>
  );
}
