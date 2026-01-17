"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";
import { apiService } from "@/lib/api/apiService";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<"career" | "life">("career");
  const [sessionId, setSessionId] = useState<string>("");
  const { toast, showToast } = useToast();

  // Initialize context and session ID on mount
  useEffect(() => {
    const contextParam = searchParams.get("context") as "career" | "life";
    if (contextParam) {
      setContext(contextParam);
    }

    // Generate or retrieve session ID
    const storedSessionId = sessionStorage.getItem("chatSessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("chatSessionId", newSessionId);
      setSessionId(newSessionId);
    }
  }, [searchParams]);

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
        session_id: sessionId,
      };

      if (context === "career") {
        endpoint = "/v1/career/chat";
      } else if (context === "life") {
        endpoint = "/v1/life/chat";
      }

      if (!endpoint) {
        console.error("Invalid context:", context);
        return null;
      }

      const httpResponse = await apiService.post<{
        status: string;
        message: string;
        data: AgentResponse;
      }>(endpoint, payload);

      // Extract the agent response from the HTTP response wrapper
      return httpResponse.data;
    } catch (error) {
      console.error("Agent call failed:", error);
      return null;
    }
  };

  const handleSend = async (message: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call the appropriate agent
      const response = await callAgent(message);

      console.log("=== AGENT RESPONSE ===");
      console.log("Full Response Object:", response);
      console.log("Response Type:", typeof response);
      console.log("Response Keys:", response ? Object.keys(response) : "null");
      if (response) {
        console.log("module:", response.module);
        console.log("intent:", response.intent);
        console.log("message:", response.message);
        console.log("plan:", response.plan);
        console.log("actions:", response.actions);
        console.log("metadata:", response.metadata);
      }
      console.log("=====================");

      if (response) {
        // Add AI response
        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          type: "ai",
          content: response.message,
        };

        // Handle actions if present
        if (response.actions && response.actions.length > 0) {
          const action = response.actions[0];
          if (action.type === "view_plan" || action.type === "view_document") {
            aiMessage.link = {
              text: (action.payload as Record<string, string>)?.text || "View Details",
              url: (action.payload as Record<string, string>)?.url || "#",
            };
          }
        }

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Show error toast
        showToast('error', "Sorry, I couldn't process your request. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleSend:", error);
      showToast('error', "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttach = () => {
    console.log("Attach file clicked");
  };

  const handleMicrophone = () => {
    console.log("Microphone clicked");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <Header title={getTitleFromPath(pathname)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1100px] w-full mx-auto px-8 py-6">
          {/* Breadcrumb */}
          <Link
            href="/career"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            {context === "career" ? "Career Advisory" : "Life Chat"} / Chat
          </Link>

          <hr className="mb-8 border-gray-200" />

          {/* Chat Messages */}
          <div className="space-y-6 mb-8">
            {messages.length === 0 ? (
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
                    <div className="max-w-xl">
                      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                          {message.content}
                        </p>
                        {message.link && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-lg">
                              {typeof message.link === "object"
                                ? message.link.icon || "📄"
                                : "🔗"}
                            </span>
                            {typeof message.link === "object" ? (
                              <button className="text-gray-900 font-medium hover:text-indigo-600 transition-colors">
                                {message.link.text}
                              </button>
                            ) : (
                              <a
                                href={message.link}
                                className="text-indigo-600 text-sm hover:underline break-all"
                              >
                                {message.link}
                              </a>
                            )}
                          </div>
                        )}
                        {message.actionLink && (
                          <a
                            href={message.actionLink.url}
                            className="inline-block text-indigo-600 text-sm font-semibold hover:text-indigo-700 transition-colors"
                          >
                            {message.actionLink.text}
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-xl">
                      <div className="bg-purple-50 rounded-2xl p-5 shadow-sm border border-purple-100">
                        <p className="text-sm text-gray-800 leading-relaxed mb-3">
                          {message.content}
                        </p>
                        {message.attachment && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-lg">📄</span>
                            <div>
                              <div className="text-indigo-600 font-medium">
                                {message.attachment.name}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {message.attachment.size}
                              </div>
                            </div>
                          </div>
                        )}
                        {message.link && typeof message.link === "string" && (
                          <a
                            href={message.link}
                            className="text-indigo-600 text-sm hover:underline break-all"
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
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xl">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Input Footer */}
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
      />

      <Toast toast={toast} />
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
