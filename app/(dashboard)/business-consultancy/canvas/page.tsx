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

// ── Types ────────────────────────────────────────────────

/** What the backend stores per block: a list of strings */
type ApiBlocks = Record<string, string[]>;

/** UI metadata for each of the 9 fixed canvas sections (never sent to API) */
interface BlockMeta {
  key: string;        // backend key e.g. "customer_segments"
  title: string;      // display name
  placeholder: string;
  color: string;      // tailwind bg class
  colSpan: number;
}

/** Local state per block: backend key + editable text + UI metadata */
interface CanvasBlock {
  key: string;        // matches backend key
  title: string;
  content: string;    // textarea value — joined from string[] with newlines
  placeholder: string;
  color: string;
  colSpan: number;
}

// ── Constants (UI-only, never sent to backend) ───────────

const BLOCK_META: BlockMeta[] = [
  { key: "customer_segments",      title: "Customer Segments",      placeholder: "Who are you serving?",                              color: "bg-indigo-100",  colSpan: 1 },
  { key: "value_propositions",     title: "Value Propositions",     placeholder: "What problem are you solving?",                     color: "bg-yellow-200",  colSpan: 2 },
  { key: "channels",               title: "Channels",               placeholder: "How do they reach you?",                            color: "bg-yellow-400",  colSpan: 1 },
  { key: "revenue_streams",        title: "Revenue Streams",        placeholder: "How do you make money?",                            color: "bg-green-100",   colSpan: 1 },
  { key: "customer_relationships", title: "Customer Relationships", placeholder: "What support or loyalty model?",                    color: "bg-indigo-100",  colSpan: 1 },
  { key: "key_resources",          title: "Key Resources",          placeholder: "What assets do you need?",                          color: "bg-green-100",   colSpan: 1 },
  { key: "key_activities",         title: "Key Activities",         placeholder: "Core actions to deliver the value",                  color: "bg-indigo-100",  colSpan: 1 },
  { key: "key_partnerships",       title: "Key Partnerships",       placeholder: "Who helps you?",                                    color: "bg-yellow-200",  colSpan: 2 },
  { key: "cost_structure",         title: "Cost Structure",         placeholder: "Main expenses (staff, cloud, marketing, logistics)", color: "bg-indigo-100",  colSpan: 1 },
];

const META_BY_KEY: Record<string, BlockMeta> = Object.fromEntries(
  BLOCK_META.map((m) => [m.key, m])
);

// ── Conversion helpers ───────────────────────────────────

/** Build local CanvasBlock[] from API blocks (Record<string, string[]>) */
function apiBlocksToLocal(apiBlocks: ApiBlocks): CanvasBlock[] {
  return BLOCK_META.map((meta) => {
    const items = apiBlocks[meta.key] ?? [];
    return {
      key: meta.key,
      title: meta.title,
      content: items.join("\n"),
      placeholder: meta.placeholder,
      color: meta.color,
      colSpan: meta.colSpan,
    };
  });
}

/** Build API blocks (Record<string, string[]>) from local CanvasBlock[] */
function localBlocksToApi(blocks: CanvasBlock[]): ApiBlocks {
  const result: ApiBlocks = {};
  for (const block of blocks) {
    // Split textarea by newlines, trim each line, drop empties
    const lines = block.content
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    result[block.key] = lines;
  }
  return result;
}

/** Default empty local blocks (used when creating a new canvas) */
function defaultLocalBlocks(): CanvasBlock[] {
  return BLOCK_META.map((meta) => ({
    key: meta.key,
    title: meta.title,
    content: "",
    placeholder: meta.placeholder,
    color: meta.color,
    colSpan: meta.colSpan,
  }));
}

// ── Page content ─────────────────────────────────────────

function CanvasPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const { toast, showToast, hideToast } = useToast();

  // Core canvas state
  const [canvasId, setCanvasId] = useState<string | null>(null);
  const [canvasStatus, setCanvasStatus] = useState<"draft" | "published">("draft");
  const [documentTitle, setDocumentTitle] = useState("");
  const [blocks, setBlocks] = useState<CanvasBlock[]>(defaultLocalBlocks());

  // Loading states
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // UI states
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Refs
  const menuRef = useRef<HTMLDivElement>(null);
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const blocksRef = useRef(blocks);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // ── Initialization ──────────────────────────────────

  useEffect(() => {
    if (userLoading || !user) return;

    const idFromUrl = searchParams.get("canvas_id");
    const isNew = searchParams.get("new") === "1";

    async function init() {
      setIsInitializing(true);
      try {
        if (!isNew && idFromUrl) {
          const canvas = await getCanvas(idFromUrl);
          console.log("[Canvas] GET canvas from URL:", JSON.stringify(canvas, null, 2));
          setCanvasId(canvas.id);
          setDocumentTitle(canvas.title ?? "");
          setCanvasStatus(canvas.status);
          if (canvas.blocks && Object.keys(canvas.blocks).length > 0) {
            console.log("[Canvas] API blocks:", JSON.stringify(canvas.blocks, null, 2));
            console.log("[Canvas] Converted to local blocks:", apiBlocksToLocal(canvas.blocks));
            setBlocks(apiBlocksToLocal(canvas.blocks));
          }
          sessionStorage.setItem("currentCanvasId", canvas.id);
        } else if (!isNew && sessionStorage.getItem("currentCanvasId")) {
          const savedId = sessionStorage.getItem("currentCanvasId")!;
          try {
            const canvas = await getCanvas(savedId);
            console.log("[Canvas] GET canvas from sessionStorage:", JSON.stringify(canvas, null, 2));
            setCanvasId(canvas.id);
            setDocumentTitle(canvas.title ?? "");
            setCanvasStatus(canvas.status);
            if (canvas.blocks && Object.keys(canvas.blocks).length > 0) {
              console.log("[Canvas] API blocks:", JSON.stringify(canvas.blocks, null, 2));
              setBlocks(apiBlocksToLocal(canvas.blocks));
            }
            window.history.replaceState(null, "", `/business-consultancy/canvas?canvas_id=${savedId}`);
          } catch {
            sessionStorage.removeItem("currentCanvasId");
            const canvas = await createCanvas("");
            setCanvasId(canvas.id);
            sessionStorage.setItem("currentCanvasId", canvas.id);
            window.history.replaceState(null, "", `/business-consultancy/canvas?canvas_id=${canvas.id}`);
          }
        } else {
          const canvas = await createCanvas("");
          console.log("[Canvas] POST createCanvas (new):", JSON.stringify(canvas, null, 2));
          setCanvasId(canvas.id);
          setCanvasStatus("draft");
          setBlocks(defaultLocalBlocks());
          sessionStorage.setItem("currentCanvasId", canvas.id);
          window.history.replaceState(null, "", `/business-consultancy/canvas?canvas_id=${canvas.id}`);
        }
      } catch {
        showToast("error", "Failed to load canvas. Please try again.");
      } finally {
        setIsInitializing(false);
      }
    }

    init();
  }, [user, userLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save ────────────────────────────────────────────

  const saveCanvas = useCallback(
    async (updates: { title?: string; blocks?: CanvasBlock[] }) => {
      if (!canvasId) return;
      setIsSaving(true);
      try {
        const payload: Record<string, unknown> = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.blocks !== undefined) payload.blocks = localBlocksToApi(updates.blocks);
        console.log("[Canvas] PATCH saveCanvas payload:", JSON.stringify(payload, null, 2));
        const patchResult = await patchCanvas(canvasId, payload);
        console.log("[Canvas] PATCH saveCanvas response:", JSON.stringify(patchResult, null, 2));
      } catch {
        showToast("error", "Failed to save. Please try again.");
      } finally {
        setIsSaving(false);
      }
    },
    [canvasId, showToast]
  );

  // ── Block handlers ──────────────────────────────────

  const handleBlockContentChange = (blockKey: string, newContent: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.key === blockKey ? { ...b, content: newContent } : b))
    );
  };

  const handleBlockBlur = () => {
    saveCanvas({ blocks: blocksRef.current });
  };

  const handleClearBlock = (blockKey: string) => {
    const previous = blocks.map((b) => ({ ...b }));
    const updated = blocks.map((b) =>
      b.key === blockKey ? { ...b, content: "" } : b
    );
    setBlocks(updated);
    saveCanvas({ blocks: updated });
    showToast("success", "Card cleared.", {
      label: "Undo",
      onClick: () => {
        setBlocks(previous);
        saveCanvas({ blocks: previous });
        hideToast();
      },
    });
  };

  // ── Publish ─────────────────────────────────────────

  const handlePublish = async () => {
    if (!canvasId || isPublishing) return;
    if (canvasStatus === "published") {
      showToast("success", "This canvas is already published.");
      return;
    }
    setIsPublishing(true);
    try {
      const publishPatchPayload = {
        title: documentTitle,
        blocks: localBlocksToApi(blocks),
      };
      console.log("[Canvas] PATCH before publish payload:", JSON.stringify(publishPatchPayload, null, 2));
      const patchRes = await patchCanvas(canvasId, publishPatchPayload);
      console.log("[Canvas] PATCH before publish response:", JSON.stringify(patchRes, null, 2));
      const pubRes = await publishCanvas(canvasId);
      console.log("[Canvas] POST publish response:", JSON.stringify(pubRes, null, 2));
      showToast("success", "Canvas published successfully!");

      // Reset to a fresh canvas
      sessionStorage.removeItem("currentCanvasId");
      setCanvasId(null);
      setCanvasStatus("draft");
      setDocumentTitle("");
      setBlocks(defaultLocalBlocks());

      const fresh = await createCanvas("");
      console.log("[Canvas] POST createCanvas (post-publish reset):", JSON.stringify(fresh, null, 2));
      setCanvasId(fresh.id);
      sessionStorage.setItem("currentCanvasId", fresh.id);
      window.history.replaceState(null, "", `/business-consultancy/canvas?canvas_id=${fresh.id}`);
    } catch {
      showToast("error", "Failed to publish. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Three-dot menu ──────────────────────────────────

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

  // ── Render ──────────────────────────────────────────

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
              className="bg-gradient-to-r from-[#4A247c] to-[#2E154E] hover:from-[#3A1C62] hover:to-[#220F3A] text-white px-6 py-2 rounded-xl text-sm font-medium transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
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
                key={block.key}
                className="bg-white rounded-2xl flex flex-col shadow-sm border border-gray-100 overflow-hidden min-h-[140px]"
                style={{ gridColumn: `span ${block.colSpan}` }}
              >
                {/* Card Header */}
                <div className={`flex justify-between items-center px-4 py-2 ${block.color}`}>
                  <h3 className="text-xs font-bold text-indigo-900 mx-auto w-full text-center pl-8">
                    {block.title}
                  </h3>
                  <div className="flex items-center gap-1 opacity-60 text-indigo-900">
                    <button
                      className="p-1 hover:bg-white/20 rounded-md"
                      onClick={() => textareaRefs.current[block.key]?.focus()}
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      className="p-1 hover:bg-white/20 rounded-md"
                      onClick={() => handleClearBlock(block.key)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex-1 p-4">
                  <textarea
                    ref={(el) => {
                      textareaRefs.current[block.key] = el;
                    }}
                    placeholder={block.placeholder}
                    value={block.content}
                    onChange={(e) => handleBlockContentChange(block.key, e.target.value)}
                    onBlur={handleBlockBlur}
                    className="w-full h-full min-h-[80px] text-xs text-gray-700 placeholder:text-gray-300 bg-transparent border-none outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            ))}
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
