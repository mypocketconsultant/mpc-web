"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Paperclip, Mic } from "lucide-react";
import Header from "@/app/components/header";
import { apiService } from "@/lib/api/apiService";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  document?: {
    title: string;
    icon?: string;
  };
}

export default function LifeChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { isRecording, isTranscribing, toggleRecording } = useVoiceInput();
  const { toast, showToast } = useToast();

  // Generate session ID on mount
  useEffect(() => {
    const newSessionId = `life-chat-${Date.now()}`;
    setSessionId(newSessionId);
    console.log('[LifeChatPage] Session ID generated:', newSessionId);
  }, []);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
    };
    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const payload = {
        message: message.trim(),
        session_id: sessionId,
      };

      console.log('[LifeChatPage] Sending to /v1/life/chat:', payload);

      const response: any = await apiService.post('/v1/life/chat', payload);

      console.log('[LifeChatPage] Response from /v1/life/chat:', response);

      const aiMessage = response?.data?.message || response?.data?.data?.message || 'I received your message but could not generate a response.';

      const aiResponse: Message = {
        id: Date.now().toString(),
        type: "ai",
        content: aiMessage,
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('[LifeChatPage] Error calling chat API:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get AI response';
      showToast('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttach = () => {
    console.log("Attach file clicked");
  };

  const handleMicrophone = () => {
    toggleRecording((text) => {
      setInputValue(text);
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      {/* Header */}
      <Header title="Life Advisory" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1200px] w-full mx-auto px-8 py-6">
          {/* Breadcrumb */}
          <Link
            href="/Life"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#5A3FFF] transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Life Advisory / Chat
          </Link>

          {/* Chat Messages */}
          <div className="space-y-6 mb-32">
            {messages.length === 0 ? (
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
                  <div className="max-w-[400px]">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-700 mb-4">
                        {message.content}
                      </p>
                      {message.document && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{message.document.icon}</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {message.document.title}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[500px]">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-800">
                        {message.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[400px]">
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fixed Bottom Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-[900px] mx-auto px-8 py-6">
          {/* Document Info */}
          {messages.some(m => m.document) && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-gray-900">Foods for better moods</span>
                <span className="text-gray-400">📄</span>
              </div>
            </div>
          )}

          {/* Input Area */}
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
              onKeyPress={(e) => {
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
                  ? 'bg-red-500 animate-pulse'
                  : isTranscribing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#5A3FFF] hover:bg-[#4A2FEF]'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
