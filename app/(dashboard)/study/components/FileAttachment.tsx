"use client";

import React from "react";
import { FileText, Download, Music, Video, Image, File, X } from "lucide-react";

export interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: "document" | "audio" | "video" | "image" | "other";
  url?: string;
}

interface FileAttachmentProps {
  file: AttachedFile;
  variant?: "upload" | "download" | "preview";
  onRemove?: () => void;
  onDownload?: () => void;
}

const fileTypeIcons = {
  document: FileText,
  audio: Music,
  video: Video,
  image: Image,
  other: File,
};

const fileTypeColors = {
  document: "bg-blue-100 text-blue-600",
  audio: "bg-purple-100 text-purple-600",
  video: "bg-red-100 text-red-600",
  image: "bg-green-100 text-green-600",
  other: "bg-gray-100 text-gray-600",
};

export function getFileType(fileName: string): AttachedFile["type"] {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  const documentExtensions = ["pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx"];
  const audioExtensions = ["mp3", "wav", "ogg", "m4a", "flac", "aac"];
  const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm"];
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];

  if (documentExtensions.includes(extension)) return "document";
  if (audioExtensions.includes(extension)) return "audio";
  if (videoExtensions.includes(extension)) return "video";
  if (imageExtensions.includes(extension)) return "image";
  return "other";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
}

export default function FileAttachment({
  file,
  variant = "preview",
  onRemove,
  onDownload,
}: FileAttachmentProps) {
  const IconComponent = fileTypeIcons[file.type];
  const colorClasses = fileTypeColors[file.type];

  // Upload variant - shown when user is attaching a file
  if (variant === "upload") {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 bg-[#F3F0FF] rounded-lg border border-[#E8E0FF]">
        <div className={`w-8 h-8 rounded-lg ${colorClasses} flex items-center justify-center`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
            {file.name}
          </span>
          <span className="text-xs text-gray-500">{file.size}</span>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors ml-1"
            aria-label="Remove file"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        )}
      </div>
    );
  }

  // Download variant - shown in AI responses
  if (variant === "download") {
    return (
      <div
        onClick={onDownload}
        className="inline-flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-[#5A3FFF] hover:shadow-sm transition-all group"
      >
        <div className={`w-10 h-10 rounded-lg ${colorClasses} flex items-center justify-center`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 group-hover:text-[#5A3FFF] transition-colors">
            {file.name}
          </span>
          <span className="text-xs text-gray-500">{file.size}</span>
        </div>
        <div className="ml-2 p-2 rounded-lg bg-[#F3F0FF] text-[#5A3FFF] group-hover:bg-[#5A3FFF] group-hover:text-white transition-all">
          <Download className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Preview variant - default compact view
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
      <div className={`w-6 h-6 rounded ${colorClasses} flex items-center justify-center`}>
        <IconComponent className="w-3.5 h-3.5" />
      </div>
      <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">
        {file.name}
      </span>
      <span className="text-xs text-gray-400">{file.size}</span>
    </div>
  );
}

// Component for message with attachment (user message)
interface MessageAttachmentProps {
  file: AttachedFile;
}

export function MessageAttachment({ file }: MessageAttachmentProps) {
  const IconComponent = fileTypeIcons[file.type];
  const colorClasses = fileTypeColors[file.type];

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-lg border border-[#E8E0FF] mt-2">
      <div className={`w-7 h-7 rounded-lg ${colorClasses} flex items-center justify-center`}>
        <IconComponent className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-[#5A3FFF]">{file.name}</span>
        <span className="text-[10px] text-gray-500">{file.size}</span>
      </div>
    </div>
  );
}

// Component for downloadable file in AI response
interface DownloadableFileProps {
  file: AttachedFile;
  onDownload?: () => void;
}

export function DownloadableFile({ file, onDownload }: DownloadableFileProps) {
  const handleDownload = () => {
    if (file.url) {
      window.open(file.url, "_blank");
    }
    onDownload?.();
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 text-sm text-[#5A3FFF] hover:underline mt-2"
    >
      {file.name}
      <Download className="w-4 h-4" />
    </button>
  );
}
