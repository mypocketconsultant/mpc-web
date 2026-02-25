# Study Saved Resources — Full-Stack Implementation Plan

> **For Sonnet 4.5:** Follow this plan EXACTLY step by step. Do NOT skip steps. Do NOT improvise. Do NOT add code that is not shown here. After each step, verify your work by re-reading the file you just edited. Every code block is COPY-PASTE ready.

**Goal:** Replace the hardcoded mock data in the Saved Resources page with real API calls flowing through mpc-api to mpc-ai's MongoDB backend.

**Architecture:** mpc-web (Next.js) → mpc-api (Express/TypeScript proxy) → mpc-ai (FastAPI/Python) → MongoDB

**Repos involved:**
- `mpc-ai` = `/Users/mac/Documents/mpc/mpc-ai`
- `mpc-api` = `/Users/mac/Documents/mpc/mpc-api`
- `mpc-web` = `/Users/mac/Documents/mpc/mpc-web`

---

## STEP 1: Add `StudyResourceCreate` model to mpc-ai models

**File:** `/Users/mac/Documents/mpc/mpc-ai/mpc_ai/app/domain/models/study.py`

**WHY:** The `StudyResourceOut` model already exists (lines 121-129), but there is NO `StudyResourceCreate` input model. We need one. Also, `StudyResourceOut` is missing `description` and `updated_at` fields — we need to add them.

**WHAT TO DO:**

**Edit 1a — Update `StudyResourceOut` (lines 121-129).** Find this EXACT block:

```python
class StudyResourceOut(BaseModel):
    id: str
    user_id: str
    class_id: str
    resource_type: StudyResourceType
    name: str
    url: Optional[str] = None
    upload_id: Optional[str] = None
    created_at: datetime
```

Replace it with this EXACT block:

```python
class StudyResourceCreate(BaseModel):
    class_id: str
    resource_type: StudyResourceType = "note"
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=800)
    url: Optional[str] = Field(None, max_length=2000)
    upload_id: Optional[str] = None


class StudyResourceOut(BaseModel):
    id: str
    user_id: str
    class_id: str
    resource_type: StudyResourceType
    name: str
    description: Optional[str] = None
    url: Optional[str] = None
    upload_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
```

**VERIFY:** Read the file. Line 121 should now say `class StudyResourceCreate(BaseModel):`. The file should end around line 142. `StudyResourceOut` should have `description` and `updated_at` fields.

---

## STEP 2: Add resource repo methods to mpc-ai StudyRepo

**File:** `/Users/mac/Documents/mpc/mpc-ai/mpc_ai/app/domain/repos/study_repo.py`

**WHY:** The repo has ZERO resource methods. We need CRUD operations for the `study_resources` collection.

**WHAT TO DO:**

**Edit 2a — Add `self.resources` collection reference.** Find this EXACT block at line 44:

```python
        self.tasks = self.db["study_tasks"]
```

Add this line DIRECTLY AFTER it (so it becomes a new line 45):

```python
        self.resources = self.db["study_resources"]
```

**Edit 2b — Add 5 resource methods at the END of the file.** The file currently ends at line 246 with `return res.modified_count > 0`. Add a blank line after that, then paste this EXACT code:

```python

    # ---------------------------
    # Resources
    # ---------------------------
    def create_resource(self, user_id: str, payload: Dict[str, Any]) -> str:
        now = _now()
        doc = {
            "user_id": user_id,
            "class_id": payload["class_id"],
            "resource_type": payload.get("resource_type", "note"),
            "name": payload["name"],
            "description": payload.get("description"),
            "url": payload.get("url"),
            "upload_id": payload.get("upload_id"),
            "created_at": now,
            "updated_at": now,
        }
        res = self.resources.insert_one(doc)
        return str(res.inserted_id)

    def get_resource(self, user_id: str, resource_id: str) -> Optional[Dict[str, Any]]:
        d = self.resources.find_one({"_id": _oid(resource_id), "user_id": user_id})
        if not d:
            return None
        d["id"] = str(d["_id"])
        d.pop("_id", None)
        return d

    def list_resources(
        self,
        user_id: str,
        class_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        q: Dict[str, Any] = {"user_id": user_id}
        if class_id:
            q["class_id"] = class_id
        if resource_type:
            q["resource_type"] = resource_type

        cur = self.resources.find(q).sort("updated_at", -1).limit(limit)
        items = []
        for d in cur:
            d["id"] = str(d["_id"])
            d.pop("_id", None)
            items.append(d)
        return items

    def update_resource(
        self,
        user_id: str,
        resource_id: str,
        patch: Dict[str, Any],
    ) -> bool:
        patch["updated_at"] = _now()
        res = self.resources.update_one(
            {"_id": _oid(resource_id), "user_id": user_id},
            {"$set": patch},
        )
        return res.modified_count > 0

    def delete_resource(self, user_id: str, resource_id: str) -> bool:
        res = self.resources.delete_one(
            {"_id": _oid(resource_id), "user_id": user_id}
        )
        return res.deleted_count > 0
```

**VERIFY:** Read the file. Search for `def create_resource`. It should exist. Search for `def delete_resource`. It should exist. The `self.resources = self.db["study_resources"]` line should be right after `self.tasks`.

---

## STEP 3: Add resource REST endpoints to mpc-ai router

**File:** `/Users/mac/Documents/mpc/mpc-ai/mpc_ai/app/api/routers/study_core.py`

**WHY:** There are ZERO resource endpoints. We need 5 REST endpoints: POST, GET list, GET by ID, PATCH, DELETE.

**WHAT TO DO:**

**Edit 3a — Add imports.** Find this EXACT import block at lines 10-17:

```python
from mpc_ai.app.domain.models.study import (
    StudyClassCreate,
    StudyClassOut,
    StudyMessageOut,
    StudyPlanCreateAI,
    StudyPlanOut,
    StudyTaskOut,
)
```

Replace it with this EXACT block:

```python
from mpc_ai.app.domain.models.study import (
    StudyClassCreate,
    StudyClassOut,
    StudyMessageOut,
    StudyPlanCreateAI,
    StudyPlanOut,
    StudyResourceCreate,
    StudyResourceOut,
    StudyTaskOut,
)
```

**Edit 3b — Add 5 resource endpoints at the END of the file.** The file currently ends at line 229 with `return repo.list_plans(user_id=uid, class_id=class_id, status=status, limit=limit)`. Add a blank line after that, then paste this EXACT code:

```python


# ------------------------------------------------------------------
# Resources
# ------------------------------------------------------------------

@router.post("/resources", response_model=StudyResourceOut)
def create_resource(payload: StudyResourceCreate, user_id: str = Query(...)) -> StudyResourceOut:
    uid = user_id.strip()
    if not uid:
        raise HTTPException(status_code=400, detail="user_id is required")

    repo = StudyRepo()

    # Validate class exists
    cls = repo.get_class(uid, payload.class_id)
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    resource_id = repo.create_resource(uid, payload.model_dump())
    created = repo.get_resource(uid, resource_id)
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create resource")
    return created


@router.get("/resources", response_model=List[StudyResourceOut])
def list_resources(
    user_id: str = Query(...),
    class_id: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
) -> List[StudyResourceOut]:
    uid = user_id.strip()
    if not uid:
        raise HTTPException(status_code=400, detail="user_id is required")

    repo = StudyRepo()
    return repo.list_resources(user_id=uid, class_id=class_id, resource_type=resource_type, limit=limit)


@router.get("/resources/{resource_id}", response_model=StudyResourceOut)
def get_resource(resource_id: str, user_id: str = Query(...)) -> StudyResourceOut:
    uid = user_id.strip()
    if not uid:
        raise HTTPException(status_code=400, detail="user_id is required")

    repo = StudyRepo()
    resource = repo.get_resource(uid, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


class StudyResourceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    resource_type: Optional[str] = None
    url: Optional[str] = None


@router.patch("/resources/{resource_id}", response_model=StudyResourceOut)
def update_resource(
    resource_id: str,
    payload: StudyResourceUpdate,
    user_id: str = Query(...),
) -> StudyResourceOut:
    uid = user_id.strip()
    if not uid:
        raise HTTPException(status_code=400, detail="user_id is required")

    repo = StudyRepo()

    # Build patch dict — only include fields that were actually sent
    patch = {}
    if payload.name is not None:
        patch["name"] = payload.name
    if payload.description is not None:
        patch["description"] = payload.description
    if payload.resource_type is not None:
        patch["resource_type"] = payload.resource_type
    if payload.url is not None:
        patch["url"] = payload.url

    if not patch:
        raise HTTPException(status_code=400, detail="No fields to update")

    updated = repo.update_resource(uid, resource_id, patch)
    if not updated:
        raise HTTPException(status_code=404, detail="Resource not found")

    resource = repo.get_resource(uid, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found after update")
    return resource


@router.delete("/resources/{resource_id}")
def delete_resource(resource_id: str, user_id: str = Query(...)):
    uid = user_id.strip()
    if not uid:
        raise HTTPException(status_code=400, detail="user_id is required")

    repo = StudyRepo()
    deleted = repo.delete_resource(uid, resource_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"ok": True, "message": "Resource deleted"}
```

**VERIFY:** Read the file. Search for `def create_resource`. It should exist. Search for `def delete_resource`. It should exist. The imports should include `StudyResourceCreate` and `StudyResourceOut`.

---

## STEP 4: Update the `add_study_resource` tool in mpc-ai

**File:** `/Users/mac/Documents/mpc/mpc-ai/mpc_ai/app/tools/study_tools.py`

**WHY:** The `add_study_resource` function (lines 142-174) is a placeholder that returns `"study_resources not implemented yet"`. Now that we have real repo methods, we need to make it actually work.

**WHAT TO DO:** Find this EXACT block (lines 142-174):

```python
def add_study_resource(
    *,
    user_id: str,
    class_id: str,
    resource_type: str,
    name: str,
    url: Optional[str] = None,
    notes: Optional[str] = None,
    upload_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Placeholder until you add study_resources collection + repo methods.
    """
    if not user_id:
        return {"ok": False, "error": "user_id is required"}
    if not class_id:
        return {"ok": False, "error": "class_id is required"}
    if not name:
        return {"ok": False, "error": "name is required"}

    return {
        "ok": False,
        "error": "study_resources not implemented yet",
        "hint": "Create study_resources collection + repo, then implement this tool.",
        "payload_received": {
            "class_id": class_id,
            "resource_type": resource_type,
            "name": name,
            "url": url,
            "notes": notes,
            "upload_id": upload_id,
        },
    }
```

Replace it with this EXACT block:

```python
def add_study_resource(
    *,
    user_id: str,
    class_id: str,
    resource_type: str,
    name: str,
    description: Optional[str] = None,
    url: Optional[str] = None,
    upload_id: Optional[str] = None,
    repo: Optional[StudyRepo] = None,
) -> Dict[str, Any]:
    """
    Persists a StudyResource.
    Returns: { ok, resource_id }
    """
    r = _ensure_repo(repo)

    if not user_id:
        return {"ok": False, "error": "user_id is required"}
    if not class_id:
        return {"ok": False, "error": "class_id is required"}
    if not name:
        return {"ok": False, "error": "name is required"}

    payload: Dict[str, Any] = {
        "class_id": class_id,
        "resource_type": resource_type or "note",
        "name": name.strip(),
        "description": description,
        "url": url,
        "upload_id": upload_id,
    }

    resource_id = r.create_resource(user_id, payload)
    return {"ok": True, "resource_id": resource_id}
```

**VERIFY:** Read lines 142-175 of the file. The function should now call `r.create_resource(...)` and return `{"ok": True, "resource_id": resource_id}`. It should NOT contain the word "placeholder" or "not implemented".

---

## STEP 5: Add resource proxy methods to mpc-api MpcAiService

**File:** `/Users/mac/Documents/mpc/mpc-api/src/common/services/mpc-ai.service.ts`

**WHY:** The frontend (mpc-web) never calls mpc-ai directly. Everything goes through mpc-api. We need 5 proxy methods that forward requests to the mpc-ai endpoints we just created.

**WHAT TO DO:** The file currently ends at line 1073 with the closing `}` of the class. We need to add 5 methods BEFORE that closing brace.

Find this EXACT block at lines 1070-1073 (the end of the `callStudyAgent` method and the class):

```typescript
            throw error;
        }
    }
}
```

Replace it with this EXACT block (notice the class closing `}` is preserved at the very end):

```typescript
            throw error;
        }
    }

    // ==================== STUDY RESOURCES ====================

    async createStudyResource(
        userId: string,
        data: {
            class_id: string;
            resource_type?: string;
            name: string;
            description?: string;
            url?: string;
            upload_id?: string;
        }
    ): Promise<any> {
        try {
            const endpoint = `${this.baseUrl}/v1/study/resources?user_id=${userId}`;

            const response = await axios.post(endpoint, data, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: this.timeout,
            });

            return response.data;
        } catch (error: any) {
            console.error("[createStudyResource] Error:", error.message);
            this.loggerService.error(`Failed to create study resource: ${error.message}`);
            throw error;
        }
    }

    async listStudyResources(
        userId: string,
        classId?: string,
        resourceType?: string,
        limit: number = 50
    ): Promise<any> {
        try {
            let endpoint = `${this.baseUrl}/v1/study/resources?user_id=${userId}&limit=${limit}`;
            if (classId) endpoint += `&class_id=${classId}`;
            if (resourceType) endpoint += `&resource_type=${resourceType}`;

            const response = await axios.get(endpoint, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: this.timeout,
            });

            return response.data;
        } catch (error: any) {
            console.error("[listStudyResources] Error:", error.message);
            this.loggerService.error(`Failed to list study resources: ${error.message}`);
            throw error;
        }
    }

    async getStudyResource(userId: string, resourceId: string): Promise<any> {
        try {
            const endpoint = `${this.baseUrl}/v1/study/resources/${resourceId}?user_id=${userId}`;

            const response = await axios.get(endpoint, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: this.timeout,
            });

            return response.data;
        } catch (error: any) {
            console.error("[getStudyResource] Error:", error.message);
            this.loggerService.error(`Failed to get study resource: ${error.message}`);
            throw error;
        }
    }

    async updateStudyResource(
        userId: string,
        resourceId: string,
        patch: {
            name?: string;
            description?: string;
            resource_type?: string;
            url?: string;
        }
    ): Promise<any> {
        try {
            const endpoint = `${this.baseUrl}/v1/study/resources/${resourceId}?user_id=${userId}`;

            const response = await axios.patch(endpoint, patch, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: this.timeout,
            });

            return response.data;
        } catch (error: any) {
            console.error("[updateStudyResource] Error:", error.message);
            this.loggerService.error(`Failed to update study resource: ${error.message}`);
            throw error;
        }
    }

    async deleteStudyResource(userId: string, resourceId: string): Promise<any> {
        try {
            const endpoint = `${this.baseUrl}/v1/study/resources/${resourceId}?user_id=${userId}`;

            const response = await axios.delete(endpoint, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: this.timeout,
            });

            return response.data;
        } catch (error: any) {
            console.error("[deleteStudyResource] Error:", error.message);
            this.loggerService.error(`Failed to delete study resource: ${error.message}`);
            throw error;
        }
    }
}
```

**VERIFY:** Read the last 20 lines of the file. The last method should be `deleteStudyResource`. The file should end with a single closing `}` on its own line (the class closing brace). There should NOT be two closing `}` braces in a row. Count them carefully.

---

## STEP 6: Add resource validation schemas to mpc-api

**File:** `/Users/mac/Documents/mpc/mpc-api/src/modules/study/validation/study.schema.ts`

**WHY:** We need Zod schemas to validate incoming request bodies for create and update resource endpoints.

**WHAT TO DO:** The file currently ends at line 54 with `export type StudyChatPayload = z.infer<typeof StudyChatSchema>;`. Add the following AFTER that line:

```typescript

export const CreateStudyResourceSchema = z.object({
    class_id: z.string().min(1, "Class ID is required"),
    resource_type: z.enum(["pdf", "docx", "mp3", "image", "note", "link", "other"]).default("note"),
    name: z.string().min(1, "Name is required").max(200, "Name must be less than 200 characters"),
    description: z.string().max(800, "Description must be less than 800 characters").optional(),
    url: z.string().max(2000, "URL must be less than 2000 characters").optional(),
    upload_id: z.string().optional(),
});

export type CreateStudyResourcePayload = z.infer<typeof CreateStudyResourceSchema>;

export const UpdateStudyResourceSchema = z.object({
    name: z.string().min(1, "Name must not be empty").max(200, "Name must be less than 200 characters").optional(),
    description: z.string().max(800, "Description must be less than 800 characters").optional(),
    resource_type: z.enum(["pdf", "docx", "mp3", "image", "note", "link", "other"]).optional(),
    url: z.string().max(2000, "URL must be less than 2000 characters").optional(),
});

export type UpdateStudyResourcePayload = z.infer<typeof UpdateStudyResourceSchema>;
```

**VERIFY:** Read the file. It should now export 6 schemas: `CreateStudyClassSchema`, `CreateStudyPlanAISchema`, `UpdateStudyTaskSchema`, `StudyChatSchema`, `CreateStudyResourceSchema`, `UpdateStudyResourceSchema`. And 6 types.

---

## STEP 7: Add resource controller methods to mpc-api

**File:** `/Users/mac/Documents/mpc/mpc-api/src/modules/study/controllers/study.controller.ts`

**WHY:** We need controller methods that handle HTTP requests, validate auth, call the proxy service, and return responses.

**WHAT TO DO:**

**Edit 7a — Update the import line.** Find this EXACT line 7:

```typescript
import { CreateStudyClassPayload, CreateStudyPlanAIPayload, UpdateStudyTaskPayload, StudyChatPayload } from "../validation/study.schema";
```

Replace it with:

```typescript
import { CreateStudyClassPayload, CreateStudyPlanAIPayload, UpdateStudyTaskPayload, StudyChatPayload, CreateStudyResourcePayload, UpdateStudyResourcePayload } from "../validation/study.schema";
```

**Edit 7b — Add 5 resource methods at the END of the class.** Find the closing `}` of the `studyChat` method AND the closing `}` of the class. Currently lines 318-319 look like:

```typescript
    }
}
```

Replace those two lines with the following (the class closing `}` is preserved at the very end):

```typescript
    }

    async createResource(req: Request, res: Response, next: NextFunction): Promise<void> {
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

            const payload: CreateStudyResourcePayload = req.body;

            const data: any = {
                class_id: payload.class_id,
                name: payload.name,
            };
            if (payload.resource_type) data.resource_type = payload.resource_type;
            if (payload.description) data.description = payload.description;
            if (payload.url) data.url = payload.url;
            if (payload.upload_id) data.upload_id = payload.upload_id;

            const aiResponse = await this.mpcAiService.createStudyResource(userId, data);

            this.httpService.Response({
                res,
                statuscode: 201,
                status: responseStatus.success,
                message: "Resource created successfully",
                data: aiResponse,
            });
        } catch (error: any) {
            console.error("[StudyController.createResource] Error:", error.message);
            this.loggerService.error(`Failed to create study resource: ${error.message}`);
            next(error);
        }
    }

    async listResources(req: Request, res: Response, next: NextFunction): Promise<void> {
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
            const resourceType = req.query.resource_type as string | undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

            const aiResponse = await this.mpcAiService.listStudyResources(userId, classId, resourceType, limit);

            this.httpService.Response({
                res,
                statuscode: 200,
                status: responseStatus.success,
                message: "Resources fetched successfully",
                data: aiResponse,
            });
        } catch (error: any) {
            console.error("[StudyController.listResources] Error:", error.message);
            this.loggerService.error(`Failed to list study resources: ${error.message}`);
            next(error);
        }
    }

    async getResource(req: Request, res: Response, next: NextFunction): Promise<void> {
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

            const { resourceId } = req.params;
            if (!resourceId) {
                this.httpService.Response({
                    res,
                    statuscode: 400,
                    status: responseStatus.error,
                    message: "Resource ID is required",
                });
                return;
            }

            const aiResponse = await this.mpcAiService.getStudyResource(userId, resourceId);

            this.httpService.Response({
                res,
                statuscode: 200,
                status: responseStatus.success,
                message: "Resource fetched successfully",
                data: aiResponse,
            });
        } catch (error: any) {
            console.error("[StudyController.getResource] Error:", error.message);
            this.loggerService.error(`Failed to get study resource: ${error.message}`);
            next(error);
        }
    }

    async updateResource(req: Request, res: Response, next: NextFunction): Promise<void> {
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

            const { resourceId } = req.params;
            if (!resourceId) {
                this.httpService.Response({
                    res,
                    statuscode: 400,
                    status: responseStatus.error,
                    message: "Resource ID is required",
                });
                return;
            }

            const payload: UpdateStudyResourcePayload = req.body;

            const patch: any = {};
            if (payload.name) patch.name = payload.name;
            if (payload.description) patch.description = payload.description;
            if (payload.resource_type) patch.resource_type = payload.resource_type;
            if (payload.url) patch.url = payload.url;

            const aiResponse = await this.mpcAiService.updateStudyResource(userId, resourceId, patch);

            this.httpService.Response({
                res,
                statuscode: 200,
                status: responseStatus.success,
                message: "Resource updated successfully",
                data: aiResponse,
            });
        } catch (error: any) {
            console.error("[StudyController.updateResource] Error:", error.message);
            this.loggerService.error(`Failed to update study resource: ${error.message}`);
            next(error);
        }
    }

    async deleteResource(req: Request, res: Response, next: NextFunction): Promise<void> {
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

            const { resourceId } = req.params;
            if (!resourceId) {
                this.httpService.Response({
                    res,
                    statuscode: 400,
                    status: responseStatus.error,
                    message: "Resource ID is required",
                });
                return;
            }

            const aiResponse = await this.mpcAiService.deleteStudyResource(userId, resourceId);

            this.httpService.Response({
                res,
                statuscode: 200,
                status: responseStatus.success,
                message: "Resource deleted successfully",
                data: aiResponse,
            });
        } catch (error: any) {
            console.error("[StudyController.deleteResource] Error:", error.message);
            this.loggerService.error(`Failed to delete study resource: ${error.message}`);
            next(error);
        }
    }
}
```

**VERIFY:** Read the file. The import on line 7 should include `CreateStudyResourcePayload` and `UpdateStudyResourcePayload`. The last method before the class closing `}` should be `deleteResource`. There should be exactly ONE closing `}` at the end (the class brace). Count carefully.

---

## STEP 8: Add resource routes to mpc-api

**File:** `/Users/mac/Documents/mpc/mpc-api/src/modules/study/routes/study.route.ts`

**WHY:** We need to wire the controller methods to HTTP routes.

**WHAT TO DO:**

**Edit 8a — Update the import line.** Find this EXACT line 6:

```typescript
import { CreateStudyClassSchema, CreateStudyPlanAISchema, UpdateStudyTaskSchema, StudyChatSchema } from "../validation/study.schema";
```

Replace it with:

```typescript
import { CreateStudyClassSchema, CreateStudyPlanAISchema, UpdateStudyTaskSchema, StudyChatSchema, CreateStudyResourceSchema, UpdateStudyResourceSchema } from "../validation/study.schema";
```

**Edit 8b — Add resource routes at the END.** The file currently ends at line 79 with `export default studyRouter;`. Find that line and add the following BEFORE it (so the export remains the last line):

```typescript

// Create a new resource
studyRouter.post(
    "/resources",
    authMiddleware,
    validationMiddleware({ body: CreateStudyResourceSchema }),
    (req: Request, res: Response, next: NextFunction) =>
        controller.createResource(req, res, next)
);

// List resources for the authenticated user
studyRouter.get(
    "/resources",
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
        controller.listResources(req, res, next)
);

// Get a specific resource by ID
studyRouter.get(
    "/resources/:resourceId",
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
        controller.getResource(req, res, next)
);

// Update a resource
studyRouter.patch(
    "/resources/:resourceId",
    authMiddleware,
    validationMiddleware({ body: UpdateStudyResourceSchema }),
    (req: Request, res: Response, next: NextFunction) =>
        controller.updateResource(req, res, next)
);

// Delete a resource
studyRouter.delete(
    "/resources/:resourceId",
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) =>
        controller.deleteResource(req, res, next)
);

export default studyRouter;
```

**IMPORTANT:** Make sure you REMOVED the old `export default studyRouter;` that was on line 79. There should be exactly ONE `export default studyRouter;` at the end.

**VERIFY:** Read the file. There should be exactly ONE `export default studyRouter;` at the very end. The routes should include `/resources`, `/resources/:resourceId` (GET, PATCH, DELETE).

---

## STEP 9: Replace mock data in the frontend Saved Resources page

**File:** `/Users/mac/Documents/mpc/mpc-web/app/(dashboard)/study/saved-resources/page.tsx`

**WHY:** This page currently uses hardcoded mock data. We need to replace it with real API calls.

**WHAT TO DO:** Replace the ENTIRE file contents with this:

```tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Search,
  Bookmark,
  FileText,
  Video,
  Link as LinkIcon,
  Image as ImageIcon,
  Music,
  File,
  StickyNote,
  MoreVertical,
  Trash2,
  ExternalLink,
  Calendar,
  Filter,
  Loader2,
  Plus,
} from "lucide-react";
import Header from "@/app/components/header";
import { apiService } from "@/lib/api/apiService";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/Toast";

interface Resource {
  id: string;
  user_id: string;
  class_id: string;
  resource_type: "pdf" | "docx" | "mp3" | "image" | "note" | "link" | "other";
  name: string;
  description?: string;
  url?: string;
  upload_id?: string;
  created_at: string;
  updated_at: string;
}

interface StudyClass {
  id: string;
  title: string;
  subject?: string;
}

const resourceTypeIcons: Record<string, React.ElementType> = {
  pdf: FileText,
  docx: FileText,
  mp3: Music,
  image: ImageIcon,
  note: StickyNote,
  link: LinkIcon,
  other: File,
};

const resourceTypeColors: Record<string, string> = {
  pdf: "bg-red-100 text-red-600",
  docx: "bg-blue-100 text-blue-600",
  mp3: "bg-orange-100 text-orange-600",
  image: "bg-purple-100 text-purple-600",
  note: "bg-yellow-100 text-yellow-600",
  link: "bg-green-100 text-green-600",
  other: "bg-gray-100 text-gray-600",
};

const resourceTypeLabels: Record<string, string> = {
  pdf: "PDF",
  docx: "Document",
  mp3: "Audio",
  image: "Image",
  note: "Note",
  link: "Link",
  other: "Other",
};

export default function SavedResourcesPage() {
  const { toast, showToast, hideToast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [classes, setClasses] = useState<StudyClass[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Build class_id → class title lookup
  const classTitles: Record<string, string> = {};
  classes.forEach((c) => {
    classTitles[c.id] = c.title;
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resourcesRes, classesRes] = await Promise.all([
        apiService.get("/v1/study/resources") as Promise<any>,
        apiService.get("/v1/study/classes") as Promise<any>,
      ]);

      const resourcesData = resourcesRes?.data || resourcesRes || [];
      setResources(Array.isArray(resourcesData) ? resourcesData : []);

      const classesData = classesRes?.data || classesRes || [];
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter resources client-side
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "all" || resource.resource_type === selectedType;
    const matchesClass =
      selectedClass === "all" || resource.class_id === selectedClass;
    return matchesSearch && matchesType && matchesClass;
  });

  const handleDeleteResource = async (id: string) => {
    setDeletingId(id);
    setOpenMenuId(null);
    try {
      await apiService.delete(`/v1/study/resources/${id}`);
      setResources((prev) => prev.filter((r) => r.id !== id));
      showToast("success", "Resource deleted.");
    } catch (error) {
      console.error("Failed to delete resource:", error);
      showToast("error", "Failed to delete resource.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Toast toast={toast} onClose={hideToast} />
      <Header title="Study Support" />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6">
          {/* Back button */}
          <Link href="/study">
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#5A3FFF] mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Study Support / Saved Resources</span>
            </button>
          </Link>

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5A3FFF] to-[#300878] flex items-center justify-center">
                <Bookmark className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Saved Resources
                </h1>
                <p className="text-gray-500 text-sm">
                  {loading ? "Loading..." : `${resources.length} resources saved`}
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] focus:border-transparent text-sm"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-sm bg-white min-w-[140px]"
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="docx">Document</option>
                  <option value="mp3">Audio</option>
                  <option value="image">Image</option>
                  <option value="note">Note</option>
                  <option value="link">Link</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Class Filter */}
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5A3FFF] text-sm bg-white min-w-[140px]"
              >
                <option value="all">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#5A3FFF] animate-spin" />
            </div>
          )}

          {/* Resources Grid */}
          {!loading && filteredResources.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => {
                const IconComponent =
                  resourceTypeIcons[resource.resource_type] || resourceTypeIcons.other;
                const colorClasses =
                  resourceTypeColors[resource.resource_type] || resourceTypeColors.other;
                const isDeleting = deletingId === resource.id;

                return (
                  <div
                    key={resource.id}
                    className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group ${
                      isDeleting ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${colorClasses} flex items-center justify-center`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {/* More Menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === resource.id ? null : resource.id
                            )
                          }
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>

                        {openMenuId === resource.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[140px]">
                            {resource.url && (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Open Link
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteResource(resource.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {resource.name}
                    </h3>
                    {resource.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {resource.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs font-medium text-[#5A3FFF] bg-[#F3F0FF] px-2.5 py-1 rounded-full truncate max-w-[120px]">
                        {classTitles[resource.class_id] || resource.resource_type}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(resource.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredResources.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8E0FF] to-[#F3F0FF] flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-[#5A3FFF]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No resources found
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {searchQuery || selectedType !== "all" || selectedClass !== "all"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Start saving resources from your study sessions to access them later."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
```

**VERIFY:** Read the file. Line 1 should be `"use client";`. It should import `apiService` from `@/lib/api/apiService`. It should import `useToast` and `Toast`. It should NOT contain the word `sampleResources` or any hardcoded mock data array. The `fetchData` function should call `apiService.get("/v1/study/resources")` and `apiService.get("/v1/study/classes")`.

---

## STEP 10: Update db.md to document study_resources collection

**File:** `/Users/mac/Documents/mpc/mpc-api/docs/db.md`

**WHY:** The study_resources collection needs to be documented.

**WHAT TO DO:** Find this EXACT block at lines 316-320 (the end of the study_tasks section):

```markdown
**Relationships**:
- Links to users table via user_id field
- Links to study_classes collection via class_id field
- Links to study_plans collection via plan_id field
```

Add this DIRECTLY AFTER it:

```markdown

---

### Collection: study_resources
This collection stores study resources (documents, links, notes, images, audio) saved by students for their classes.

- **_id**: unique identifier for the resource (MongoDB ObjectId)
- **user_id**: the ID of the student who saved this resource
- **class_id**: the ID of the class this resource belongs to (links to study_classes collection)
- **resource_type**: the type of resource - "pdf", "docx", "mp3", "image", "note", "link", or "other"
- **name**: the name/title of the resource (e.g., "Biology Chapter 5 Notes")
- **description**: optional description of what the resource contains
- **url**: optional URL for link-type resources or external references
- **upload_id**: optional ID linking to the uploads collection (for uploaded files)
- **created_at**: when this resource was saved
- **updated_at**: when this resource was last updated

**Relationships**:
- Links to users table via user_id field
- Links to study_classes collection via class_id field
- Can link to uploads collection via upload_id field
```

Also, find this EXACT block in the relationships summary section (around line 343):

```markdown
- study_plans._id → study_tasks.plan_id (one plan has many tasks)
```

Add this line DIRECTLY AFTER it:

```markdown
- study_classes._id → study_resources.class_id (one class has many resources)
```

Also, update the study_classes relationships section. Find this EXACT block (around line 254-258):

```markdown
**Relationships**:
- Links to users table via user_id field
- One class can have many messages (one-to-many relationship via class_id in study_messages collection)
- One class can have many plans (one-to-many relationship via class_id in study_plans collection)
- One class can have many tasks (one-to-many relationship via class_id in study_tasks collection)
```

Replace it with:

```markdown
**Relationships**:
- Links to users table via user_id field
- One class can have many messages (one-to-many relationship via class_id in study_messages collection)
- One class can have many plans (one-to-many relationship via class_id in study_plans collection)
- One class can have many tasks (one-to-many relationship via class_id in study_tasks collection)
- One class can have many resources (one-to-many relationship via class_id in study_resources collection)
```

**VERIFY:** Search the file for "study_resources". It should appear multiple times: in the new collection section, in the relationships summary, and in the study_classes relationships.

---

## VERIFICATION CHECKLIST

After completing ALL steps, run these checks:

### Check 1: mpc-api TypeScript compilation
```bash
cd /Users/mac/Documents/mpc/mpc-api && npx tsc --noEmit
```
Expected: No new errors (only pre-existing ones if any).

### Check 2: mpc-web Next.js build
```bash
cd /Users/mac/Documents/mpc/mpc-web && npx next build
```
Expected: Should compile the saved-resources page with no errors.

### Check 3: Verify file changes
Read each modified file and confirm:
- [ ] `mpc-ai/app/domain/models/study.py` has `StudyResourceCreate` AND updated `StudyResourceOut` with `description` and `updated_at`
- [ ] `mpc-ai/app/domain/repos/study_repo.py` has `self.resources` collection AND 5 methods: `create_resource`, `get_resource`, `list_resources`, `update_resource`, `delete_resource`
- [ ] `mpc-ai/app/api/routers/study_core.py` imports `StudyResourceCreate, StudyResourceOut` AND has 5 endpoints: POST/GET/GET-by-id/PATCH/DELETE for `/resources`
- [ ] `mpc-ai/app/tools/study_tools.py` `add_study_resource` function calls `r.create_resource(...)` NOT the old placeholder
- [ ] `mpc-api/src/common/services/mpc-ai.service.ts` has 5 new methods: `createStudyResource`, `listStudyResources`, `getStudyResource`, `updateStudyResource`, `deleteStudyResource`
- [ ] `mpc-api/src/modules/study/validation/study.schema.ts` has `CreateStudyResourceSchema` and `UpdateStudyResourceSchema`
- [ ] `mpc-api/src/modules/study/controllers/study.controller.ts` imports the new payload types AND has 5 new methods
- [ ] `mpc-api/src/modules/study/routes/study.route.ts` imports the new schemas AND has 5 new routes AND exactly ONE `export default`
- [ ] `mpc-web/app/(dashboard)/study/saved-resources/page.tsx` uses `apiService.get("/v1/study/resources")` NOT mock data
- [ ] `mpc-api/docs/db.md` has the `study_resources` collection documented

---

## FILE SUMMARY

| Step | Repo | Action | File Path |
|------|------|--------|-----------|
| 1 | mpc-ai | EDIT | `app/domain/models/study.py` — add `StudyResourceCreate`, update `StudyResourceOut` |
| 2 | mpc-ai | EDIT | `app/domain/repos/study_repo.py` — add `self.resources` + 5 CRUD methods |
| 3 | mpc-ai | EDIT | `app/api/routers/study_core.py` — add imports + 5 REST endpoints |
| 4 | mpc-ai | EDIT | `app/tools/study_tools.py` — replace placeholder with real implementation |
| 5 | mpc-api | EDIT | `src/common/services/mpc-ai.service.ts` — add 5 proxy methods before class `}` |
| 6 | mpc-api | EDIT | `src/modules/study/validation/study.schema.ts` — add 2 new schemas |
| 7 | mpc-api | EDIT | `src/modules/study/controllers/study.controller.ts` — update import + add 5 methods |
| 8 | mpc-api | EDIT | `src/modules/study/routes/study.route.ts` — update import + add 5 routes |
| 9 | mpc-web | REWRITE | `app/(dashboard)/study/saved-resources/page.tsx` — replace entire file |
| 10 | mpc-api | EDIT | `docs/db.md` — add study_resources collection + update relationships |
