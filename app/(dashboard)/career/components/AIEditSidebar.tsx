"use client";

import React, { useState, useRef, useCallback } from "react";
import { Mic, Paperclip, FileText, Send, Loader2 } from "lucide-react";
import FormattedMessage from "@/components/FormattedMessage";
import FileUploadModal from "@/app/components/FileUploadModal";
import ResumePdfModal from "./ResumePdfModal";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface Section {
  name: string;
  score: number;
  issues: string[];
  recommendations: string[];
}

interface AnalysisPlan {
  overall_score?: number;
  summary?: string;
  target_role?: string;
  sections: Section[];
  [key: string]: any; // Allow for any additional fields from AI
}

interface Message {
  id: string;
  type: "user" | "assistant" | "resume" | "loading";
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
  intent?: "resume-builder" | "career-advisor" | "planner_create";
  emptyStateMessage?: string;
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
  onToggleExpanded: _onToggleExpanded,
  onFileUpload,
  intent,
  emptyStateMessage = "Start a conversation",
}: AIEditSidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedResumeTitle, setSelectedResumeTitle] = useState<string>("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const { isRecording, isTranscribing, toggleRecording } = useVoiceInput();

  const handleResumeLinkClick = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();

    const resumeId = message.resumeData?.resumeId;
    const title = message.resumeData?.title || "Resume";

    if (!resumeId) {
      return;
    }

    setSelectedResumeId(resumeId);
    setSelectedResumeTitle(title);
    setIsPdfModalOpen(true);
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, []);

  const handleSend = () => {
    if (inputValue.trim()) {
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

  const handleMicrophoneClick = () => {
    toggleRecording((text) => {
      onInputChange?.(text);
    });
    onMicrophone?.();
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100 h-[60vh] lg:h-[calc(100vh-14rem)] flex flex-col relative">
      {/* Upload Loading Overlay - only for uploading file */}
      {isUploadingFile && (
        <div className="absolute inset-0 bg-white/80 rounded-2xl sm:rounded-3xl flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#5A3FFF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs sm:text-sm font-medium text-gray-700">
              Uploading resume...
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-3 sm:mb-4 md:mb-6">
        <h3 className="font-bold text-gray-900 text-base sm:text-lg">{title}</h3>
      </div>

      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4 md:mb-6 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400 text-center">
              {emptyStateMessage}
            </p>
          </div>
        ) : (
          (() => {
            const renderedIndices = new Set<number>();
            return messages.map((message, index) => {
              // Skip if this message was already rendered as part of a group
              if (renderedIndices.has(index)) return null;

              // Check if this is a resume message followed by an assistant message
              const isResumeMessage = message.type === "resume";
              const nextMessage =
                isResumeMessage && index + 1 < messages.length
                  ? messages[index + 1]
                  : null;
              const isFollowedByAssistant = nextMessage?.type === "assistant";

              if (isResumeMessage && isFollowedByAssistant) {
                // Mark both as rendered
                renderedIndices.add(index);
                renderedIndices.add(index + 1);

                const analysisPlan = nextMessage.analysisPlan;
                const hasAnalysis = !!analysisPlan;

                return (
                  <div key={message.id}>
                    <div className="flex justify-start mb-4">
                      <div
                        className={`rounded-xl sm:rounded-2xl p-3 sm:p-5 max-w-[90%] sm:max-w-[85%] space-y-3 sm:space-y-4 ${
                          hasAnalysis
                            ? "bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-100"
                            : "bg-gray-50"
                        }`}
                      >
                        {/* Resume PDF Link */}
                        <button
                          type="button"
                          onClick={(e) => {
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

                        {/* Main AI Message Content */}
                        <FormattedMessage content={nextMessage.content} variant="light" />

                        {/* If analysisPlan exists, show it */}
                        {analysisPlan && (
                          <div className="mt-4 space-y-3">
                            {/* Target Role */}
                            {analysisPlan.target_role && (
                              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                                <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                                  Target Role:{" "}
                                </span>
                                <span className="text-sm font-medium text-purple-800">
                                  {analysisPlan.target_role}
                                </span>
                              </div>
                            )}

                            {/* Sections */}
                            {analysisPlan.sections &&
                              analysisPlan.sections.map(
                                (section: Section, idx: number) => (
                                  <div
                                    key={idx}
                                    className="bg-white rounded-lg p-4 border border-blue-100"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="text-sm font-bold text-gray-900">
                                        {section.name}
                                      </h4>
                                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                                        {section.score}/10
                                      </span>
                                    </div>

                                    {/* Issues */}
                                    {section.issues &&
                                      section.issues.length > 0 && (
                                        <div className="mb-2">
                                          <p className="text-xs font-semibold text-red-700 mb-1 uppercase">
                                            Issues
                                          </p>
                                          <ul className="space-y-1">
                                            {section.issues.map(
                                              (issue: string, i: number) => (
                                                <li
                                                  key={i}
                                                  className="text-xs text-gray-700 flex gap-2"
                                                >
                                                  <span className="text-red-500">
                                                    •
                                                  </span>
                                                  <span>{issue}</span>
                                                </li>
                                              ),
                                            )}
                                          </ul>
                                        </div>
                                      )}

                                    {/* Recommendations */}
                                    {section.recommendations &&
                                      section.recommendations.length > 0 && (
                                        <div>
                                          <p className="text-xs font-semibold text-green-700 mb-1 uppercase">
                                            Recommendations
                                          </p>
                                          <ul className="space-y-1">
                                            {section.recommendations.map(
                                              (rec: string, i: number) => (
                                                <li
                                                  key={i}
                                                  className="text-xs text-gray-700 flex gap-2"
                                                >
                                                  <span className="text-green-600">
                                                    ✓
                                                  </span>
                                                  <span>{rec}</span>
                                                </li>
                                              ),
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                  </div>
                                ),
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Regular message rendering (user, standalone assistant, standalone resume, loading, or error)
              return (
                <div key={message.id}>
                  {message.type === "user" ? (
                    /* User Message Bubble */
                    <div className="flex justify-end mb-4">
                      <div className="bg-gradient-to-br from-[#5A3FFF] to-[#7B61FF] rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-shadow p-3 sm:p-5 max-w-[90%] sm:max-w-[85%]">
                        <div className="text-right mb-3">
                          <FormattedMessage content={message.content} variant="dark" />
                        </div>
                        {message.file && (
                          <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-white/20">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center flex-shrink-0">
                                <FileText className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="text-sm font-semibold text-white">
                                {message.file.name}
                              </span>
                            </div>
                            <span className="text-xs text-white/80">
                              {message.file.size}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : message.type === "resume" ? (
                    /* Standalone Resume Message Bubble */
                    <div className="flex justify-end mb-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          handleResumeLinkClick(e, message);
                        }}
                        className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 max-w-[90%] sm:max-w-[85%] hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-[#5A3FFF] underline">
                          {message.resumeData?.title}
                        </span>
                      </button>
                    </div>
                  ) : message.type === "loading" ? (
                    /* Thinking Bubble */
                    <div className="flex justify-start mb-4">
                      <div className="bg-gradient-to-br from-[#F8F7FF] to-[#FEFEFF] rounded-xl sm:rounded-2xl p-3 sm:p-5 max-w-[90%] sm:max-w-[85%] shadow-sm border border-[#E8E4FF]">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 bg-[#5A3FFF] rounded-full animate-pulse"
                              style={{ animationDuration: "1.4s", animationDelay: "0s" }}
                            />
                            <div
                              className="w-2 h-2 bg-[#7B61FF] rounded-full animate-pulse"
                              style={{ animationDuration: "1.4s", animationDelay: "0.2s" }}
                            />
                            <div
                              className="w-2 h-2 bg-[#9B7FFF] rounded-full animate-pulse"
                              style={{ animationDuration: "1.4s", animationDelay: "0.4s" }}
                            />
                          </div>
                          <span className="text-sm font-medium text-[#5A3FFF] animate-pulse">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : message.isError ? (
                    /* Error Message Bubble */
                    <div className="flex justify-start mb-4">
                      <div className="bg-red-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 max-w-[90%] sm:max-w-[85%] border border-red-200">
                        <p className="text-sm text-red-700">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Assistant Message Bubble */
                    <div className="flex justify-start mb-4">
                      <div
                        className={`rounded-xl sm:rounded-2xl p-3 sm:p-5 max-w-[90%] sm:max-w-[85%] shadow-sm hover:shadow-lg transition-shadow ${
                          message.analysisPlan
                            ? "bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-100"
                            : "bg-gradient-to-br from-white to-[#FEFEFF] border border-[#E8E4FF]"
                        }`}
                      >
                        {/* Always show content */}
                        <FormattedMessage content={message.content} variant="light" />

                        {/* If analysisPlan exists, show it */}
                        {message.analysisPlan && (
                          <div className="mt-4 space-y-3">
                            {/* Target Role */}
                            {message.analysisPlan.target_role && (
                              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                                <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                                  Target Role:{" "}
                                </span>
                                <span className="text-sm font-medium text-purple-800">
                                  {message.analysisPlan.target_role}
                                </span>
                              </div>
                            )}

                            {/* Sections */}
                            {message.analysisPlan.sections &&
                              message.analysisPlan.sections.map(
                                (section: Section, idx: number) => (
                                  <div
                                    key={idx}
                                    className="bg-white rounded-lg p-4 border border-blue-100"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="text-sm font-bold text-gray-900">
                                        {section.name}
                                      </h4>
                                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                                        {section.score}/10
                                      </span>
                                    </div>

                                    {/* Issues */}
                                    {section.issues &&
                                      section.issues.length > 0 && (
                                        <div className="mb-2">
                                          <p className="text-xs font-semibold text-red-700 mb-1 uppercase">
                                            Issues
                                          </p>
                                          <ul className="space-y-1">
                                            {section.issues.map(
                                              (issue: string, i: number) => (
                                                <li
                                                  key={i}
                                                  className="text-xs text-gray-700 flex gap-2"
                                                >
                                                  <span className="text-red-500">
                                                    •
                                                  </span>
                                                  <span>{issue}</span>
                                                </li>
                                              ),
                                            )}
                                          </ul>
                                        </div>
                                      )}

                                    {/* Recommendations */}
                                    {section.recommendations &&
                                      section.recommendations.length > 0 && (
                                        <div>
                                          <p className="text-xs font-semibold text-green-700 mb-1 uppercase">
                                            Recommendations
                                          </p>
                                          <ul className="space-y-1">
                                            {section.recommendations.map(
                                              (rec: string, i: number) => (
                                                <li
                                                  key={i}
                                                  className="text-xs text-gray-700 flex gap-2"
                                                >
                                                  <span className="text-green-600">
                                                    ✓
                                                  </span>
                                                  <span>{rec}</span>
                                                </li>
                                              ),
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                  </div>
                                ),
                              )}
                          </div>
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
      <div className="pt-2 sm:pt-3 md:pt-4 border-t border-gray-100 flex-shrink-0">
        <div className="flex gap-1.5 sm:gap-2 items-end bg-white rounded-2xl border border-gray-200 px-1.5 sm:px-2 py-1.5 sm:py-2 transition-colors hover:border-gray-300">
          {onFileUpload && (
            <button
              onClick={handleAttachClick}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 mb-0.5"
              aria-label="Attach file"
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 rotate-45" />
            </button>
          )}

          <textarea
            ref={textareaRef}
            rows={1}
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => {
              onInputChange?.(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyPress}
            className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-transparent focus:outline-none placeholder:text-gray-400 resize-none overflow-hidden max-h-[120px]"
          />

          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full text-white transition-all flex items-center justify-center ${
              inputValue.trim()
                ? "bg-[#5A3FFF] hover:bg-[#4A2FEF] hover:shadow-md active:scale-95"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={handleMicrophoneClick}
            disabled={isTranscribing}
            className={`flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center transition-all hover:opacity-90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording ? "animate-pulse" : ""
            }`}
            style={{
              backgroundColor: isRecording
                ? "#EF4444"
                : isTranscribing
                  ? "#B0A0FF"
                  : "#5A3FFF",
            }}
            aria-label="Voice input"
          >
            {isTranscribing ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-spin" />
            ) : (
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            )}
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
