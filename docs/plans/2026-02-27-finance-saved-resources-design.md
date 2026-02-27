# Finance: Saved Resources Page — Design Doc

**Date:** 2026-02-27
**Status:** Approved

---

## Goal

Replace the "Add a new entry to your plan" quicklink on the Financial Literacy home page with a "Saved Resources" link that navigates to a new `/financial-literacy/resources` page. The page surfaces two categories of user data from the backend: their created budgets and their AI-generated documents (PDF exports, etc.).

---

## Backend Source of Truth

### API Endpoint
`GET /v1/finance/resources?user_id=<id>&window=<window>&limit=<n>`

**Response shape:**
```json
{
  "created_resources": [
    { "type": "budget", "id": "string", "title": "string", "status": "draft|published" }
  ],
  "generated_documents": [
    {
      "id": "string",
      "user_id": "string",
      "title": "string",
      "filename": "string",
      "file_type": "pdf|xlsx|docx",
      "status": "processing|ready|failed",
      "storage": { "url": "string|null", ... },
      "created_at": "ISO-8601"
    }
  ],
  "window": "all_time"
}
```

### DB Collections backing this endpoint
- `finance_budgets` — created_resources (type: "budget")
- `finance_generated_docs` — generated_documents

---

## Changes

### 1. Quicklink Update (`financial-literacy/page.tsx`)
- `id`: `"add-entry"` → `"resources"`
- `title`: `"Add a new entry to your plan"` → `"Saved Resources"`
- `href`: `/financial-literacy/budget-planner?action=add` → `/financial-literacy/resources`
- Icon: keep the document icon (already appropriate), keep green gradient

### 2. New Page (`financial-literacy/resources/page.tsx`)

**Conventions followed** (same as reports/page.tsx):
- `"use client"` directive
- `apiService.get()` for all data fetching
- `Header` component, `ChevronLeft` back nav
- Lucide icons, `#5A3FFF` brand color, `rounded-2xl` cards, `bg-gray-50` page bg

**State:**
- `window`: `"all_time"` | `"a_month_ago"` | `"a_year_ago"` (filter pills, default: all_time)
- `data`: `ResourcesResponse | null`
- `loading`: boolean
- `error`: string | null

**Sections:**

#### Section A — Your Budgets (`created_resources`)
- Grid of budget cards (title or "Untitled Budget", period/status badge)
- Status badge: `draft` → gray pill, `published` → green pill
- Each card links to `/financial-literacy/budget-planner?budget_id=<id>`
- Empty state: "No budgets yet. Create one in the Budget Planner."

#### Section B — Generated Documents (`generated_documents`)
- List of document rows: title, filename, file_type badge, status, download/action
- `status === "processing"` → spinner + "Generating…" label, no download
- `status === "ready"` → green badge + Download button (opens `storage.url` in new tab)
- `status === "failed"` → red badge + "Failed" label
- Empty state: "No documents generated yet. Export a report to see it here."
- Sorted: newest first (created_at desc)

**Time Window Filter Pills:**
- "All Time" → `all_time`
- "This Month" → `a_month_ago`
- "This Year" → `a_year_ago`
- Re-fetches on change

**Error state:** If API call fails → show "Could not load resources" with retry button.

---

## Files to touch
1. `mpc-web/app/(dashboard)/financial-literacy/page.tsx` — update quicklink
2. `mpc-web/app/(dashboard)/financial-literacy/resources/page.tsx` — create new page