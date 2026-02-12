"use client";

import React, { useState, useRef } from "react";
import { Paperclip, Mic, Send, X } from "lucide-react";
import FileAttachment, {
  AttachedFile,
  getFileType,
  formatFileSize,
} from "./FileAttachment";

interface StudyChatInputProps {
  onSendMessage: (message: string, attachment?: AttachedFile) => void;
  onMicrophoneClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function StudyChatInput({
  onSendMessage,
  onMicrophoneClick,
  placeholder = "Ask me to modify a plan...",
  disabled = false,
  isLoading = false,
}: StudyChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const attachedFile: AttachedFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: formatFileSize(file.size),
        type: getFileType(file.name),
        url: URL.createObjectURL(file),
      };
      setAttachedFile(attachedFile);
    }
    // Reset file input
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

  const handleSend = () => {
    if ((!inputValue.trim() && !attachedFile) || disabled || isLoading) return;

    onSendMessage(inputValue.trim(), attachedFile || undefined);
    setInputValue("");
    handleRemoveFile();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const canSend = (inputValue.trim() || attachedFile) && !disabled && !isLoading;

  return (
    <div className="bg-white border-t border-gray-100 p-4">
      {/* Attached file preview */}
      {attachedFile && (
        <div className="mb-3">
          <FileAttachment
            file={attachedFile}
            variant="upload"
            onRemove={handleRemoveFile}
          />
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-3">
        {/* Attachment button */}
        <button
          onClick={handleAttachClick}
          disabled={disabled}
          className="flex-shrink-0 p-3 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5 text-gray-500" />
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.mp3,.wav,.mp4,.jpg,.jpeg,.png,.gif"
        />

        {/* Text input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="flex-1 bg-gray-50 rounded-full px-5 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:bg-white border border-transparent focus:border-[#5A3FFF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Microphone button */}
        <button
          onClick={onMicrophoneClick}
          disabled={disabled}
          className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-[#5A3FFF] to-[#300878] text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          aria-label="Voice input"
        >
          <Mic className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
