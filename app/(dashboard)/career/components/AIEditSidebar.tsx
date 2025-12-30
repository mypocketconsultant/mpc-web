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
  onSend?: (message: string, mode?: 'chat' | 'edit', sectionName?: string) => void;
  onAttach?: () => void;
  onMicrophone?: () => void;
  placeholder?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onToggleExpanded?: (messageId: string) => void;
  resumeId?: string;
  currentExperience?: any[];
  currentSkills?: string[];
  currentEducations?: any[];
  targetRole?: string;
  onTargetRoleChange?: (role: string) => void;
  expandedEducationIndex?: number | null;
  expandedSectionIndex?: number | null;
  selectedEducationIndex?: number | null;
  onSelectedEducationIndexChange?: (index: number | null) => void;
  selectedExperienceIndex?: number | null;
  onSelectedExperienceIndexChange?: (index: number | null) => void;
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
  resumeId = "",
  currentExperience = [],
  currentSkills = [],
  currentEducations = [],
  targetRole = "",
  onTargetRoleChange,
  expandedEducationIndex,
  expandedSectionIndex,
  selectedEducationIndex,
  onSelectedEducationIndexChange,
  selectedExperienceIndex,
  onSelectedExperienceIndexChange,
}: AIEditSidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedResumeTitle, setSelectedResumeTitle] = useState<string>("");
  const [mode, setMode] = useState<'chat' | 'edit'>('chat');
  const [selectedSection, setSelectedSection] = useState<'experience' | 'skills' | 'education'>('experience');

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
      console.log("[AIEditSidebar] handleSend triggered");
      console.log("[AIEditSidebar] Current mode:", mode);
      console.log("[AIEditSidebar] Input value:", inputValue);
      console.log("[AIEditSidebar] Selected section:", selectedSection);
      console.log("[AIEditSidebar] Target role:", targetRole);
      console.log("[AIEditSidebar] Resume ID:", resumeId);

      if (mode === 'edit') {
        console.log("[AIEditSidebar] Sending EDIT request with:");
        console.log("[AIEditSidebar]   - message:", inputValue);
        console.log("[AIEditSidebar]   - mode: 'edit'");
        console.log("[AIEditSidebar]   - sectionName:", selectedSection);
        console.log("[AIEditSidebar]   - Will extract bullets from section:", selectedSection);
        onSend?.(inputValue, 'edit', selectedSection);
      } else {
        console.log("[AIEditSidebar] Sending CHAT request with:");
        console.log("[AIEditSidebar]   - message:", inputValue);
        console.log("[AIEditSidebar]   - mode: 'chat'");
        onSend?.(inputValue, 'chat');
      }
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

  const handleFileUpload = (file: File) => {
    onAttach?.();
    // You can also pass the file data here if needed
    console.log("File uploaded:", file);
  };


  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-[calc(100vh-14rem)] flex flex-col">
      {/* Header with Mode Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          {/* Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setMode('chat')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                mode === 'chat'
                  ? 'bg-white text-[#5A3FFF] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setMode('edit')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                mode === 'edit'
                  ? 'bg-white text-[#5A3FFF] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Edit
            </button>
          </div>
        </div>

        {/* Edit Mode Controls */}
        {mode === 'edit' && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {/* Target Role Input */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Target Role
              </label>
              <input
                type="text"
                placeholder="e.g., Senior Software Engineer"
                value={targetRole}
                onChange={(e) => onTargetRoleChange?.(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF]"
              />
            </div>

            {/* Section Selection */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Section to Edit
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value as 'experience' | 'skills' | 'education')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] appearance-none"
              >
                <option value="experience">Experience</option>
                <option value="skills">Skills</option>
                <option value="education">Education</option>
              </select>
            </div>

            {/* Item Selection (for experience and education) */}
            {(selectedSection === 'experience' || selectedSection === 'education') && (
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Select Item to Edit
                </label>
                <select
                  value={selectedSection === 'experience' ? (selectedExperienceIndex ?? 0) : (selectedEducationIndex ?? 0)}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    if (selectedSection === 'experience') {
                      onSelectedExperienceIndexChange?.(idx);
                    } else {
                      onSelectedEducationIndexChange?.(idx);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] appearance-none"
                >
                  {selectedSection === 'experience' && currentExperience.length > 0 ? (
                    currentExperience.map((exp, idx) => (
                      <option key={idx} value={idx}>
                        {exp.company || 'Untitled'} - {exp.role || 'No role'}
                      </option>
                    ))
                  ) : selectedSection === 'education' && currentEducations.length > 0 ? (
                    currentEducations.map((edu, idx) => (
                      <option key={idx} value={idx}>
                        {edu.nameOfSchool || 'Untitled'}
                      </option>
                    ))
                  ) : (
                    <option>No items available</option>
                  )}
                </select>
              </div>
            )}

            {/* Preview of current item */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Current Item
              </label>
              <div className="max-h-24 overflow-y-auto bg-white border border-gray-300 rounded p-2 text-xs text-gray-600 space-y-1">
                {selectedSection === 'experience' && currentExperience.length > 0 ? (
                  (() => {
                    const idx = selectedExperienceIndex ?? 0;
                    const exp = currentExperience[idx];
                    return exp ? (
                      <div className="space-y-0.5">
                        <div><strong>Company:</strong> {exp.company}</div>
                        <div><strong>Role:</strong> {exp.role}</div>
                        <div><strong>Location:</strong> {exp.location}</div>
                        <div><strong>Date:</strong> {exp.date}</div>
                      </div>
                    ) : null;
                  })()
                ) : selectedSection === 'skills' && currentSkills.length > 0 ? (
                  <div>• {currentSkills.join(', ')}</div>
                ) : selectedSection === 'education' && currentEducations.length > 0 ? (
                  (() => {
                    const idx = selectedEducationIndex ?? 0;
                    const edu = currentEducations[idx];
                    return edu ? (
                      <div className="space-y-0.5">
                        <div><strong>School:</strong> {edu.nameOfSchool}</div>
                        <div><strong>Field:</strong> {edu.fieldOfStudy}</div>
                        <div><strong>Certification:</strong> {edu.certification}</div>
                        <div><strong>Year:</strong> {edu.year}</div>
                      </div>
                    ) : null;
                  })()
                ) : (
                  <div className="text-gray-400 italic">No items in this section</div>
                )}
              </div>
            </div>
          </div>
        )}
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
        <div className="flex gap-2 items-center bg-white rounded-full border border-gray-200 px-2 py-2 hover:border-gray-300 transition-colors">
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