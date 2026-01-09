"use client";

import React, { useState } from "react";
import { Mic, Paperclip, FileText } from "lucide-react";
import FileUploadModal from "@/app/components/FileUploadModal";
import ResumePdfModal from "./ResumePdfModal";
import AnalysisMessageComponent from "./AnalysisMessageComponent";

interface Section {
  name: string;
  score: number;
  issues: string[];
  recommendations: string[];
}

interface AnalysisPlan {
  overall_score: number;
  summary: string;
  sections: Section[];
  [key: string]: any; // Allow for any additional fields from AI
}

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'resume' | 'loading';
  content: string;
  fullContent?: string;
  file?: {
    name: string;
    size: string;
  };
  resumeData?: {
    title: string;
    resumeId: string;
    pdfUrl: string;
  };
  analysisPlan?: AnalysisPlan; // Nested feedback structure from AI
  isExpanded?: boolean;
  isError?: boolean;
}

interface AIEditSidebarProps {
  title?: string;
  messages?: Message[];
  onSend?: (message: string, intent?: string) => void;
  onAttach?: () => void;
  onMicrophone?: () => void;
  placeholder?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onToggleExpanded?: (messageId: string) => void;
  onFileUpload?: (file: File) => Promise<void>;
  intent?: 'resume-builder' | 'career-advisor' | 'planner_create';
}

export default function AIEditSidebar({
  title = "Edit with Ai",
  messages = [],
  onSend,
  onAttach,
  onMicrophone,
  placeholder = "Ask me to modify a plan...",
  inputValue = "",
  onInputChange,
  onToggleExpanded,
  onFileUpload,
  intent,
}: AIEditSidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedResumeTitle, setSelectedResumeTitle] = useState<string>("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const handleResumeLinkClick = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    console.log("[handleResumeLinkClick] Called with message:", message);

    const resumeId = message.resumeData?.resumeId;
    const title = message.resumeData?.title || "Resume";

    if (!resumeId) {
      console.log("[handleResumeLinkClick] No resumeId found in message data");
      return;
    }

    console.log("[handleResumeLinkClick] Setting state with resumeId:", resumeId);
    setSelectedResumeId(resumeId);
    setSelectedResumeTitle(title);
    setIsPdfModalOpen(true);
    console.log("[handleResumeLinkClick] Modal should now be open");
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      console.log("[AIEditSidebar] handleSend triggered", { intent, message: inputValue });
      // Always pass intent prop to parent - don't rely on prop being undefined
      onSend?.(inputValue, intent);
      onInputChange?.("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachClick = () => {
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    console.log("[AIEditSidebar] File upload triggered:", file.name);
    if (onFileUpload) {
      setIsUploadingFile(true);
      try {
        await onFileUpload(file);
      } finally {
        setIsUploadingFile(false);
      }
    }
    onAttach?.();
  };


  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-[calc(100vh-14rem)] flex flex-col relative">
      {/* Upload Loading Overlay - only for uploading file */}
      {isUploadingFile && (
        <div className="absolute inset-0 bg-white/80 rounded-3xl flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#5A3FFF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-700">Uploading resume...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
      </div>

      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400 text-center">
              Start a conversation
            </p>
          </div>
        ) : (
          (() => {
            const renderedIndices = new Set<number>();
            return messages.map((message, index) => {
              // Skip if this message was already rendered as part of a group
              if (renderedIndices.has(index)) return null;

              // Check if this is a resume message followed by an assistant message
              const isResumeMessage = message.type === 'resume';
              const nextMessage = isResumeMessage && index + 1 < messages.length ? messages[index + 1] : null;
              const isFollowedByAssistant = nextMessage?.type === 'assistant';

              if (isResumeMessage && isFollowedByAssistant) {
                // Mark both as rendered
                renderedIndices.add(index);
                renderedIndices.add(index + 1);

                const analysisPlan = nextMessage.analysisPlan;

                // Render grouped message (resume + analysis together)
                const hasAnalysis = analysisPlan && analysisPlan.sections && analysisPlan.sections.length > 0;
                return (
                  <div key={message.id}>
                    <div className="flex justify-start mb-4">
                      <div className={`rounded-2xl p-5 max-w-[85%] space-y-4 ${
                        hasAnalysis
                          ? 'bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-100'
                          : 'bg-gray-50'
                      }`}>
                        {/* Resume PDF Link */}
                        <button
                          type="button"
                          onClick={(e) => {
                            console.log("[AIEditSidebar] Resume link clicked, full message data:", message);
                            handleResumeLinkClick(e, message);
                          }}
                          className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-3 hover:bg-gray-50 transition-colors cursor-pointer w-fit"
                        >
                          <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            <FileText className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="text-sm font-semibold text-[#5A3FFF] underline">
                            {message.resumeData?.title}
                          </span>
                        </button>

                        {/* Main AI Message - Check for Analysis Plan */}
                        {analysisPlan && analysisPlan.sections && analysisPlan.sections.length > 0 ? (
                          <AnalysisMessageComponent
                            content={nextMessage.content}
                            analysisPlan={analysisPlan}
                            isExpanded={nextMessage.isExpanded || false}
                            onToggleExpanded={() => onToggleExpanded?.(nextMessage.id)}
                          />
                        ) : (
                          <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                            {nextMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Regular message rendering (user, standalone assistant, standalone resume, loading, or error)
              return (
                <div key={message.id}>
                  {message.type === 'user' ? (
                    /* User Message Bubble */
                    <div className="flex justify-end mb-4">
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 max-w-[85%]">
                        <p className="text-sm text-gray-700 text-right mb-3">
                          {message.content}
                        </p>
                        {message.file && (
                          <div className="flex items-center justify-between gap-3 mt-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                <FileText className="w-3.5 h-3.5 text-blue-600" />
                              </div>
                              <span className="text-sm font-semibold text-[#5A3FFF]">
                                {message.file.name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {message.file.size}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : message.type === 'resume' ? (
                    /* Standalone Resume Message Bubble */
                    <div className="flex justify-end mb-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          console.log("[AIEditSidebar] Standalone resume clicked, full message data:", message);
                          handleResumeLinkClick(e, message);
                        }}
                        className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-2xl p-4 max-w-[85%] hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-[#5A3FFF] underline">
                          {message.resumeData?.title}
                        </span>
                      </button>
                    </div>
                  ) : message.type === 'loading' ? (
                    /* Loading Bubble */
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-50 rounded-2xl p-5 max-w-[85%]">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-sm text-gray-600">AI is responding...</span>
                        </div>
                      </div>
                    </div>
                  ) : message.isError ? (
                    /* Error Message Bubble */
                    <div className="flex justify-start mb-4">
                      <div className="bg-red-50 rounded-2xl p-5 max-w-[85%] border border-red-200">
                        <p className="text-sm text-red-700">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Assistant Message Bubble */
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-50 rounded-2xl p-5 max-w-[85%]">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        {message.fullContent && message.fullContent.length > 200 && !message.isExpanded && (
                          <button
                            onClick={() => onToggleExpanded?.(message.id)}
                            className="text-[#5A3FFF] text-xs font-semibold mt-3 hover:underline cursor-pointer transition-colors"
                          >
                            See more
                          </button>
                        )}
                        {message.isExpanded && message.fullContent && message.fullContent.length > 200 && (
                          <button
                            onClick={() => onToggleExpanded?.(message.id)}
                            className="text-[#5A3FFF] text-xs font-semibold mt-3 hover:underline cursor-pointer transition-colors"
                          >
                            See less
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })()
        )}
      </div>

      {/* Chat Input - Fixed at Bottom */}
      <div className="pt-4 border-t border-gray-100 flex-shrink-0">
        <div className="flex gap-2 items-center bg-white rounded-full border border-gray-200 px-2 py-2 transition-colors hover:border-gray-300">
          <button
            onClick={handleAttachClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5 text-gray-600 rotate-45" />
          </button>

          <input
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => onInputChange?.(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none placeholder:text-gray-400"
          />

          <button
            onClick={onMicrophone}
            className="p-2.5 rounded-full flex-shrink-0 flex items-center justify-center transition-all hover:opacity-90 hover:shadow-md"
            style={{ backgroundColor: "#5A3FFF" }}
            aria-label="Voice input"
          >
            <Mic className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleFileUpload}
      />

      {/* Resume PDF Modal */}
      <ResumePdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        resumeId={selectedResumeId}
        resumeTitle={selectedResumeTitle}
      />
    </div>
  );
}