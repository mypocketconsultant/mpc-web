"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Edit2,
  Trash2,
  MoreVertical,
  Plus,
  X,
  FileText,
  Loader2,
} from "lucide-react";
import Header from "@/app/components/header";
import InputFooter from "@/app/components/InputFooter";
import { Toast } from "@/components/Toast";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/useToast";
import {
  createCanvas,
  getCanvas,
  patchCanvas,
  publishCanvas,
} from "./canvasApi";

interface BlockData {
  title: string;
  content: string;
  color: string;
  colSpan?: number;
}

type BlocksMap = Record<string, BlockData>;

interface CanvasBlock {
  id: string;
  title: string;
  content: string;
  placeholder: string;
  color: string;
  colSpan?: number;
}

const DEFAULT_BLOCKS: CanvasBlock[] = [
  { id: "cs", title: "Customer Segments", content: "", placeholder: "Who are you serving?", color: "bg-indigo-100", colSpan: 1 },
  { id: "vp", title: "Value Propositions", content: "", placeholder: "What problem are you solving?", color: "bg-yellow-200", colSpan: 2 },
  { id: "ch", title: "Channels", content: "", placeholder: "How do they reach you?", color: "bg-yellow-400", colSpan: 1 },
  { id: "rs", title: "Revenue Streams", content: "", placeholder: "How do you make money?", color: "bg-green-100", colSpan: 1 },
  { id: "cr", title: "Customer Relationships", content: "", placeholder: "What support or loyalty model?", color: "bg-indigo-100", colSpan: 1 },
  { id: "kr", title: "Key Resources", content: "", placeholder: "What assets do you need?", color: "bg-green-100", colSpan: 1 },
  { id: "ka", title: "Key Activities", content: "", placeholder: "Core actions to deliver the value", color: "bg-indigo-100", colSpan: 1 },
  { id: "kp", title: "Key Partnerships", content: "", placeholder: "Who helps you?", color: "bg-yellow-200", colSpan: 2 },
  { id: "cs2", title: "Cost Structure", content: "", placeholder: "Main expenses (staff, cloud, marketing, logistics)", color: "bg-indigo-100", colSpan: 1 },
];

function blocksMapToArray(blocksMap: BlocksMap): CanvasBlock[] {
  const placeholderMap: Record<string, string> = Object.fromEntries(
    DEFAULT_BLOCKS.map((b) => [b.id, b.placeholder])
  );
  return Object.entries(blocksMap).map(([id, data]) => ({
    id,
    title: data.title,
    content: data.content,
    color: data.color,
    colSpan: data.colSpan,
    placeholder: placeholderMap[id] ?? "Add notes...",
  }));
}

function blocksArrayToMap(blocks: CanvasBlock[]): BlocksMap {
  return Object.fromEntries(
    blocks.map(({ id, title, content, color, colSpan }) => [
      id,
      { title, content, color, ...(colSpan !== undefined ? { colSpan } : {}) },
    ])
  );
}

function AddCardModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (block: CanvasBlock) => void;
}) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("bg-indigo-100");

  const COLORS = [
    { label: "Indigo", value: "bg-indigo-100" },
    { label: "Yellow", value: "bg-yellow-200" },
    { label: "Gold", value: "bg-yellow-400" },
    { label: "Green", value: "bg-green-100" },
    { label: "Purple", value: "bg-purple-100" },
    { label: "Pink", value: "bg-pink-100" },
  ];

  const handleSubmit = () => {
    if (!title.trim()) return;
    const id = `custom_${Date.now()}`;
    onAdd({
      id,
      title: title.trim(),
      content: "",
      placeholder: "Add notes...",
      color,
      colSpan: 1,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Add Card</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Card Title
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#5A3FFF] transition-colors"
              placeholder="e.g. Risk Factors"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 rounded-full ${c.value} border-2 transition-all ${
                    color === c.value
                      ? "border-[#5A3FFF] scale-110"
                      : "border-transparent"
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="flex-1 bg-[#5A3FFF] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#4930e8] disabled:opacity-50 transition-colors"
          >
            Add Card
          </button>
        </div>
      </div>
    </div>
  );
}

function CanvasPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const { toast, showToast, hideToast } = useToast();

  // Core canvas state
  const [canvasId, setCanvasId] = useState<string | null>(null);
  const [canvasStatus, setCanvasStatus] = useState<"draft" | "published">("draft");
  const [documentTitle, setDocumentTitle] = useState("");
  const [blocks, setBlocks] = useState<CanvasBlock[]>(DEFAULT_BLOCKS);

  // Loading states
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // UI states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  // Refs
  const menuRef = useRef<HTMLDivElement>(null);
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const blocksRef = useRef(blocks);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // Initialization
  useEffect(() => {
    if (userLoading || !user) return;

    const idFromUrl = searchParams.get("canvas_id");
    const isNew = searchParams.get("new") === "1";

    async function init() {
      setIsInitializing(true);
      try {
        if (!isNew && idFromUrl) {
          // Load existing canvas
          const canvas = await getCanvas(idFromUrl);
          setCanvasId(canvas.id);
          setDocumentTitle(canvas.title ?? "");
          setCanvasStatus(canvas.status);
          if (canvas.blocks && Object.keys(canvas.blocks).length > 0) {
            setBlocks(blocksMapToArray(canvas.blocks));
          }
          sessionStorage.setItem("currentCanvasId", canvas.id);
        } else if (!isNew && sessionStorage.getItem("currentCanvasId")) {
          // Returning to canvas (e.g., from chat)
          const savedId = sessionStorage.getItem("currentCanvasId")!;
          try {
            const canvas = await getCanvas(savedId);
            setCanvasId(canvas.id);
            setDocumentTitle(canvas.title ?? "");
            setCanvasStatus(canvas.status);
            if (canvas.blocks && Object.keys(canvas.blocks).length > 0) {
              setBlocks(blocksMapToArray(canvas.blocks));
            }
            window.history.replaceState(null, "", `/business-consultancy/canvas?canvas_id=${savedId}`);
          } catch {
            // Saved ID invalid, create new
            sessionStorage.removeItem("currentCanvasId");
            const canvas = await createCanvas("");
            setCanvasId(canvas.id);
            sessionStorage.setItem("currentCanvasId", canvas.id);
            window.history.replaceState(null, "", `/business-consultancy/canvas?canvas_id=${canvas.id}`);
          }
        } else {
          // Create new canvas
          const canvas = await createCanvas("");
          setCanvasId(canvas.id);
          setCanvasStatus("draft");
          setBlocks(DEFAULT_BLOCKS);
          sessionStorage.setItem("currentCanvasId", canvas.id);
          window.history.replaceState(null, "", `/business-consultancy/canvas?canvas_id=${canvas.id}`);
        }
      } catch (err) {
        showToast("error", "Failed to load canvas. Please try again.");
      } finally {
        setIsInitializing(false);
      }
    }

    init();
  }, [user, userLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save function
  const saveCanvas = useCallback(
    async (updates: { title?: string; blocks?: CanvasBlock[] }) => {
      if (!canvasId) return;
      setIsSaving(true);
      try {
        const payload: Record<string, unknown> = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.blocks !== undefined) payload.blocks = blocksArrayToMap(updates.blocks);
        await patchCanvas(canvasId, payload);
      } catch {
        showToast("error", "Failed to save. Please try again.");
      } finally {
        setIsSaving(false);
      }
    },
    [canvasId, showToast]
  );

  // Block handlers
  const handleBlockContentChange = (blockId: string, newContent: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, content: newContent } : b))
    );
  };

  const handleBlockBlur = () => {
    saveCanvas({ blocks: blocksRef.current });
  };

  const handleDeleteBlock = (blockId: string) => {
    const previous = [...blocks];
    const updated = blocks.filter((b) => b.id !== blockId);
    setBlocks(updated);
    saveCanvas({ blocks: updated });
    showToast("success", "Card removed.", {
      label: "Undo",
      onClick: () => {
        setBlocks(previous);
        saveCanvas({ blocks: previous });
        hideToast();
      },
    });
  };

  const handleAddCard = (newBlock: CanvasBlock) => {
    const updated = [...blocks, newBlock];
    setBlocks(updated);
    saveCanvas({ blocks: updated });
    setIsAddCardOpen(false);
  };

  // Publish handler
  const handlePublish = async () => {
    if (!canvasId || isPublishing) return;
    if (canvasStatus === "published") {
      showToast("success", "This canvas is already published.");
      return;
    }
    setIsPublishing(true);
    try {
      await patchCanvas(canvasId, {
        title: documentTitle,
        blocks: blocksArrayToMap(blocks),
      });
      const updated = await publishCanvas(canvasId);
      setCanvasStatus(updated.status ?? "published");
      showToast("success", "Canvas published successfully!");
    } catch {
      showToast("error", "Failed to publish. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Click-outside handler for menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNewCanvas = () => {
    setIsMenuOpen(false);
    sessionStorage.removeItem("currentCanvasId");
    router.push("/business-consultancy/canvas?new=1");
  };

  const handleSavedCanvases = () => {
    setIsMenuOpen(false);
    router.push("/business-consultancy/resources");
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] md:bg-white text-gray-800">
      <Header title="Business Consultancy" />

      <main className="relative flex-1 flex flex-col overflow-auto max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8">
        {/* Loading overlay */}
        {isInitializing && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-[#4A247c] animate-spin" />
              <p className="text-sm text-gray-500">Loading canvas...</p>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/business-consultancy">
            <button className="flex items-center hover:text-gray-900 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Business Consultancy</span>
            </button>
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">Business Canvas</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">{documentTitle || "New Document"}</span>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePublish}
              disabled={isPublishing || canvasStatus === "published"}
              className={`bg-gradient-to-r from-[#4A247c] to-[#2E154E] hover:from-[#3A1C62] hover:to-[#220F3A] text-white px-6 py-2 rounded-xl text-sm font-medium transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {isPublishing && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPublishing ? "Publishing..." : canvasStatus === "published" ? "Published" : "Publish"}
            </button>
            {isSaving && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            )}
          </div>

          {/* Three-dot menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-indigo-900"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[180px]">
                <button
                  onClick={handleNewCanvas}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Canvas
                </button>
                <button
                  onClick={handleSavedCanvases}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Saved Canvases
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Add document title"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            onBlur={() => saveCanvas({ title: documentTitle })}
            className="w-full text-2xl font-light text-gray-400 placeholder:text-gray-300 border-none outline-none bg-transparent"
          />
          <div className="w-full h-[1px] bg-gray-100 mt-2" />
        </div>

        {/* Canvas Grid */}
        <div className="flex-1 overflow-auto pb-8">
          <div className="grid grid-cols-4 gap-4 auto-rows-min pb-4 max-w-[1100px] mx-auto">
            {blocks.map((block) => (
              <div
                key={block.id}
                className="bg-white rounded-2xl flex flex-col shadow-sm border border-gray-100 overflow-hidden min-h-[140px]"
                style={{ gridColumn: `span ${block.colSpan || 1}` }}
              >
                {/* Card Header */}
                <div className={`flex justify-between items-center px-4 py-2 ${block.color}`}>
                  <h3 className="text-xs font-bold text-indigo-900 mx-auto w-full text-center pl-8">
                    {block.title}
                  </h3>
                  <div className="flex items-center gap-1 opacity-60 text-indigo-900">
                    <button
                      className="p-1 hover:bg-white/20 rounded-md"
                      onClick={() => textareaRefs.current[block.id]?.focus()}
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      className="p-1 hover:bg-white/20 rounded-md"
                      onClick={() => handleDeleteBlock(block.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex-1 p-4">
                  <textarea
                    ref={(el) => {
                      textareaRefs.current[block.id] = el;
                    }}
                    placeholder={block.placeholder}
                    value={block.content}
                    onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                    onBlur={handleBlockBlur}
                    className="w-full h-full min-h-[80px] text-xs text-gray-700 placeholder:text-gray-300 bg-transparent border-none outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            ))}

            {/* Add Card Button */}
            <button
              onClick={() => setIsAddCardOpen(true)}
              className="col-span-1 bg-gray-100/80 hover:bg-gray-200 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 transition-colors min-h-[140px]"
            >
              <div className="h-10 w-10 rounded-full border border-gray-300 flex items-center justify-center mb-2 bg-white">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Add Card</span>
            </button>
          </div>
        </div>
      </main>

      {/* Input Footer */}
      <div className="bg-white border-t border-gray-100 pb-safe">
        <InputFooter
          placeholder="Ask me to suggest a business name.."
          onSend={(msg) => {
            const params = new URLSearchParams({ context: "business-consultancy" });
            if (canvasId) params.set("canvas_id", canvasId);
            params.set("prompt", msg);
            router.push(`/business-consultancy/chat?${params.toString()}`);
          }}
          context="business-consultancy"
        />
      </div>

      {/* Add Card Modal */}
      {isAddCardOpen && (
        <AddCardModal
          onClose={() => setIsAddCardOpen(false)}
          onAdd={handleAddCard}
        />
      )}

      {/* Toast */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

export default function BusinessCanvasPage() {
  return (
    <Suspense fallback={<div className="flex flex-col h-full bg-white" />}>
      <CanvasPageContent />
    </Suspense>
  );
}
