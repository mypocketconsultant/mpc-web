"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mic, Paperclip } from "lucide-react";
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

const sampleClasses: StudyClass[] = [
  { id: "1", name: "Biology class" },
  { id: "2", name: "Chemistry class" },
  { id: "3", name: "Physics class" },
  { id: "4", name: "Mathematics class" },
  { id: "5", name: "General studies class" },
];

function StudyChatContent() {
  const searchParams = useSearchParams();
  const context = searchParams.get("context") || "study";
  const classParam = searchParams.get("class");

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [classes, setClasses] = useState<StudyClass[]>(sampleClasses);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    classParam || sampleClasses[0]?.id || null,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue.trim() || "Please process this file",
      timestamp: new Date(),
      attachment: attachedFile || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    const sentFile = attachedFile;
    handleRemoveFile();
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate AI response based on attachment
      let responseContent =
        "I understand your request. Let me help you with that.";
      let downloadableFile: AttachedFile | undefined;

      if (sentFile) {
        if (sentFile.type === "audio") {
          responseContent =
            "Here's the one-page summary of the recording of your Biology class.";
          downloadableFile = {
            id: `download-${Date.now()}`,
            name: "One page summary of Biology class.pdf",
            size: "245KB",
            type: "document",
            url: "#",
          };
        } else if (sentFile.type === "document") {
          responseContent =
            "I've analyzed the document and created a summary for you.";
          downloadableFile = {
            id: `download-${Date.now()}`,
            name: `Summary of ${sentFile.name}`,
            size: "128KB",
            type: "document",
            url: "#",
          };
        }
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: responseContent,
        timestamp: new Date(),
        downloadableFile,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
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
    setMessages([]);
  };

  const handleAddClass = (className: string) => {
    const newClass: StudyClass = {
      id: `class-${Date.now()}`,
      name: className,
    };
    setClasses((prev) => [...prev, newClass]);
    setSelectedClassId(newClass.id);
    setMessages([]);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
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
          {/* Back button / Breadcrumb */}
          <Link href="/study">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-4 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>{breadcrumbTitle}</span>
            </button>
          </Link>

          {/* Two-column layout */}
          <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Left column - Class selection */}
            <div className="w-64 flex-shrink-0">
              <ClassSelectionSidebar
                classes={classes}
                selectedClassId={selectedClassId}
                onSelectClass={handleSelectClass}
                onAddClass={handleAddClass}
              />
            </div>

            {/* Right column - Chat */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                {messages.length === 0 ? (
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
                    {isLoading && (
                      <div className="flex gap-3 justify-start mb-4">
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
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <span
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <span
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                {/* Attached file preview */}
                {attachedFile && (
                  <div className="mb-3 flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#F3F0FF] rounded-lg border border-[#E8E0FF]">
                      <span className="text-sm font-medium text-gray-800">
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

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAttachClick}
                    className="flex-shrink-0 p-3 hover:bg-gray-100 rounded-xl transition-colors"
                    aria-label="Attach file"
                  >
                    <Paperclip className="h-5 w-5 text-gray-500" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.mp3,.wav,.mp4,.jpg,.jpeg,.png,.gif"
                  />

                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="What will you like to"
                    className="flex-1 bg-gray-50 rounded-full px-5 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:bg-white transition-all"
                    disabled={isLoading}
                  />

                  <button
                    className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-[#5A3FFF] to-[#300878] text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                    aria-label="Voice input"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
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
