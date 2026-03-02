"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Plus, MessageSquare, Trash2, Edit3, Check } from "lucide-react";
import { apiService } from "@/lib/api/apiService";

interface ChatSession {
  id: string;
  title: string;
  module: string;
  message_count: number;
  last_message_at: string;
  created_at: string;
}

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  module: string;
  currentSessionId?: string;
}

export default function ChatHistoryDrawer({
  isOpen,
  onClose,
  onSelectSession,
  onNewChat,
  module,
  currentSessionId,
}: ChatHistoryDrawerProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `/v1/chat-sessions?module=${module}&limit=50&offset=0`;
      console.log("[ChatHistory] Fetching sessions from:", url);

      const response = await apiService.get<{
        status: string;
        data: {
          items: ChatSession[];
          total: number;
        };
      }>(url);

      console.log("[ChatHistory] Raw API response:", response);
      console.log("[ChatHistory] response.data:", response?.data);
      console.log("[ChatHistory] response.data.items:", response?.data?.items);
      console.log("[ChatHistory] items count:", response?.data?.items?.length ?? "undefined");

      setSessions(response?.data?.items || []);
    } catch (error) {
      console.error("[ChatHistory] Failed to fetch sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [module]);

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen, fetchSessions]);

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.delete(`/v1/chat-sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleRename = async (sessionId: string) => {
    if (!editTitle.trim()) return;
    try {
      await apiService.patch(`/v1/chat-sessions/${sessionId}`, {
        title: editTitle.trim(),
      });
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, title: editTitle.trim() } : s
        )
      );
      setEditingId(null);
      setEditTitle("");
    } catch (error) {
      console.error("Failed to rename session:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[340px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{module.charAt(0).toUpperCase() + module.slice(1)} Chat History</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-5 py-3 border-b border-gray-100">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#5A3FFF] rounded-lg hover:bg-[#4A2FEF] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Loading...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No previous conversations
            </div>
          ) : (
            <div className="py-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group flex items-start gap-3 px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    currentSessionId === session.id
                      ? "bg-[#F0EDFF] border-r-2 border-[#5A3FFF]"
                      : ""
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    {editingId === session.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(session.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 text-sm border border-gray-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#5A3FFF]"
                          autoFocus
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(session.id);
                          }}
                          className="p-0.5 text-green-600 hover:text-green-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.title}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">
                        {formatDate(session.last_message_at || session.created_at)}
                      </span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">
                        {session.message_count} msgs
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(session.id);
                        setEditTitle(session.title);
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
