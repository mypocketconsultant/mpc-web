"use client";

import React from "react";
import {
  MessageAttachment,
  DownloadableFile,
  AttachedFile,
} from "./FileAttachment";

export interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  attachment?: AttachedFile;
  downloadableFile?: AttachedFile;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.type === "ai";

  return (
    <div
      className={`flex gap-3 ${isAI ? "justify-start" : "justify-end"} mb-4`}
    >
      {isAI && (
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
      )}

      <div
        className={`max-w-[80%] ${
          isAI
            ? "bg-white border border-gray-200 rounded-2xl rounded-tl-md"
            : "bg-gradient-to-br from-[#E8E0FF] to-[#F3F0FF] rounded-2xl rounded-tr-md"
        } px-4 py-3 shadow-sm`}
      >
        {/* Message content */}
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* User message attachment */}
        {!isAI && message.attachment && (
          <MessageAttachment file={message.attachment} />
        )}

        {/* AI message downloadable file */}
        {isAI && message.downloadableFile && (
          <DownloadableFile file={message.downloadableFile} />
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-gray-400 mt-2 block">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {!isAI && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
