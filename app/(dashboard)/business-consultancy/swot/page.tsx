"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
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
  createSwot,
  getSwot,
  patchSwot,
  publishSwot,
  SwotItem,
  SwotDocument,
} from "./swotApi";

// ── Types ────────────────────────────────────────────────

type SwotCategory = "strengths" | "weaknesses" | "opportunities" | "threats";

interface SwotBlockMeta {
  key: SwotCategory;
  title: string;
  colorClass: string; // badge bg
}

// ── Constants ────────────────────────────────────────────

const BLOCK_META: SwotBlockMeta[] = [
  { key: "strengths",     title: "STRENGTHS",     colorClass: "bg-[#5A3FFF] text-white" },
  { key: "weaknesses",    title: "WEAKNESSES",    colorClass: "bg-[#D4B333] text-white" },
  { key: "opportunities", title: "OPPORTUNITIES", colorClass: "bg-[#4CAF50] text-white" },
  { key: "threats",       title: "THREATS",        colorClass: "bg-[#E53935] text-white" },
];

// ── Conversion helpers (backend SwotItem ↔ UI strings) ──

function itemsToTexts(items: (SwotItem | string)[]): string[] {
  return items.map((item) => (typeof item === "string" ? item : item.text));
}

function textsToItems(texts: string[]): SwotItem[] {
  return texts.filter((t) => t.trim()).map((t) => ({ text: t.trim() }));
}

// ── Page content ─────────────────────────────────────────

function SwotPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const { toast, showToast, hideToast } = useToast();

  // Core SWOT state
  const [swotId, setSwotId] = useState<string | null>(null);
  const [swotStatus, setSwotStatus] = useState<"draft" | "published">("draft");
  const [documentTitle, setDocumentTitle] = useState("");
  const [quadrants, setQuadrants] = useState<Record<SwotCategory, string[]>>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  });

  // Loading states
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // UI states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ key: SwotCategory; index: number } | null>(null);

  // Refs
  const menuRef = useRef<HTMLDivElement>(null);
  const quadrantsRef = useRef(quadrants);

  useEffect(() => {
    quadrantsRef.current = quadrants;
  }, [quadrants]);

  // ── Initialization ──────────────────────────────────
  // URL is the single source of truth:
  //   ?swot_id=X  → load existing SWOT X
  //   no params   → create a fresh blank SWOT

  const initRan = useRef(false);

  useEffect(() => {
    if (userLoading || !user) return;
    if (initRan.current) return;
    initRan.current = true;

    const idFromUrl = searchParams.get("swot_id");

    async function init() {
      setIsInitializing(true);
      try {
        if (idFromUrl) {
          const swot = await getSwot(idFromUrl);
          console.log("[SWOT] GET swot from URL:", JSON.stringify(swot, null, 2));
          applySwotToState(swot);
        } else {
          const swot = await createSwot("");
          console.log("[SWOT] POST createSwot (new):", JSON.stringify(swot, null, 2));
          applySwotToState(swot);
          router.replace(`/business-consultancy/swot?swot_id=${swot.id}`);
        }
      } catch {
        showToast("error", "Failed to load SWOT. Please try again.");
      } finally {
        setIsInitializing(false);
      }
    }

    init();
  }, [user, userLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  function applySwotToState(swot: SwotDocument) {
    setSwotId(swot.id);
    setDocumentTitle(swot.title ?? "");
    setSwotStatus(swot.status);
    setQuadrants({
      strengths: itemsToTexts(swot.strengths ?? []),
      weaknesses: itemsToTexts(swot.weaknesses ?? []),
      opportunities: itemsToTexts(swot.opportunities ?? []),
      threats: itemsToTexts(swot.threats ?? []),
    });
  }

  // ── Save ────────────────────────────────────────────

  const saveSwot = useCallback(
    async (updates: { title?: string; quadrants?: Record<SwotCategory, string[]> }) => {
      if (!swotId) return;
      setIsSaving(true);
      try {
        const payload: Record<string, unknown> = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.quadrants !== undefined) {
          payload.strengths = textsToItems(updates.quadrants.strengths);
          payload.weaknesses = textsToItems(updates.quadrants.weaknesses);
          payload.opportunities = textsToItems(updates.quadrants.opportunities);
          payload.threats = textsToItems(updates.quadrants.threats);
        }
        console.log("[SWOT] PATCH saveSwot payload:", JSON.stringify(payload, null, 2));
        const patchResult = await patchSwot(swotId, payload);
        console.log("[SWOT] PATCH saveSwot response:", JSON.stringify(patchResult, null, 2));
      } catch {
        showToast("error", "Failed to save. Please try again.");
      } finally {
        setIsSaving(false);
      }
    },
    [swotId, showToast]
  );

  // ── Quadrant item handlers ────────────────────────

  const handleAddItem = (key: SwotCategory) => {
    setQuadrants((prev) => ({
      ...prev,
      [key]: [...prev[key], ""],
    }));
    // Focus the new item
    setTimeout(() => {
      setEditingCell({ key, index: quadrants[key].length });
    }, 0);
  };

  const handleItemChange = (key: SwotCategory, index: number, value: string) => {
    setQuadrants((prev) => ({
      ...prev,
      [key]: prev[key].map((t, i) => (i === index ? value : t)),
    }));
  };

  const handleItemBlur = () => {
    setEditingCell(null);
    saveSwot({ quadrants: quadrantsRef.current });
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, key: SwotCategory, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleRemoveItem = (key: SwotCategory, index: number) => {
    const updated = {
      ...quadrants,
      [key]: quadrants[key].filter((_, i) => i !== index),
    };
    setQuadrants(updated);
    saveSwot({ quadrants: updated });
  };

  // ── Publish ─────────────────────────────────────────

  const handlePublish = async () => {
    if (!swotId || isPublishing) return;
    if (swotStatus === "published") {
      showToast("success", "This SWOT is already published.");
      return;
    }
    setIsPublishing(true);
    try {
      // Save current state first
      await patchSwot(swotId, {
        title: documentTitle,
        strengths: textsToItems(quadrants.strengths),
        weaknesses: textsToItems(quadrants.weaknesses),
        opportunities: textsToItems(quadrants.opportunities),
        threats: textsToItems(quadrants.threats),
      });
      await publishSwot(swotId);
      showToast("success", "SWOT published successfully!");

      // Reset to a fresh SWOT
      setSwotId(null);
      setSwotStatus("draft");
      setDocumentTitle("");
      setQuadrants({ strengths: [], weaknesses: [], opportunities: [], threats: [] });

      const fresh = await createSwot("");
      console.log("[SWOT] POST createSwot (post-publish):", JSON.stringify(fresh, null, 2));
      applySwotToState(fresh);
      router.replace(`/business-consultancy/swot?swot_id=${fresh.id}`);
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

  const handleNewSwot = async () => {
    setIsMenuOpen(false);
    setIsInitializing(true);

    // Clear everything immediately
    setSwotId(null);
    setSwotStatus("draft");
    setDocumentTitle("");
    setQuadrants({ strengths: [], weaknesses: [], opportunities: [], threats: [] });

    try {
      const swot = await createSwot("");
      console.log("[SWOT] POST createSwot (handleNewSwot):", JSON.stringify(swot, null, 2));
      applySwotToState(swot);
      router.replace(`/business-consultancy/swot?swot_id=${swot.id}`);
    } catch {
      showToast("error", "Failed to create new SWOT.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSavedSwots = () => {
    setIsMenuOpen(false);
    router.push("/business-consultancy/resources");
  };

  // ── Render ──────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] md:bg-[#fbfbfb] text-gray-800">
      <Header title="Business Consultancy" />

      <main className="relative flex-1 flex flex-col overflow-auto max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8">
        {/* Loading overlay */}
        {isInitializing && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-[#4A247c] animate-spin" />
              <p className="text-sm text-gray-500">Loading SWOT...</p>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-8 flex-wrap">
          <Link href="/business-consultancy">
            <button className="flex items-center hover:text-gray-900 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Business Consultancy</span>
            </button>
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">SWOT</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">{documentTitle || "New Document"}</span>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePublish}
              disabled={isPublishing || swotStatus === "published"}
              className="bg-gradient-to-r from-[#4A247c] to-[#2E154E] hover:from-[#3A1C62] hover:to-[#220F3A] text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2"
            >
              {isPublishing && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPublishing ? "Publishing..." : swotStatus === "published" ? "Published" : "Publish"}
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
                  onClick={handleNewSwot}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New SWOT
                </button>
                <button
                  onClick={handleSavedSwots}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Saved SWOTs
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Add document title"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            onBlur={() => saveSwot({ title: documentTitle })}
            className="w-full text-base sm:text-xl font-light text-gray-400 placeholder:text-gray-300 border-none outline-none bg-transparent"
          />
          <div className="w-full h-[1px] bg-gray-200 mt-2" />
        </div>

        {/* SWOT Grid */}
        <div className="flex-1 w-full max-w-[1000px] mx-auto grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2">
          {BLOCK_META.map((block, blockIndex) => (
            <div
              key={block.key}
              className={`relative flex flex-col min-h-[180px] sm:min-h-[250px] p-3 sm:p-6
                ${blockIndex === 0 ? "border-b border-gray-200 sm:border-r" : ""}
                ${blockIndex === 1 ? "border-b border-gray-200" : ""}
                ${blockIndex === 2 ? "border-b sm:border-b-0 border-gray-200 sm:border-r" : ""}
              `}
            >
              {/* Text items */}
              <div className="w-full flex flex-wrap gap-1.5 sm:gap-2 px-1 sm:px-2 mb-3 sm:mb-4">
                {quadrants[block.key].map((text, i) => (
                  <div key={i} className="group flex items-center gap-1">
                    {editingCell?.key === block.key && editingCell?.index === i ? (
                      <input
                        autoFocus
                        value={text}
                        onChange={(e) => handleItemChange(block.key, i, e.target.value)}
                        onBlur={handleItemBlur}
                        onKeyDown={(e) => handleItemKeyDown(e, block.key, i)}
                        className="bg-blue-50/80 text-gray-700 text-xs px-3 py-1.5 rounded-md outline-none ring-1 ring-blue-300 min-w-[60px]"
                      />
                    ) : (
                      <div
                        onClick={() => setEditingCell({ key: block.key, index: i })}
                        className="bg-blue-50/50 text-gray-600 text-xs px-3 py-1.5 rounded-md cursor-text hover:bg-blue-50/80 transition-colors"
                      >
                        {text || "Edit..."}
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveItem(block.key, i)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Center Title Badge */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div
                  className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold tracking-wider text-xs sm:text-sm shadow-sm ${block.colorClass}`}
                >
                  {block.title}
                </div>

                <button
                  onClick={() => handleAddItem(block.key)}
                  className="mt-3 flex items-center gap-1 text-xs text-indigo-900 hover:text-indigo-700 transition-colors font-medium underline decoration-indigo-200 underline-offset-4"
                >
                  <Plus className="h-3 w-3" />
                  Add more text boxes
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Input Footer */}
      <div className="bg-white border-t border-gray-100 pb-safe">
        <InputFooter
          placeholder="Ask me to suggest a business name.."
          onSend={(msg) => {
            const params = new URLSearchParams({ context: "business-consultancy" });
            if (swotId) params.set("swot_id", swotId);
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

export default function SwotPage() {
  return (
    <Suspense fallback={<div className="flex flex-col h-full bg-[#fbfbfb]" />}>
      <SwotPageContent />
    </Suspense>
  );
}
