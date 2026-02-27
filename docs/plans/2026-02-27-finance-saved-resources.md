# Finance: Saved Resources Page — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the "Add a new entry to your plan" quicklink with "Saved Resources" and build the `/financial-literacy/resources` page that shows the user's created budgets and AI-generated documents from the backend.

**Architecture:** Single new page at `/financial-literacy/resources/page.tsx` — fetches `GET /v1/finance/resources` (already implemented in backend), renders two sections: Created Resources (budgets) and Generated Documents. Backend + DB are source of truth; UI reflects whatever the API returns. No local mock data.

**Tech Stack:** Next.js 14 App Router, React, TypeScript, Tailwind CSS, Lucide React, `apiService` (Axios wrapper at `lib/api/apiService.ts`)

---

## Task 1: Update the quicklink on the Financial Literacy home page

**Files:**
- Modify: `mpc-web/app/(dashboard)/financial-literacy/page.tsx` (lines 42–64)

**Step 1: Update the `add-entry` quicklink object**

In `page.tsx`, find the quickLink with `id: "add-entry"` and change three fields:

```tsx
{
  id: "resources",
  title: "Saved Resources",
  icon: (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]">
      <svg
        className="h-5 w-5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
  ),
  color: "from-[#A7F3D0] to-[#6EE7B7]",
  href: "/financial-literacy/resources",
},
```

**Step 2: Verify visually**
- Open `http://localhost:3000/financial-literacy`
- The card should now read "Saved Resources" and link to `/financial-literacy/resources` (404 is expected until Task 2 is done)

**Step 3: Commit**
```bash
git add mpc-web/app/\(dashboard\)/financial-literacy/page.tsx
git commit -m "feat(finance): rename quicklink to Saved Resources"
```

---

## Task 2: Create the Saved Resources page

**Files:**
- Create: `mpc-web/app/(dashboard)/financial-literacy/resources/page.tsx`

**Step 1: Define the TypeScript types (top of file, aligned with API contract)**

These types match exactly what `GET /v1/finance/resources` returns:

```tsx
interface CreatedResource {
  type: "budget";
  id: string;
  title: string;
  status: "draft" | "published";
}

interface GeneratedDocument {
  id: string;
  user_id: string;
  title: string;
  filename: string;
  file_type: "pdf" | "xlsx" | "docx";
  status: "processing" | "ready" | "failed";
  storage: {
    provider?: string;
    url?: string | null;
    key?: string | null;
    public_id?: string | null;
  };
  created_at: string;
}

interface ResourcesResponse {
  created_resources: CreatedResource[];
  generated_documents: GeneratedDocument[];
  window: string;
}

type WindowFilter = "all_time" | "a_month_ago" | "a_year_ago";
```

**Step 2: Write the full page component**

Create `mpc-web/app/(dashboard)/financial-literacy/resources/page.tsx` with the following complete implementation:

```tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  FileText,
  FolderOpen,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import Header from "@/app/components/header";
import { apiService } from "@/lib/api/apiService";

// ── Types ──────────────────────────────────────────────────

interface CreatedResource {
  type: "budget";
  id: string;
  title: string;
  status: "draft" | "published";
}

interface GeneratedDocument {
  id: string;
  user_id: string;
  title: string;
  filename: string;
  file_type: "pdf" | "xlsx" | "docx";
  status: "processing" | "ready" | "failed";
  storage: {
    provider?: string;
    url?: string | null;
    key?: string | null;
    public_id?: string | null;
  };
  created_at: string;
}

interface ResourcesResponse {
  created_resources: CreatedResource[];
  generated_documents: GeneratedDocument[];
  window: string;
}

type WindowFilter = "all_time" | "a_month_ago" | "a_year_ago";

// ── Constants ──────────────────────────────────────────────

const WINDOW_OPTIONS: { value: WindowFilter; label: string }[] = [
  { value: "all_time", label: "All Time" },
  { value: "a_month_ago", label: "This Month" },
  { value: "a_year_ago", label: "This Year" },
];

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: "bg-red-100 text-red-700",
  xlsx: "bg-green-100 text-green-700",
  docx: "bg-blue-100 text-blue-700",
};

// ── Helpers ────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Component ──────────────────────────────────────────────

export default function SavedResourcesPage() {
  const [window, setWindow] = useState<WindowFilter>("all_time");
  const [data, setData] = useState<ResourcesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async (w: WindowFilter) => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await apiService.get(
        `/v1/finance/resources?window=${w}&limit=100`
      );
      const payload: ResourcesResponse = res?.data || res;
      setData(payload);
    } catch {
      setError("Could not load resources. Please try again.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources(window);
  }, [window, fetchResources]);

  const createdResources = data?.created_resources ?? [];
  const generatedDocs = [...(data?.generated_documents ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Finance Literacy" />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">

          {/* Back nav */}
          <Link href="/financial-literacy">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Finance Literacy / Saved Resources</span>
            </button>
          </Link>

          {/* Page title + Window filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Saved Resources</h1>
              <p className="text-sm text-gray-500 mt-1">
                Your budgets and AI-generated documents
              </p>
            </div>

            <div className="flex items-center gap-2">
              {WINDOW_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setWindow(opt.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    window === opt.value
                      ? "bg-[#5A3FFF] text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-[#5A3FFF] hover:text-[#5A3FFF]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 mb-6">
              <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
              <p className="text-gray-700 font-medium">{error}</p>
              <button
                onClick={() => fetchResources(window)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#5A3FFF] text-white text-sm rounded-xl hover:bg-[#4930CC] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading && !error && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#5A3FFF] animate-spin mb-4" />
              <p className="text-gray-500">Loading resources…</p>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <>
              {/* ── Section 1: Created Resources (Budgets) ── */}
              <section className="mb-10">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-[#5A3FFF]" />
                  Your Budgets
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    ({createdResources.length})
                  </span>
                </h2>

                {createdResources.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100 text-center">
                    <FolderOpen className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No budgets yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Create one in the Budget Planner to see it here
                    </p>
                    <Link href="/financial-literacy/budget-planner">
                      <button className="mt-4 px-4 py-2 bg-[#5A3FFF] text-white text-sm rounded-xl hover:bg-[#4930CC] transition-colors">
                        Go to Budget Planner
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {createdResources.map((resource) => (
                      <Link
                        key={resource.id}
                        href={`/financial-literacy/budget-planner?budget_id=${resource.id}`}
                        className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#5A3FFF] hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF2FF]">
                            <FolderOpen className="w-4 h-4 text-[#5A3FFF]" />
                          </div>
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              resource.status === "published"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {resource.status === "published" ? "Published" : "Draft"}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-[#5A3FFF] transition-colors">
                          {resource.title || "Untitled Budget"}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 capitalize">
                          {resource.type}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* ── Section 2: Generated Documents ── */}
              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#5A3FFF]" />
                  Generated Documents
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    ({generatedDocs.length})
                  </span>
                </h2>

                {generatedDocs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100 text-center">
                    <FileText className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No documents yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Export a report to see it here
                    </p>
                    <Link href="/financial-literacy/reports">
                      <button className="mt-4 px-4 py-2 bg-[#5A3FFF] text-white text-sm rounded-xl hover:bg-[#4930CC] transition-colors">
                        Go to Reports
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {generatedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
                      >
                        {/* File type icon */}
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50">
                          <FileText className="w-5 h-5 text-gray-500" />
                        </div>

                        {/* Doc info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {doc.title || doc.filename}
                            </p>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                FILE_TYPE_COLORS[doc.file_type] ??
                                "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {doc.file_type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {doc.filename} · {formatDate(doc.created_at)}
                          </p>
                        </div>

                        {/* Status + action */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {doc.status === "processing" && (
                            <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Generating…
                            </span>
                          )}
                          {doc.status === "ready" && (
                            <>
                              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Ready
                              </span>
                              {doc.storage?.url && (
                                <a
                                  href={doc.storage.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#5A3FFF] text-white rounded-lg hover:bg-[#4930CC] transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download
                                </a>
                              )}
                            </>
                          )}
                          {doc.status === "failed" && (
                            <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                              <XCircle className="w-3.5 h-3.5" />
                              Failed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
```

**Step 3: Verify in browser**
- Navigate to `http://localhost:3000/financial-literacy/resources`
- Should show loading spinner → then either empty states or data from API
- Test all three window filter pills
- Check that budget cards link to `/financial-literacy/budget-planner?budget_id=<id>`
- Check that ready documents show a Download button; processing shows spinner; failed shows badge

**Step 4: Commit**
```bash
git add mpc-web/app/\(dashboard\)/financial-literacy/resources/page.tsx
git commit -m "feat(finance): add Saved Resources page"
```

---

## Done ✓

Both tasks complete. The quicklink now routes to the resources page, and the resources page pulls live data from `GET /v1/finance/resources` — backend is the source of truth throughout.