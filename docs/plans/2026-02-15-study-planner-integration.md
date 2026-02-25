# Study Planner Integration - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all mock/hardcoded data in the `/study/planner` page with real API calls that flow through mpc-api to mpc-ai's study backend.

**Architecture:** The frontend (`mpc-web`) calls `mpc-api` (Express/TypeScript proxy), which forwards requests to `mpc-ai` (FastAPI/Python). The planner page needs 5 new proxy endpoints in mpc-api and a full frontend rewrite to match the backend's data model. The backend (`mpc-ai`) is the source of truth and requires ZERO changes.

**Tech Stack:** Next.js 14 (App Router), Express + tsyringe (DI), Zod validation, Axios, TailwindCSS

---

## Background: What Exists Today

### mpc-ai (backend) — COMPLETE, DO NOT TOUCH
- `POST /v1/study/plans/ai?user_id=X` — Creates plan + auto-generates tasks (study_core.py:131-214)
- `GET /v1/study/plans?user_id=X` — Lists all plans (study_core.py:217-229)
- `GET /v1/study/planner?user_id=X&range=week|month` — Returns tasks in date range (study_planner.py:27-59)
- `PATCH /v1/study/planner/tasks/{task_id}` — Updates a task (study_planner.py:71-87)
- `POST /v1/agent/study/chat` — Study AI agent chat (study.py:34-47)

### mpc-api (proxy) — NEEDS 5 NEW METHODS + 5 NEW ROUTES
Currently only has: `createStudyClass`, `listStudyClasses`, `getStudyClass`
Missing: plan creation, planner tasks, plan listing, task update, study chat

### mpc-web (frontend) — NEEDS FULL REWRITE OF PLANNER PAGE
Currently: All 3 interactions are fake (mock data, local state, hardcoded chat responses)
- `generateSamplePlans()` — random client-side data
- `handleSubmitPlan()` — pushes to local state
- `handleSendMessage()` — returns hardcoded strings

---

## Key Data Model Mapping

### Backend `StudyPlanCreateAI` (what POST /v1/study/plans/ai expects):
```python
class_id: str              # REQUIRED — must link to existing class
prompt: str                # REQUIRED — AI instruction, min 3 chars
title: Optional[str]       # max 140 chars
description: Optional[str] # max 600 chars
start_date: date           # REQUIRED — format: "YYYY-MM-DD"
end_date: date             # REQUIRED — format: "YYYY-MM-DD"
sessions_per_week: Optional[int]      # 1-14, default 3
minutes_per_session: Optional[int]    # 10-240, default 45
```

### Backend `StudyTaskOut` (what GET /v1/study/planner returns):
```python
id: str
user_id: str
class_id: str
plan_id: str
title: str
description: Optional[str]
due_at: datetime           # ISO datetime — this is the calendar placement
ai_prompts: Optional[List[str]]
status: "todo" | "doing" | "done" | "skipped"
created_at: datetime
updated_at: datetime
```

### Backend `StudyChatRequest` (what POST /v1/agent/study/chat expects):
```python
user_id: str
message: str
session_id: Optional[str]  # default "default"
class_id: Optional[str]
```

### Backend `AgentResponse` (what study chat returns):
```python
module: str
intent: str
message: str
plan: Optional[Dict]
actions: Optional[List[AgentAction]]
metadata: Optional[Dict]
```

---

## Task 1: Add 5 Study Proxy Methods to MpcAiService

**Files:**
- Modify: `/Users/mac/Documents/mpc/mpc-api/src/common/services/mpc-ai.service.ts:923` (add before the closing `}` of the class, after `getStudyClass` method ends on line 923)

**Step 1: Add the 5 proxy methods**

Open `/Users/mac/Documents/mpc/mpc-api/src/common/services/mpc-ai.service.ts`. Find the closing `}` on line 924 (the class closing brace). Insert these 5 methods BEFORE that closing brace (i.e., after line 923, before line 924):

```typescript
    async createStudyPlanAI(
        userId: string,
        data: {
            class_id: string;
            prompt: string;
            title?: string;
            description?: string;
            start_date: string;
            end_date: string;
            sessions_per_week?: number;
            minutes_per_session?: number;
        }
    ): Promise<any> {
        try {
            const endpoint = `${this.baseUrl}/v1/study/plans/ai?user_id=${userId}`;

            const response = await axios.post(endpoint, data, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: this.timeout,
            });

            return response.data;
        } catch (error: any) {
            console.error("[createStudyPlanAI] Error:", error.message);
            this.loggerService.error(`Failed to create study plan: ${error.message}`);
            throw error;
        }
    }

    async listStudyPlans(
        userId: string,
        classId?: string,
        status?: string,
        limit: number = 50
    ): Promise<any> {
        try {
            let endpoint = `${this.baseUrl}/v1/study/plans?user_id=${userId}&limit=${limit}`;
            if (classId) endpoint += `&class_id=${classId}`;
            if (status) endpoint += `&status=${status}`;

            const response = await axios.get(endpoint, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: this.timeout,
            });

            return response.data;
        } catch (error: any) {
            console.error("[listStudyPlans] Error:", error.message);
            this.loggerService.error(`Failed to list study plans: ${error.message}`);
            throw error;
        }
    }

    async getStudyPlannerTasks(
        userId: string,
        range: "week" | "month" = "month",
        start?: string,
        classId?: string,
        planId?: string
    ): Promise<any> {
        try {
            let endpoint = `${this.baseUrl}/v1/study/planner?user_id=${userId}&range=${range}`;
            if (start) endpoint += `&start=${start}`;
            if (classId) endpoint += `&class_id=${classId}`;
            if (planId) endpoint += `&plan_id=${planId}`;

            const response = await axios.get(endpoint, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: this.timeout,
            });

            return response.data;
        } catch (error: any) {
            console.error("[getStudyPlannerTasks] Error:", error.message);
            this.loggerService.error(`Failed to get study planner tasks: ${error.message}`);
            throw error;
        }
    }

    async updateStudyTask(
        userId: string,
        taskId: string,
        patch: {
            title?: string;
            description?: string;
            due_at?: string;
            status?: string;
            ai_prompts?: string[];
        }
    ): Promise<any> {
        try {
            const endpoint = `${this.baseUrl}/v1/study/planner/tasks/${taskId}`;
            const payload = {
                user_id: userId,
                ...patch,
            };

            const response = await axios.patch(endpoint, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: this.timeout,
            });

            return response.data;
        } catch (error: any) {
            console.error("[updateStudyTask] Error:", error.message);
            this.loggerService.error(`Failed to update study task: ${error.message}`);
            throw error;
        }
    }

    async callStudyAgent(
        userId: string,
        message: string,
        sessionId: string = "default",
        classId?: string
    ): Promise<any> {
        try {
            const payload: any = {
                user_id: userId,
                message,
                session_id: sessionId,
            };
            if (classId) payload.class_id = classId;

            const endpoint = `${this.baseUrl}/v1/agent/study/chat`;

            const response = await axios.post(endpoint, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: this.timeout,
            });

            return response.data;
        } catch (error: any) {
            console.error("[callStudyAgent] Error:", error.message);
            this.loggerService.error(`Failed to call study agent: ${error.message}`);
            throw error;
        }
    }
```

**Step 2: Verify TypeScript compiles**

Run: `cd /Users/mac/Documents/mpc/mpc-api && npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
cd /Users/mac/Documents/mpc/mpc-api
git add src/common/services/mpc-ai.service.ts
git commit -m "feat(study): add 5 planner proxy methods to MpcAiService"
```

---

## Task 2: Add Zod Validation Schemas for Study Planner

**Files:**
- Modify: `/Users/mac/Documents/mpc/mpc-api/src/modules/study/validation/study.schema.ts` (add new schemas after existing `CreateStudyClassSchema`)

**Step 1: Add schemas**

Open `/Users/mac/Documents/mpc/mpc-api/src/modules/study/validation/study.schema.ts`. The file currently ends at line 20 with `export type CreateStudyClassPayload = ...`. Add these schemas AFTER line 20:

```typescript

export const CreateStudyPlanAISchema = z.object({
    class_id: z.string().min(1, "Class ID is required"),
    prompt: z.string().min(3, "Prompt must be at least 3 characters").max(5000),
    title: z.string().max(140).optional(),
    description: z.string().max(600).optional(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    sessions_per_week: z.number().int().min(1).max(14).optional(),
    minutes_per_session: z.number().int().min(10).max(240).optional(),
});

export type CreateStudyPlanAIPayload = z.infer<typeof CreateStudyPlanAISchema>;

export const UpdateStudyTaskSchema = z.object({
    title: z.string().max(140).optional(),
    description: z.string().max(800).optional(),
    due_at: z.string().optional(),
    status: z.enum(["todo", "doing", "done", "skipped"]).optional(),
    ai_prompts: z.array(z.string()).optional(),
});

export type UpdateStudyTaskPayload = z.infer<typeof UpdateStudyTaskSchema>;

export const StudyChatSchema = z.object({
    message: z.string().min(1, "Message is required").max(5000),
    session_id: z.string().optional(),
    class_id: z.string().optional(),
});

export type StudyChatPayload = z.infer<typeof StudyChatSchema>;
```

**Step 2: Verify TypeScript compiles**

Run: `cd /Users/mac/Documents/mpc/mpc-api && npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
cd /Users/mac/Documents/mpc/mpc-api
git add src/modules/study/validation/study.schema.ts
git commit -m "feat(study): add Zod schemas for study plan, task update, and chat"
```

---

## Task 3: Add Controller Methods for Study Planner

**Files:**
- Modify: `/Users/mac/Documents/mpc/mpc-api/src/modules/study/controllers/study.controller.ts` (add 5 new methods after existing `getClass` method)

**Step 1: Update the import line and add methods**

Open `/Users/mac/Documents/mpc/mpc-api/src/modules/study/controllers/study.controller.ts`.

**EDIT 1 — Line 7:** Change the import to include new types:

Find this line:
```typescript
import { CreateStudyClassPayload } from "../validation/study.schema";
```

Replace with:
```typescript
import { CreateStudyClassPayload, CreateStudyPlanAIPayload, UpdateStudyTaskPayload, StudyChatPayload } from "../validation/study.schema";
```

**EDIT 2 — After line 124 (before the closing `}` of the class):** Add 5 new methods.

Find the last closing brace of `getClass` method (line 124: `    }`) and add these methods AFTER it but BEFORE the class closing `}` on line 125:

```typescript

    async createPlanAI(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).userId;
            if (!userId) {
                this.httpService.Response({
                    res,
                    statuscode: 401,
                    status: responseStatus.error,
                    message: "User not authenticated",
                });
                return;
            }

            const payload: CreateStudyPlanAIPayload = req.body;

            const data: any = {
                class_id: payload.class_id,
                prompt: payload.prompt,
                start_date: payload.start_date,
                end_date: payload.end_date,
            };
            if (payload.title) data.title = payload.title;
            if (payload.description) data.description = payload.description;
            if (payload.sessions_per_week) data.sessions_per_week = payload.sessions_per_week;
            if (payload.minutes_per_session) data.minutes_per_session = payload.minutes_per_session;

            const aiResponse = await this.mpcAiService.createStudyPlanAI(userId, data);

            this.httpService.Response({
                res,
                statuscode: 201,
                status: responseStatus.success,
                message: "Study plan created successfully",
                data: aiResponse,
            });
        } catch (error: any) {
            console.error("[StudyController.createPlanAI] Error:", error.message);
            this.loggerService.error(`Failed to create study plan: ${error.message}`);
            next(error);
        }
    }

    async listPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).userId;
            if (!userId) {
                this.httpService.Response({
                    res,
                    statuscode: 401,
                    status: responseStatus.error,
                    message: "User not authenticated",
                });
                return;
            }

            const classId = req.query.class_id as string | undefined;
            const status = req.query.status as string | undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

            const aiResponse = await this.mpcAiService.listStudyPlans(userId, classId, status, limit);

            this.httpService.Response({
                res,
                statuscode: 200,
                status: responseStatus.success,
                message: "Study plans fetched successfully",
                data: aiResponse,
            });
        } catch (error: any) {
            console.error("[StudyController.listPlans] Error:", error.message);
            this.loggerService.error(`Failed to list study plans: ${error.message}`);
            next(error);
        }
    }

    async getPlannerTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).userId;
            if (!userId) {
                this.httpService.Response({
                    res,
                    statuscode: 401,
                    status: responseStatus.error,
                    message: "User not authenticated",
                });
                return;
            }

            const range = (req.query.range as "week" | "month") || "month";
            const start = req.query.start as string | undefined;
            const classId = req.query.class_id as string | undefined;
            const planId = req.query.plan_id as string | undefined;

            const aiResponse = await this.mpcAiService.getStudyPlannerTasks(userId, range, start, classId, planId);

            this.httpService.Response({
                res,
                statuscode: 200,
                status: responseStatus.success,
                message: "Planner tasks fetched successfully",
                data: aiResponse,
            });
        } catch (error: any) {
            console.error("[StudyController.getPlannerTasks] Error:", error.message);
            this.loggerService.error(`Failed to get planner tasks: ${error.message}`);
            next(error);
        }
    }

    async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).userId;
            if (!userId) {
                this.httpService.Response({
                    res,
                    statuscode: 401,
                    status: responseStatus.error,
                    message: "User not authenticated",
                });
                return;
            }

            const { taskId } = req.params;
            if (!taskId) {
                this.httpService.Response({
                    res,
                    statuscode: 400,
                    status: responseStatus.error,
                    message: "Task ID is required",
                });
                return;
            }

            const payload: UpdateStudyTaskPayload = req.body;

            const patch: any = {};
            if (payload.title) patch.title = payload.title;
            if (payload.description) patch.description = payload.description;
            if (payload.due_at) patch.due_at = payload.due_at;
            if (payload.status) patch.status = payload.status;
            if (payload.ai_prompts) patch.ai_prompts = payload.ai_prompts;

            const aiResponse = await this.mpcAiService.updateStudyTask(userId, taskId, patch);

            this.httpService.Response({
                res,
                statuscode: 200,
                status: responseStatus.success,
                message: "Task updated successfully",
                data: aiResponse,
            });
        } catch (error: any) {
            console.error("[StudyController.updateTask] Error:", error.message);
            this.loggerService.error(`Failed to update task: ${error.message}`);
            next(error);
        }
    }

    async studyChat(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).userId;
            if (!userId) {
                this.httpService.Response({
                    res,
                    statuscode: 401,
                    status: responseStatus.error,
                    message: "User not authenticated",
                });
                return;
            }

            const payload: StudyChatPayload = req.body;

            const aiResponse = await this.mpcAiService.callStudyAgent(
                userId,
                payload.message,
                payload.session_id || "default",
                payload.class_id
            );

            this.httpService.Response({
                res,
                statuscode: 200,
                status: responseStatus.success,
                message: "Chat response received",
                data: aiResponse,
            });
        } catch (error: any) {
            console.error("[StudyController.studyChat] Error:", error.message);
            this.loggerService.error(`Failed to process study chat: ${error.message}`);
            next(error);
        }
    }
```

**Step 2: Verify TypeScript compiles**

Run: `cd /Users/mac/Documents/mpc/mpc-api && npx tsc --noEmit`
Expected: 0 errors

**IMPORTANT:** If you get TS2379 errors about `exactOptionalPropertyTypes`, that means you are passing `undefined` values. The fix is the conditional object building pattern we use above (`const data: any = {...}; if (payload.x) data.x = payload.x;`). This is already handled in the code above.

**Step 3: Commit**

```bash
cd /Users/mac/Documents/mpc/mpc-api
git add src/modules/study/controllers/study.controller.ts
git commit -m "feat(study): add controller methods for plans, tasks, and chat"
```

---

## Task 4: Add Routes for Study Planner

**Files:**
- Modify: `/Users/mac/Documents/mpc/mpc-api/src/modules/study/routes/study.route.ts` (add 5 new routes)

**Step 1: Update import and add routes**

Open `/Users/mac/Documents/mpc/mpc-api/src/modules/study/routes/study.route.ts`.

**EDIT 1 — Line 6:** Update the import to include new schemas:

Find:
```typescript
import { CreateStudyClassSchema } from "../validation/study.schema";
```

Replace with:
```typescript
import { CreateStudyClassSchema, CreateStudyPlanAISchema, UpdateStudyTaskSchema, StudyChatSchema } from "../validation/study.schema";
```

**EDIT 2 — After line 34 (before `export default studyRouter;` on line 36):** Add 5 new routes.

Find:
```typescript
export default studyRouter;
```

Insert these routes BEFORE that line:

```typescript

// Create a study plan with AI-generated tasks
studyRouter.post(
    "/plans/ai",
    authMiddleware,
    validationMiddleware({ body: CreateStudyPlanAISchema }),
    (req: Request, res: Response, next: NextFunction) =>
        controller.createPlanAI(req, res, next)
);

// List study plans
studyRouter.get(
    "/plans",
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
        controller.listPlans(req, res, next)
);

// Get planner tasks (calendar view)
studyRouter.get(
    "/planner",
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
        controller.getPlannerTasks(req, res, next)
);

// Update a task
studyRouter.patch(
    "/planner/tasks/:taskId",
    authMiddleware,
    validationMiddleware({ body: UpdateStudyTaskSchema }),
    (req: Request, res: Response, next: NextFunction) =>
        controller.updateTask(req, res, next)
);

// Study AI chat
studyRouter.post(
    "/chat",
    authMiddleware,
    validationMiddleware({ body: StudyChatSchema }),
    (req: Request, res: Response, next: NextFunction) =>
        controller.studyChat(req, res, next)
);

```

**Step 2: Verify TypeScript compiles**

Run: `cd /Users/mac/Documents/mpc/mpc-api && npx tsc --noEmit`
Expected: 0 errors

**Step 3: Commit**

```bash
cd /Users/mac/Documents/mpc/mpc-api
git add src/modules/study/routes/study.route.ts
git commit -m "feat(study): add routes for plans, planner tasks, and chat"
```

---

## Task 5: Rewrite CreateStudyPlanModal to Match Backend

**Files:**
- Modify: `/Users/mac/Documents/mpc/mpc-web/app/(dashboard)/study/components/CreateStudyPlanModal.tsx` (full rewrite)

**Context:** The current modal collects `title, subject, date, time, duration, priority` — all wrong fields. The backend expects `class_id, prompt, start_date, end_date, sessions_per_week, minutes_per_session`. This is a complete rewrite.

**Step 1: Rewrite the modal**

Replace the ENTIRE contents of `/Users/mac/Documents/mpc/mpc-web/app/(dashboard)/study/components/CreateStudyPlanModal.tsx` with:

```tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, BookOpen, Sparkles } from "lucide-react";
import { apiService } from "@/lib/api/apiService";

export interface NewStudyPlan {
  class_id: string;
  prompt: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  sessions_per_week: number;
  minutes_per_session: number;
}

interface StudyClass {
  id: string;
  title: string;
  subject?: string;
}

interface CreateStudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (plan: NewStudyPlan) => void;
}

export default function CreateStudyPlanModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateStudyPlanModalProps) {
  const [formData, setFormData] = useState<NewStudyPlan>({
    class_id: "",
    prompt: "",
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    sessions_per_week: 3,
    minutes_per_session: 45,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [classes, setClasses] = useState<StudyClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Fetch user's classes when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingClasses(true);
      apiService
        .get("/v1/study/classes")
        .then((res: any) => {
          const data = res?.data || res || [];
          setClasses(Array.isArray(data) ? data : []);
        })
        .catch((err: any) => {
          console.error("Failed to fetch classes:", err);
          setClasses([]);
        })
        .finally(() => setLoadingClasses(false));
    }
  }, [isOpen]);

  const sessionsOptions = [1, 2, 3, 4, 5, 6, 7];
  const minutesOptions = [15, 30, 45, 60, 90, 120];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "sessions_per_week" || name === "minutes_per_session"
          ? parseInt(value, 10)
          : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.class_id) {
      newErrors.class_id = "Please select a class";
    }
    if (!formData.prompt.trim() || formData.prompt.trim().length < 3) {
      newErrors.prompt = "Please describe what you want to study (at least 3 characters)";
    }
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }
    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      newErrors.end_date = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        class_id: "",
        prompt: "",
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        sessions_per_week: 3,
        minutes_per_session: 45,
      });
      onClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5A3FFF] to-[#300878] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Create AI Study Plan
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Class Selection */}
          <div>
            <label
              htmlFor="class_id"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              <BookOpen className="w-4 h-4 inline-block mr-1" />
              Class *
            </label>
            {loadingClasses ? (
              <div className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-400">
                Loading classes...
              </div>
            ) : classes.length === 0 ? (
              <div className="w-full px-4 py-3 rounded-xl border border-yellow-200 bg-yellow-50 text-sm text-yellow-700">
                No classes found. Please create a class first.
              </div>
            ) : (
              <select
                id="class_id"
                name="class_id"
                value={formData.class_id}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.class_id ? "border-red-300" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm bg-white`}
              >
                <option value="">Select a class...</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.title}
                    {cls.subject ? ` (${cls.subject})` : ""}
                  </option>
                ))}
              </select>
            )}
            {errors.class_id && (
              <p className="text-red-500 text-xs mt-1">{errors.class_id}</p>
            )}
          </div>

          {/* AI Prompt */}
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              What do you want to study? *
            </label>
            <textarea
              id="prompt"
              name="prompt"
              value={formData.prompt}
              onChange={handleInputChange}
              placeholder="e.g., Create a plan to study Biology Chapter 5-10 for my upcoming exam"
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.prompt ? "border-red-300" : "border-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm resize-none`}
            />
            {errors.prompt && (
              <p className="text-red-500 text-xs mt-1">{errors.prompt}</p>
            )}
          </div>

          {/* Title (optional) */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Plan Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Biology Exam Prep (auto-generated if blank)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="start_date"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                <Calendar className="w-4 h-4 inline-block mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.start_date ? "border-red-300" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm`}
              />
              {errors.start_date && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.start_date}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="end_date"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                <Calendar className="w-4 h-4 inline-block mr-1" />
                End Date *
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.end_date ? "border-red-300" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm`}
              />
              {errors.end_date && (
                <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Sessions per Week + Minutes per Session */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sessions_per_week"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Sessions / Week
              </label>
              <select
                id="sessions_per_week"
                name="sessions_per_week"
                value={formData.sessions_per_week}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm bg-white"
              >
                {sessionsOptions.map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "session" : "sessions"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="minutes_per_session"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Minutes / Session
              </label>
              <select
                id="minutes_per_session"
                name="minutes_per_session"
                value={formData.minutes_per_session}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm bg-white"
              >
                {minutesOptions.map((n) => (
                  <option key={n} value={n}>
                    {n} minutes
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description (optional) */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Any additional notes about this plan..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent transition-all text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={classes.length === 0}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#5A3FFF] to-[#300878] text-white font-medium text-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd /Users/mac/Documents/mpc/mpc-web && npx next build`
Expected: Compiles without errors (warnings are OK)

**Step 3: Commit**

```bash
cd /Users/mac/Documents/mpc/mpc-web
git add app/\(dashboard\)/study/components/CreateStudyPlanModal.tsx
git commit -m "feat(study): rewrite CreateStudyPlanModal to match backend data model"
```

---

## Task 6: Update StudyPlanCard to Display Backend Task Data

**Files:**
- Modify: `/Users/mac/Documents/mpc/mpc-web/app/(dashboard)/study/components/StudyPlanCard.tsx` (update interface and rendering)

**Context:** The current `StudyPlan` interface has `{ id, title, time, description, date, color }`. The backend returns `StudyTaskOut` with `{ id, title, description, due_at, status, plan_id, class_id, ai_prompts }`. We need the card to render backend task data. The `MonthViewCalendar` component uses this `StudyPlan` type to group items by date.

**Step 1: Rewrite the file**

Replace the ENTIRE contents of `/Users/mac/Documents/mpc/mpc-web/app/(dashboard)/study/components/StudyPlanCard.tsx` with:

```tsx
"use client";

import React from "react";

export interface StudyTask {
  id: string;
  user_id: string;
  class_id: string;
  plan_id: string;
  title: string;
  description?: string;
  due_at: string;
  ai_prompts?: string[];
  status: "todo" | "doing" | "done" | "skipped";
  created_at: string;
  updated_at: string;
}

interface StudyPlanCardProps {
  task: StudyTask;
  onEdit?: (task: StudyTask) => void;
  compact?: boolean;
}

const statusColors: Record<string, string> = {
  todo: "bg-[#E8E0FF] border-l-4 border-l-[#7C5CFF]",
  doing: "bg-[#E0F0FF] border-l-4 border-l-[#5C9CFF]",
  done: "bg-[#E0FFE8] border-l-4 border-l-[#5CFF7C]",
  skipped: "bg-[#F5F5F5] border-l-4 border-l-[#AAAAAA]",
};

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function StudyPlanCard({
  task,
  onEdit,
  compact = false,
}: StudyPlanCardProps) {
  const bgColor = statusColors[task.status] || statusColors.todo;

  if (compact) {
    return (
      <div
        className={`${bgColor} rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow`}
        onClick={() => onEdit?.(task)}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm text-gray-900 truncate flex-1">
            {task.title}
          </h4>
          <span className="text-xs text-gray-600 whitespace-nowrap">
            {formatTime(task.due_at)}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
          {task.description || ""}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${bgColor} rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow min-w-[200px] max-w-[280px]`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm text-gray-900 truncate flex-1">
          {task.title}
        </h4>
        <span className="text-xs text-gray-600 whitespace-nowrap">
          {formatTime(task.due_at)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(task);
          }}
          className="text-[#5A3FFF] text-xs font-medium hover:underline whitespace-nowrap"
        >
          Click to edit
        </button>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">
        {task.description || ""}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            task.status === "done"
              ? "bg-green-100 text-green-700"
              : task.status === "doing"
              ? "bg-blue-100 text-blue-700"
              : task.status === "skipped"
              ? "bg-gray-100 text-gray-500"
              : "bg-purple-100 text-purple-700"
          }`}
        >
          {task.status}
        </span>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
cd /Users/mac/Documents/mpc/mpc-web
git add app/\(dashboard\)/study/components/StudyPlanCard.tsx
git commit -m "feat(study): update StudyPlanCard to render backend StudyTask data"
```

---

## Task 7: Update MonthViewCalendar to Use StudyTask Type

**Files:**
- Modify: `/Users/mac/Documents/mpc/mpc-web/app/(dashboard)/study/components/MonthViewCalendar.tsx` (change from StudyPlan to StudyTask)

**Step 1: Rewrite the file**

Replace the ENTIRE contents of `/Users/mac/Documents/mpc/mpc-web/app/(dashboard)/study/components/MonthViewCalendar.tsx` with:

```tsx
"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { StudyTask } from "./StudyPlanCard";

interface MonthViewCalendarProps {
  tasks: StudyTask[];
  onEditTask?: (task: StudyTask) => void;
  onCreatePlan?: () => void;
  loading?: boolean;
}

type ViewMode = "Week view" | "Month view" | "Day view";

const dayNames = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];

const statusDotColor: Record<string, string> = {
  todo: "bg-[#7C5CFF]",
  doing: "bg-[#5C9CFF]",
  done: "bg-[#5CFF7C]",
  skipped: "bg-[#AAAAAA]",
};

export default function MonthViewCalendar({
  tasks,
  onEditTask,
  onCreatePlan,
  loading = false,
}: MonthViewCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("Month view");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getMonthStart = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);

  const getMonthEnd = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const monthStart = useMemo(() => getMonthStart(currentDate), [currentDate]);
  const monthEnd = useMemo(() => getMonthEnd(currentDate), [currentDate]);

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    let startDay = monthStart.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= monthEnd.getDate(); day++) {
      days.push(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      );
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [monthStart, monthEnd, currentDate]);

  // Group tasks by date using due_at
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, StudyTask[]> = {};
    tasks.forEach((task) => {
      const dateKey = new Date(task.due_at).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });
    return grouped;
  }, [tasks]);

  const formatDateRange = () => {
    const month = monthStart.toLocaleString("default", { month: "long" });
    const startDay = monthStart.getDate();
    const endDay = monthEnd.getDate();
    const year = monthStart.getFullYear();
    return `${month} ${startDay}-${endDay}, ${year}`;
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDayLabel = (date: Date) => {
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const weeks = useMemo(() => {
    const result: (Date | null)[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-200"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>

          <span className="text-base font-medium text-gray-900">
            {formatDateRange()}
          </span>

          {/* View mode dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              {viewMode}
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  isDropdownOpen ? "rotate-90" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                {(["Day view", "Week view", "Month view"] as ViewMode[]).map(
                  (mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setViewMode(mode);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                        viewMode === mode
                          ? "text-[#5A3FFF] font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {mode}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onCreatePlan}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#5A3FFF] to-[#300878] text-white rounded-xl font-medium text-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Study Plan
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-[#5A3FFF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Calendar Grid */}
      {!loading && (
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-t-xl overflow-hidden">
              {dayNames.map((day, index) => (
                <div
                  key={day}
                  className={`text-center py-3 px-2 font-medium text-sm ${
                    index === 0 || index === 1
                      ? "bg-[#5A3FFF] text-white"
                      : "bg-gray-50 text-gray-700"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Weeks */}
            <div className="border border-gray-100 border-t-0 rounded-b-xl overflow-hidden">
              {weeks.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  className="grid grid-cols-7 gap-px bg-gray-100"
                >
                  {week.map((date, dayIndex) => {
                    const dateKey = date?.toDateString() || "";
                    const dayTasks = tasksByDate[dateKey] || [];
                    const today = isToday(date);

                    return (
                      <div
                        key={dayIndex}
                        className={`bg-white min-h-[100px] p-2 ${
                          !date ? "bg-gray-50" : ""
                        }`}
                      >
                        {date && (
                          <>
                            <div
                              className={`text-xs font-medium mb-1 ${
                                today ? "text-[#5A3FFF]" : "text-gray-500"
                              }`}
                            >
                              {formatDayLabel(date)}
                            </div>

                            <div className="space-y-1">
                              {dayTasks.slice(0, 3).map((task) => (
                                <div
                                  key={task.id}
                                  onClick={() => onEditTask?.(task)}
                                  className={`text-xs px-2 py-1 rounded cursor-pointer truncate hover:opacity-80 transition-opacity flex items-center gap-1 ${
                                    task.status === "done"
                                      ? "bg-[#E0FFE8] text-green-700"
                                      : task.status === "doing"
                                      ? "bg-[#E0F0FF] text-[#3B82F6]"
                                      : task.status === "skipped"
                                      ? "bg-gray-100 text-gray-500"
                                      : "bg-[#E8E0FF] text-[#5A3FFF]"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                      statusDotColor[task.status] ||
                                      statusDotColor.todo
                                    }`}
                                  />
                                  <span className="truncate">{task.title}</span>
                                </div>
                              ))}
                              {dayTasks.length > 3 && (
                                <div className="text-xs text-gray-400 px-2">
                                  +{dayTasks.length - 3} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
cd /Users/mac/Documents/mpc/mpc-web
git add app/\(dashboard\)/study/components/MonthViewCalendar.tsx
git commit -m "feat(study): update MonthViewCalendar to use StudyTask type from backend"
```

---

## Task 8: Rewrite the Planner Page with Real API Calls

**Files:**
- Modify: `/Users/mac/Documents/mpc/mpc-web/app/(dashboard)/study/planner/page.tsx` (full rewrite)

**Context:** This is the main page. It must:
1. Fetch real tasks via `GET /v1/study/planner?range=month` on mount
2. Submit new plans via `POST /v1/study/plans/ai` (through the modal)
3. Send chat messages via `POST /v1/study/chat` (through the sidebar)
4. Refresh calendar after plan creation

**Step 1: Rewrite the page**

Replace the ENTIRE contents of `/Users/mac/Documents/mpc/mpc-web/app/(dashboard)/study/planner/page.tsx` with:

```tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Header from "@/app/components/header";
import StudyChatSidebar from "../components/StudyChatSidebar";
import MonthViewCalendar from "../components/MonthViewCalendar";
import CreateStudyPlanModal, {
  NewStudyPlan,
} from "../components/CreateStudyPlanModal";
import { StudyTask } from "../components/StudyPlanCard";
import { apiService } from "@/lib/api/apiService";

export default function StudyPlannerPage() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch planner tasks from backend
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await apiService.get("/v1/study/planner?range=month");
      const data = res?.data || res || [];
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch planner tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleEditTask = (task: StudyTask) => {
    // TODO: Open task detail/edit modal
    console.log("Edit task:", task);
  };

  const handleCreatePlan = () => {
    setIsModalOpen(true);
  };

  const handleSubmitPlan = async (newPlan: NewStudyPlan) => {
    try {
      await apiService.post("/v1/study/plans/ai", {
        class_id: newPlan.class_id,
        prompt: newPlan.prompt,
        title: newPlan.title || undefined,
        description: newPlan.description || undefined,
        start_date: newPlan.start_date,
        end_date: newPlan.end_date,
        sessions_per_week: newPlan.sessions_per_week,
        minutes_per_session: newPlan.minutes_per_session,
      });
      // Refresh calendar to show new tasks
      await fetchTasks();
    } catch (error) {
      console.error("Failed to create study plan:", error);
    }
  };

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      const res: any = await apiService.post("/v1/study/chat", {
        message,
      });
      const data = res?.data || res;
      return data?.message || "I understand. How can I help you with your study planning?";
    } catch (error) {
      console.error("Study chat error:", error);
      return "Sorry, I encountered an error. Please try again.";
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Study Support" />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          {/* Back button */}
          <Link href="/study">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Study Support / Study Planner</span>
            </button>
          </Link>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Chat sidebar */}
            <div className="lg:col-span-1 h-[calc(100vh-220px)] min-h-[500px]">
              <StudyChatSidebar
                title="Create study plan with Ai"
                onSendMessage={handleSendMessage}
              />
            </div>

            {/* Right column - Month View Calendar */}
            <div className="lg:col-span-2">
              <MonthViewCalendar
                tasks={tasks}
                onEditTask={handleEditTask}
                onCreatePlan={handleCreatePlan}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Create Study Plan Modal */}
      <CreateStudyPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitPlan}
      />
    </div>
  );
}
```

**Step 2: Verify it compiles**

Run: `cd /Users/mac/Documents/mpc/mpc-web && npx next build`
Expected: Compiles without errors

**Step 3: Commit**

```bash
cd /Users/mac/Documents/mpc/mpc-web
git add app/\(dashboard\)/study/planner/page.tsx
git commit -m "feat(study): rewrite planner page with real API integration"
```

---

## Task 9: Verify Everything Compiles

**Step 1: Check mpc-api**

Run: `cd /Users/mac/Documents/mpc/mpc-api && npx tsc --noEmit`
Expected: 0 errors

**Step 2: Check mpc-web**

Run: `cd /Users/mac/Documents/mpc/mpc-web && npx next build`
Expected: Compiles successfully

If there are TypeScript errors, fix them before proceeding. Common issues:
- `exactOptionalPropertyTypes` — use conditional object building pattern: `const data: any = {...}; if (x) data.x = x;`
- Import path issues — make sure all imports use the correct relative/absolute paths
- Type mismatches — the `StudyPlan` type was renamed to `StudyTask`, make sure no old references remain

---

## File Summary

| Task | Repo | Action | File Path |
|------|------|--------|-----------|
| 1 | mpc-api | EDIT | `src/common/services/mpc-ai.service.ts` (add 5 methods before class closing brace) |
| 2 | mpc-api | EDIT | `src/modules/study/validation/study.schema.ts` (add 3 new schemas) |
| 3 | mpc-api | EDIT | `src/modules/study/controllers/study.controller.ts` (add 5 new methods + update import) |
| 4 | mpc-api | EDIT | `src/modules/study/routes/study.route.ts` (add 5 new routes + update import) |
| 5 | mpc-web | REWRITE | `app/(dashboard)/study/components/CreateStudyPlanModal.tsx` |
| 6 | mpc-web | REWRITE | `app/(dashboard)/study/components/StudyPlanCard.tsx` |
| 7 | mpc-web | REWRITE | `app/(dashboard)/study/components/MonthViewCalendar.tsx` |
| 8 | mpc-web | REWRITE | `app/(dashboard)/study/planner/page.tsx` |
| 9 | both | VERIFY | TypeScript compilation checks |
