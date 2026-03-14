"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mic, Paperclip, Loader2, History, Plus, Send } from "lucide-react";
import ChatHistoryDrawer from "@/components/ChatHistoryDrawer";
import Header from "@/app/components/header";
import ChatMessage, { Message } from "../components/ChatMessage";
import ClassSelectionSidebar, {
  StudyClass,
} from "../components/ClassSelectionSidebar";
import {
  AttachedFile,
  getFileType,
  formatFileSize,
} from "../components/FileAttachment";
import { apiService } from "@/lib/api/apiService";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";
import ThinkingBubble from "@/components/ThinkingBubble";

function StudyChatContent() {
  const searchParams = useSearchParams();
  const context = searchParams.get("context") || "study";
  const classParam = searchParams.get("class");
  const promptParam = searchParams.get("prompt");

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState(promptParam || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [classes, setClasses] = useState<StudyClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    classParam || null,
  );
  const [sessionId, setSessionId] = useState<string>("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { isRecording, isTranscribing, toggleRecording } = useVoiceInput();
  const { toast, showToast, hideToast } = useToast();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Load messages when a class is selected
  useEffect(() => {
    if (selectedClassId) {
      loadClassMessages(selectedClassId);
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    setIsLoadingClasses(true);
    try {
      const response: any = await apiService.get("/v1/study/classes");
      const data = response?.data || response;
      const classList = Array.isArray(data) ? data : data?.classes || [];

      // Map backend shape (title) to sidebar shape (name)
      const mapped: StudyClass[] = classList.map((c: any) => ({
        id: c._id || c.id,
        name: c.title || c.name,
        subject: c.subject,
        color: c.color,
      }));

      setClasses(mapped);

      // Auto-select first class if none selected
      if (!selectedClassId && mapped.length > 0) {
        setSelectedClassId(mapped[0].id);
      }
    } catch (error) {
      showToast("error", "Failed to load classes.");
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const loadClassMessages = async (classId: string) => {
    setIsLoadingMessages(true);
    setMessages([]);
    setSessionId("");
    try {
      const response: any = await apiService.get(
        `/v1/study/classes/${classId}/messages`,
      );
      const data = response?.data || response;
      const msgList = Array.isArray(data) ? data : data?.messages || [];

      const loaded: Message[] = msgList.map((msg: any, idx: number) => ({
        id: msg._id || `loaded_${idx}`,
        type: msg.role === "user" ? "user" : "ai",
        content: msg.content || "",
        timestamp: new Date(msg.created_at || Date.now()),
      }));

      setMessages(loaded);
    } catch {
      // Class may have no messages yet — that's fine
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const loadSession = async (sid: string) => {
    setIsLoadingMessages(true);
    setMessages([]);
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
        const loaded: Message[] = sessionData.messages.map((msg: any, idx: number) => ({
          id: `loaded_${idx}`,
          type: msg.role === "user" ? "user" : "ai",
          content: msg.content,
          timestamp: new Date(msg.timestamp || Date.now()),
        }));
        setMessages(loaded);
      }
    } catch {
      // session may not exist yet
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFile: AttachedFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: formatFileSize(file.size),
        type: getFileType(file.name),
        url: URL.createObjectURL(file),
      };
      setAttachedFile(newFile);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = () => {
    if (attachedFile?.url) {
      URL.revokeObjectURL(attachedFile.url);
    }
    setAttachedFile(null);
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !attachedFile) || isLoading) return;

    const messageText = inputValue.trim() || "Please process this file";

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: messageText,
      timestamp: new Date(),
      attachment: attachedFile || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    handleRemoveFile();
    setIsLoading(true);

    try {
      const payload: any = {
        message: messageText,
        class_id: selectedClassId || undefined,
        session_id: sessionId || undefined,
      };

      const response: any = await apiService.post("/v1/study/chat", payload);

      // Extract session_id from response if available
      const returnedSessionId =
        response?.data?.metadata?.session_id ||
        response?.data?.data?.metadata?.session_id;
      if (returnedSessionId && returnedSessionId !== sessionId) {
        setSessionId(returnedSessionId);
        window.history.replaceState(null, "", `/study/chat?session_id=${returnedSessionId}`);
      }

      const aiContent =
        response?.data?.message ||
        response?.data?.data?.message ||
        "I received your message but could not generate a response.";

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: aiContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectClass = (classItem: StudyClass) => {
    setSelectedClassId(classItem.id);
  };

  const handleAddClass = async (className: string) => {
    try {
      const response: any = await apiService.post("/v1/study/classes", {
        title: className,
      });

      const created = response?.data || response;
      const newClass: StudyClass = {
        id: created._id || created.id || `class-${Date.now()}`,
        name: created.title || className,
        subject: created.subject,
        color: created.color,
      };

      setClasses((prev) => [...prev, newClass]);
      setSelectedClassId(newClass.id);
      setMessages([]);
      setSessionId("");
      showToast("success", "Class created successfully!");
    } catch (error) {
      showToast("error", "Failed to create class. Please try again.");
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      await apiService.delete(`/v1/study/classes/${classId}`);

      setClasses((prev) => {
        const updated = prev.filter((c) => c.id !== classId);

        // If the deleted class was selected, select the next available or clear
        if (selectedClassId === classId) {
          if (updated.length > 0) {
            setSelectedClassId(updated[0].id);
          } else {
            setSelectedClassId(null);
            setMessages([]);
            setSessionId("");
          }
        }

        return updated;
      });

      showToast("success", "Class deleted successfully!");
    } catch (error) {
      showToast("error", "Failed to delete class. Please try again.");
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId("");
    window.history.replaceState(null, "", "/study/chat");
  };

  const handleSelectSession = (selectedSessionId: string) => {
    setIsDrawerOpen(false);
    setMessages([]);
    setSessionId(selectedSessionId);
    window.history.replaceState(null, "", `/study/chat?session_id=${selectedSessionId}`);
    loadSession(selectedSessionId);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleMicrophone = () => {
    toggleRecording((text) => {
      setInputValue(text);
    });
  };

  const breadcrumbTitle = selectedClass
    ? `Study Support / Chat Class/${selectedClass.name.replace(" class", "")}`
    : "Study Support / Chat";

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Study Support" />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-4 flex flex-col h-full">
          {/* Back button / Breadcrumb + History actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4">
            <Link href="/study">
              <button className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] transition-colors">
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="truncate max-w-[220px] sm:max-w-none">{breadcrumbTitle}</span>
              </button>
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleNewChat}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                New Chat
              </button>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-[#5A3FFF] bg-[#F0EDFF] rounded-lg hover:bg-[#E8E4FF] transition-colors"
              >
                <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                History
              </button>
            </div>
          </div>

          {/* Two-column layout — sidebar hidden on mobile */}
          <div className="flex-1 flex gap-4 lg:gap-6 overflow-hidden">
            {/* Left column - Class selection (hidden on mobile/tablet) */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              {isLoadingClasses ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-[#5A3FFF] animate-spin" />
                </div>
              ) : (
                <ClassSelectionSidebar
                  classes={classes}
                  selectedClassId={selectedClassId}
                  onSelectClass={handleSelectClass}
                  onAddClass={handleAddClass}
                  onDeleteClass={handleDeleteClass}
                />
              )}
            </div>

            {/* Right column - Chat */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6 mb-3 sm:mb-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 text-[#5A3FFF] animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
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
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedClass
                        ? `${selectedClass.name} Assistant`
                        : "Study AI Assistant"}
                    </h2>
                    <p className="text-gray-500 text-sm max-w-md">
                      Upload documents, recordings, or ask questions about your{" "}
                      {selectedClass?.name.toLowerCase() || "studies"}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}

                    {/* Loading indicator */}
                    {isLoading && <ThinkingBubble />}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-2 sm:p-4">
                {/* Attached file preview */}
                {attachedFile && (
                  <div className="mb-2 sm:mb-3 flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-[#F3F0FF] rounded-lg border border-[#E8E0FF]">
                      <span className="text-xs sm:text-sm font-medium text-gray-800 truncate max-w-[150px] sm:max-w-none">
                        {attachedFile.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {attachedFile.size}
                      </span>
                      <button
                        onClick={handleRemoveFile}
                        className="ml-1 text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-1.5 sm:gap-3">
                  <button
                    onClick={handleAttachClick}
                    className="flex-shrink-0 p-1.5 sm:p-3 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors mb-0.5"
                    aria-label="Attach file"
                  >
                    <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.mp3,.wav,.mp4,.jpg,.jpeg,.png,.gif"
                  />

                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      autoResize();
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder={
                      selectedClass
                        ? `Ask about ${selectedClass.name.toLowerCase()}...`
                        : "Ask a study question..."
                    }
                    className="flex-1 min-w-0 bg-gray-50 rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:bg-white transition-all resize-none overflow-hidden max-h-[120px]"
                    disabled={isLoading}
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={(!inputValue.trim() && !attachedFile) || isLoading}
                    className={`flex-shrink-0 h-9 w-9 sm:h-12 sm:w-12 rounded-full text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center ${
                      (inputValue.trim() || attachedFile) && !isLoading
                        ? "bg-[#5A3FFF] hover:bg-[#4A2FEF]"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  <button
                    onClick={handleMicrophone}
                    disabled={isTranscribing}
                    className={`flex-shrink-0 h-9 w-9 sm:h-12 sm:w-12 rounded-full text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center ${
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
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    ) : (
                      <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ChatHistoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        module="study"
        currentSessionId={sessionId}
      />

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

export default function StudyChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          Loading...
        </div>
      }
    >
      <StudyChatContent />
    </Suspense>
  );
}
