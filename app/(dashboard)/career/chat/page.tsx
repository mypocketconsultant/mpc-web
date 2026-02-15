"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, History, Plus } from "lucide-react";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";
import { apiService } from "@/lib/api/apiService";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";
import ThinkingBubble from "@/components/ThinkingBubble";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import ChatHistoryDrawer from "@/components/ChatHistoryDrawer";
import FormattedMessage from "@/components/FormattedMessage";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  link?:
    | {
        text: string;
        url: string;
        icon?: string;
      }
    | string;
  actionLink?: {
    text: string;
    url: string;
  };
  attachment?: {
    name: string;
    size: string;
  };
}

interface AgentResponse {
  module: string;
  intent: string;
  message: string;
  plan?: Record<string, unknown>;
  actions?: Array<{ type: string; payload: unknown }>;
  metadata?: Record<string, unknown>;
}

function ChatPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<"career" | "life">("career");
  const [sessionId, setSessionId] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const { isRecording, isTranscribing, toggleRecording } = useVoiceInput();

  // Initialize context and session ID on mount
  useEffect(() => {
    const contextParam = searchParams.get("context") as "career" | "life";
    if (contextParam) {
      setContext(contextParam);
    }

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

  const getTitleFromPath = (path: string) => {
    if (path.includes("/chat")) return "Chat";
    if (path.includes("/career")) return "Career Advisory";
    return "My Pocket Consultant";
  };

  const callAgent = async (message: string) => {
    try {
      let endpoint = "";
      let payload: Record<string, unknown> = {
        message,
        session_id: sessionId || undefined,
      };

      if (context === "career") {
        endpoint = "/v1/career/chat";
      } else if (context === "life") {
        endpoint = "/v1/life/chat";
      }

      if (!endpoint) {
        return null;
      }

      const httpResponse = await apiService.post<{
        status: string;
        message: string;
        data: AgentResponse;
      }>(endpoint, payload);

      return httpResponse.data;
    } catch (error) {
      return null;
    }
  };

  const handleSend = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInputValue("");

    try {
      const response = await callAgent(message);

      if (response) {
        // Capture session_id from response metadata
        const returnedSessionId = response?.metadata?.session_id as string;
        if (returnedSessionId && returnedSessionId !== sessionId) {
          setSessionId(returnedSessionId);
          // Update URL with session_id without full page reload
          const newUrl = `/career/chat?context=${context}&session_id=${returnedSessionId}`;
          window.history.replaceState(null, "", newUrl);
        }

        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          type: "ai",
          content: response.message,
        };

        if (response.actions && response.actions.length > 0) {
          const action = response.actions[0];
          if (action.type === "view_plan" || action.type === "view_document") {
            aiMessage.link = {
              text:
                (action.payload as Record<string, string>)?.text ||
                "View Details",
              url: (action.payload as Record<string, string>)?.url || "#",
            };
          }
        }

        setMessages((prev) => [...prev, aiMessage]);

        const toolResults = response?.metadata?.tool_results as
          | Record<string, any>
          | undefined;
        if (toolResults) {
          const planCreationKey = Object.keys(toolResults).find((key) =>
            key.includes("create_tasks")
          );
          if (planCreationKey) {
            const planId = toolResults[planCreationKey]?.plan_id;
            if (planId) {
              sessionStorage.setItem("currentCareerPlanId", planId);
              showToast("success", "A Career Plan was created!", {
                label: "View Details",
                onClick: () => {
                  router.push(`/career/create-plan?planId=${planId}`);
                },
              });
            }
          }

          const docCreationKey = Object.keys(toolResults).find((key) =>
            key.includes("create_document")
          );
          if (docCreationKey) {
            const docId =
              toolResults[docCreationKey]?.doc_id ||
              toolResults[docCreationKey]?.document_id;
            if (docId) {
              sessionStorage.setItem("currentDocumentId", docId);
              showToast("success", "A document was created!", {
                label: "View Details",
                onClick: () => {
                  router.push(`/career/resume-builder?docId=${docId}`);
                },
              });
            }
          }
        }
      } else {
        showToast(
          "error",
          "Sorry, I couldn't process your request. Please try again."
        );
      }
    } catch (error) {
      showToast("error", "An error occurred. Please try again.");
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
    const newUrl = `/career/chat?context=${context}`;
    window.history.replaceState(null, "", newUrl);
  };

  const handleSelectSession = (selectedSessionId: string) => {
    setIsDrawerOpen(false);
    setMessages([]);
    setSessionId(selectedSessionId);
    const newUrl = `/career/chat?context=${context}&session_id=${selectedSessionId}`;
    window.history.replaceState(null, "", newUrl);
    loadSession(selectedSessionId);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <Header title={getTitleFromPath(pathname)} />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1100px] w-full mx-auto px-8 py-6">
          {/* Breadcrumb + Actions */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/career"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {context === "career" ? "Career Advisory" : "Life Chat"} / Chat
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

          <hr className="mb-8 border-gray-200" />

          {/* Chat Messages */}
          <div className="space-y-6 mb-8">
            {isLoadingSession ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {context === "career"
                    ? "Start a conversation with your Career Coach"
                    : "Start a conversation with your Life Coach"}
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
                    <div className="max-w-[700px]">
                      <div className="bg-gradient-to-br from-white to-[#FEFEFF] rounded-2xl p-6 shadow-md border border-[#E8E4FF] hover:shadow-lg transition-shadow">
                        <FormattedMessage content={message.content} variant="light" />
                        {message.link && (
                          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#E8E4FF]">
                            <span className="text-xl">
                              {typeof message.link === "object"
                                ? message.link.icon || "📄"
                                : "🔗"}
                            </span>
                            {typeof message.link === "object" ? (
                              <button className="text-gray-900 font-semibold hover:text-[#5A3FFF] transition-colors">
                                {message.link.text}
                              </button>
                            ) : (
                              <a
                                href={message.link}
                                className="text-[#5A3FFF] text-sm hover:underline break-all font-medium"
                              >
                                {message.link}
                              </a>
                            )}
                          </div>
                        )}
                        {message.actionLink && (
                          <a
                            href={message.actionLink.url}
                            className="inline-block mt-3 text-[#5A3FFF] text-sm font-semibold hover:text-[#4A2FEF] transition-colors"
                          >
                            {message.actionLink.text} →
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[700px]">
                      <div className="bg-gradient-to-br from-[#5A3FFF] to-[#7B61FF] rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                        <FormattedMessage content={message.content} variant="dark" />
                        {message.attachment && (
                          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/20">
                            <span className="text-xl">📄</span>
                            <div>
                              <div className="text-white font-semibold">
                                {message.attachment.name}
                              </div>
                              <div className="text-white/70 text-xs">
                                {message.attachment.size}
                              </div>
                            </div>
                          </div>
                        )}
                        {message.link && typeof message.link === "string" && (
                          <a
                            href={message.link}
                            className="text-white text-sm hover:underline break-all mt-3 block font-medium"
                          >
                            {message.link}
                          </a>
                        )}
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

      <InputFooter
        placeholder={
          context === "career"
            ? "Ask me to optimize your LinkedIn..."
            : "Share what's on your mind..."
        }
        onSend={handleSend}
        onAttach={handleAttach}
        onMicrophone={handleMicrophone}
        context={context}
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        value={inputValue}
        onValueChange={setInputValue}
      />

      <ChatHistoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        module={context}
        currentSessionId={sessionId}
      />

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
