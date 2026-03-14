# MPC Web — Responsive Design Patterns & Context

**Date:** 2026-03-14
**Status:** Reference Document
**Scope:** All pages under `mpc-web/app/(dashboard)/`

---

## Overview

Every page in the MPC dashboard must be responsive across mobile (< 640px), tablet (640–1024px), and desktop (> 1024px). This document captures every pattern established during the responsive pass so that new or untouched pages can be made responsive consistently.

The project uses **Tailwind CSS** with standard breakpoints:
- `sm:` → 640px+
- `md:` → 768px+
- `lg:` → 1024px+

All styling is **mobile-first** — base classes target mobile, then layers add via `sm:`, `md:`, `lg:`.

---

## 1. Grid Layouts — Stacking on Mobile

### Pattern: Multi-column grid → single column on mobile

Grids collapse to a single column on mobile, optionally stepping through 2 columns on tablet before reaching the full layout on desktop.

```
/* 4-column grid (Business Canvas) */
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4

/* 2-column grid (SWOT, Metrics) */
grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6

/* 3-column grid (Study Planner) */
grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6

/* Auto-fit cards (Resources, Insights) */
grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6
```

**Column spanning** — use Tailwind classes, not inline `gridColumn` styles (SSR-safe):
```
${block.colSpan === 2 ? "lg:col-span-2" : ""}

/* Full-width add row */
col-span-1 sm:col-span-2 lg:col-span-4
```

### Pattern: SWOT border handling on mobile stack

When a 2×2 grid stacks to 1 column, border logic changes so you don't get doubled or missing borders:
```tsx
${blockIndex === 0 ? "border-b border-gray-200 sm:border-r" : ""}
${blockIndex === 1 ? "border-b border-gray-200" : ""}
${blockIndex === 2 ? "border-b sm:border-b-0 border-gray-200 sm:border-r" : ""}
// blockIndex 3: no borders (last item)
```

---

## 2. Sidebar + Content Layouts

### Pattern: Side-by-side on desktop, stacked on mobile with reordering

Use `flex flex-col lg:flex-row` and `order-N` classes to show the main content first on mobile and the sidebar second:

```tsx
{/* Container */}
<div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mt-4 sm:mt-7">
  {/* Sidebar — appears second on mobile, first on desktop */}
  <div className="w-full lg:w-[35%] order-2 lg:order-1 lg:sticky lg:top-6 lg:self-start">
    {/* sidebar content */}
  </div>

  {/* Main content — appears first on mobile, second on desktop */}
  <div className="w-full lg:w-[65%] order-1 lg:order-2">
    {/* main content */}
  </div>
</div>
```

**Key rules:**
- Content/form gets `order-1 lg:order-2` (shown first on mobile)
- Sidebar/AI chat gets `order-2 lg:order-1` (shown second on mobile)
- Sidebar uses `lg:sticky lg:top-6 lg:self-start` to stick on desktop

### Pattern: Grid-based sidebar layout (Study Planner)

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
  <div className="lg:col-span-1">
    {/* sidebar */}
  </div>
  <div className="lg:col-span-2">
    {/* main content */}
  </div>
</div>
```

---

## 3. Sidebar / Chat Panel Heights

Sidebars and chat panels use viewport-based heights on desktop, a shorter fixed height on mobile:

```
h-[60vh] lg:h-[calc(100vh-14rem)]
```

For study planner specifically:
```
h-[60vh] lg:h-[calc(100vh-220px)] min-h-[400px] sm:min-h-[500px]
```

**Rules:**
- Mobile: `h-[60vh]` — short enough to not dominate the screen
- Desktop: `lg:h-[calc(100vh-Xrem)]` — fill available space minus header/footer
- Always add a `min-h-[400px] sm:min-h-[500px]` for usability

---

## 4. Typography Scale

Every text element scales down on mobile:

| Element | Mobile (base) | Tablet (sm:) | Desktop (md:/lg:) |
|---------|--------------|-------------|-------------------|
| Page title | `text-lg` | `text-2xl` | `text-2xl` |
| Section heading | `text-base` | `text-lg` | `text-xl` |
| Hero title | `text-2xl` | `text-3xl` | `text-4xl` |
| Body text | `text-xs` | `text-sm` | `text-sm` |
| Breadcrumb | `text-xs` | `text-sm` | `text-sm` |
| Labels | `text-sm` | `text-base` | `text-base` |
| Input text | `text-xs` | `text-sm` | `text-sm` |
| Badge/tag | `text-xs` | `text-sm` | `text-sm` |

Standard patterns:
```
text-xs sm:text-sm          /* body, inputs, badges */
text-sm sm:text-base        /* labels, sub-headings */
text-base sm:text-lg        /* section headings */
text-lg sm:text-2xl         /* page titles */
text-2xl sm:text-3xl md:text-4xl  /* hero titles */
```

---

## 5. Spacing Scale

### Padding
```
px-3 sm:px-4                /* tight containers, cards */
px-3 sm:px-6                /* page content area */
px-3 sm:px-6 md:px-8        /* chat content with extra desktop space */
p-3 sm:p-4 md:p-6           /* card/section padding */
p-3 sm:p-5 md:p-8           /* large card interiors */
py-2 sm:py-3                /* input fields */
py-4 sm:py-6                /* page top padding */
```

### Margins
```
mb-3 sm:mb-4                /* between label and content */
mb-4 sm:mb-6                /* between sections */
mb-4 sm:mb-8                /* between major sections */
my-4 sm:my-6 md:my-10       /* breadcrumb vertical spacing */
mt-4 sm:mt-7                /* content after breadcrumb */
```

### Gaps
```
gap-1.5 sm:gap-2            /* tight button groups, icon+text */
gap-1.5 sm:gap-3            /* input areas with buttons */
gap-2 sm:gap-3              /* toolbar items */
gap-3 sm:gap-4              /* grid items */
gap-4 sm:gap-6              /* major layout gaps */
space-y-3 sm:space-y-6      /* chat message spacing */
```

---

## 6. Icon Sizing

```
w-3.5 h-3.5 sm:w-4 sm:h-4     /* breadcrumb chevrons, small icons */
w-4 h-4 sm:w-5 sm:h-5         /* standard icons (send, mic, paperclip) */
w-5 h-5 sm:w-6 sm:h-6         /* close buttons, medium icons */
w-5 h-5 sm:w-7 sm:h-7         /* page header icons */
w-9 h-9 sm:w-12 sm:h-12       /* large decorative icons */
w-10 h-10 sm:w-14 sm:h-14     /* page header icon containers */
w-12 h-12 sm:w-16 sm:h-16     /* empty state icons */
```

---

## 7. Rounded Corners

Scale border-radius up on larger screens:
```
rounded-lg sm:rounded-xl       /* buttons, inputs, small cards */
rounded-xl sm:rounded-2xl      /* cards, panels */
rounded-2xl sm:rounded-3xl     /* large containers, chat panels */
```

---

## 8. Button Sizing

### Icon buttons (send, mic, attach)
```
h-8 w-8 sm:h-10 sm:w-10       /* standard circular buttons */
h-9 w-9 sm:h-12 sm:w-12       /* larger circular buttons */
h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12  /* 3-step sizing */
p-1.5 sm:p-2                  /* icon button padding */
p-1.5 sm:p-3                  /* larger icon button padding */
```

### Text buttons
```
px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm  /* standard */
px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm   /* wider */
px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm    /* taller */
```

---

## 9. Auto-Expanding Textarea (Chat Inputs)

All chat inputs use `<textarea>` instead of `<input type="text">` so text doesn't overflow behind buttons.

### Implementation

**1. Add imports and ref:**
```tsx
import { useRef, useCallback } from "react";

const textareaRef = useRef<HTMLTextAreaElement>(null);

const autoResize = useCallback(() => {
  const el = textareaRef.current;
  if (el) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }
}, []);
```

**2. Replace `<input>` with `<textarea>`:**
```tsx
<textarea
  ref={textareaRef}
  rows={1}
  value={inputValue}
  onChange={(e) => {
    setInputValue(e.target.value);
    autoResize();
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }}
  placeholder="Type your message..."
  className="flex-1 min-w-0 bg-gray-50 rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:bg-white transition-all resize-none overflow-hidden max-h-[120px]"
/>
```

**3. Change flex container alignment:**
```
/* Before */
flex items-center gap-1.5 sm:gap-3

/* After — buttons align to bottom when textarea grows */
flex items-end gap-1.5 sm:gap-3
```

**4. Add bottom margin to side buttons:**
```
mb-0.5  /* on paperclip/attach buttons so they align with textarea bottom */
```

**Key rules:**
- `resize-none` — prevent manual resize handle
- `overflow-hidden` — hide scrollbar while growing
- `max-h-[120px]` — cap height at ~5 lines
- `rows={1}` — start as single line
- `rounded-2xl` instead of `rounded-full` — better shape for multi-line
- Enter sends message, Shift+Enter adds newline
- If component used `useRef<HTMLInputElement>`, change to `useRef<HTMLTextAreaElement>`

### Files using this pattern:
- `app/components/InputFooter.tsx`
- `app/(dashboard)/Life/chat/page.tsx`
- `app/(dashboard)/business-consultancy/chat/page.tsx`
- `app/(dashboard)/study/chat/page.tsx`
- `app/(dashboard)/financial-literacy/chat/page.tsx`
- `app/(dashboard)/career/components/AIEditSidebar.tsx`
- `app/(dashboard)/Life/components/FoodAI.tsx`
- `app/(dashboard)/study/components/StudyChatSidebar.tsx`

---

## 10. Mobile Action Visibility (Hover → Always Visible)

On desktop, action buttons (edit, delete) can hide behind `group-hover`. On mobile, hover doesn't exist. Use this pattern:

```
/* Always visible on mobile, hover-reveal on desktop */
opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0
```

The parent element must have `group` class. Buttons inside get larger touch targets:
```tsx
<div className="flex items-center gap-1 sm:gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
  <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
    <Edit3 className="w-4 h-4 text-gray-500" />
  </button>
  <button className="p-1.5 hover:bg-red-50 rounded transition-colors">
    <Trash2 className="w-4 h-4 text-red-400" />
  </button>
</div>
```

Also add `active:bg-gray-100` to clickable items for touch feedback.

---

## 11. Drawer / Modal Responsive Width

```
w-full sm:w-[340px] max-w-[90vw]
```
- Full-width on mobile
- Fixed width on tablet+
- `max-w-[90vw]` as safety cap

---

## 12. Breadcrumb Pattern

Consistent breadcrumb across all pages:
```tsx
<Link href="/parent-route">
  <button className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 hover:text-[#5A3FFF] mb-4 sm:mb-6 transition-colors">
    <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    <span>Parent / Current Page</span>
  </button>
</Link>
```

For multi-segment breadcrumbs, add `flex-wrap` to handle overflow on mobile.

---

## 13. Card Patterns

### Standard card
```
bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-5
```

### Card with icon header
```tsx
<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
</div>
```

### Card min-height (prevents collapse on mobile)
```
min-h-[120px] sm:min-h-[140px]    /* grid cards */
min-h-[180px] sm:min-h-[250px]    /* SWOT quadrants */
```

---

## 14. Page Header Pattern

```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
  <div className="flex items-center gap-3 sm:gap-4">
    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#5A3FFF] to-[#300878] flex items-center justify-center">
      <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
    </div>
    <div>
      <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Page Title</h1>
      <p className="text-gray-500 text-sm">Subtitle text</p>
    </div>
  </div>
</div>
```

---

## 15. Responsive Background Pattern

Some pages use a different background on mobile vs desktop:
```
bg-[#f8fafc] md:bg-[#fbfbfb]
```

---

## Checklist: Making a New Page Responsive

1. **Page container**: Add responsive padding `px-3 sm:px-6 py-4 sm:py-6`
2. **Breadcrumb**: Use `text-xs sm:text-sm` with responsive icon sizes
3. **Grids**: Change `grid-cols-N` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-N`
4. **Sidebar layouts**: Use `flex flex-col lg:flex-row` with `order-N` classes
5. **Sidebar heights**: Use `h-[60vh] lg:h-[calc(100vh-Xrem)]`
6. **Typography**: Scale all text (see Section 4)
7. **Spacing**: Scale padding, margins, gaps (see Section 5)
8. **Icons**: Scale with `w-4 h-4 sm:w-5 sm:h-5` pattern
9. **Buttons**: Scale size and padding (see Section 8)
10. **Cards**: Add responsive padding and rounded corners
11. **Chat inputs**: Use auto-expanding textarea pattern (see Section 9)
12. **Hover actions**: Make always-visible on mobile (see Section 10)
13. **Drawers/modals**: Use `w-full sm:w-[Xpx] max-w-[90vw]`
14. **Test**: Check 375px, 640px, 768px, 1024px, 1280px widths
15. **Build**: Run `npx next build` to verify no errors
