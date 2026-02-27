# Document Module Tagging Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `module` field to the `uploads` and `documents` MongoDB collections so every stored file/document knows which product module it belongs to (career, finance, business, study), and surface finance-tagged uploads on the finance resources page.

**Architecture:** The `module` field flows from the frontend request → mpc-api → mpc-ai upload/document endpoints → MongoDB. No migration is needed for old records (they'll be treated as "career" by default). The finance resources endpoint (`GET /v1/finance/resources`) gains a new `user_uploads` array by querying uploads where `module = "finance"`. The resources page renders a new "Uploaded Documents" section from that array.

**Tech Stack:** Python/FastAPI (mpc-ai), TypeScript/Node (mpc-api), Next.js 14/React (mpc-web), MongoDB (no schema migration needed — schemaless)

---

## Context for the implementor

There are three services:
- **mpc-ai** (`/Users/mac/Documents/mpc/mpc-ai`) — Python FastAPI. Source of truth for MongoDB.
- **mpc-api** (`/Users/mac/Documents/mpc/mpc-api`) — TypeScript/Express. Proxy/BFF layer. Calls mpc-ai.
- **mpc-web** (`/Users/mac/Documents/mpc/mpc-web`) — Next.js 14. Frontend.

The upload chain for resumes today:
```
mpc-web → POST /v1/resume-builder/upload (mpc-api)
       → mpc-api calls mpc-ai POST /v1/uploads/resume (FormData: file, user_id)
       → mpc-ai stores in `uploads` collection + fires Celery task
       → Celery `parse_upload` task reads upload → creates `documents` record
```

After this plan:
```
mpc-web → POST /v1/resume-builder/upload (mpc-api) [still career]
       → FormData now includes: file, user_id, module="career"
       → mpc-ai stores module on uploads record
       → Celery propagates module to documents record
```

And for finance uploads (future or any generic upload endpoint):
```
mpc-web finance page → POST /v1/uploads/resume with module="finance"
                     → uploads record gets module="finance"
                     → GET /v1/finance/resources returns user_uploads where module="finance"
```

---

## Task 1: Add `list()` method to UploadsRepo

**File:**
- Modify: `mpc-ai/mpc_ai/app/domain/repos/uploads_repo.py`

**Why:** The finance resources endpoint needs to list uploads filtered by user + module. `UploadsRepo` currently has no list method.

**Step 1: Open the file**

Read `mpc-ai/mpc_ai/app/domain/repos/uploads_repo.py` — note it ends at line 88 after `set_parsed()`.

**Step 2: Add `list()` method**

Add this method at the end of the `UploadsRepo` class (after `set_parsed`, before the end of class):

```python
def list(
    self,
    user_id: str,
    module: Optional[str] = None,
    limit: int = 50,
) -> List[Dict[str, Any]]:
    """
    List uploads for a user, optionally filtered by module.
    Returns newest first.
    """
    from typing import List  # already imported at top of file
    query: Dict[str, Any] = {"user_id": user_id}
    if module:
        query["module"] = module
    lim = max(1, min(int(limit or 50), 200))
    cur = self.col.find(query).sort([("created_at", -1)]).limit(lim)
    return list(cur)
```

Note: `Optional`, `List`, `Dict`, `Any` are already imported at the top of the file. The `from typing import List` inside the method is NOT needed — remove it. The full correct addition:

```python
def list(
    self,
    user_id: str,
    module: Optional[str] = None,
    limit: int = 50,
) -> List[Dict[str, Any]]:
    """
    List uploads for a user, optionally filtered by module.
    Returns newest first.
    """
    query: Dict[str, Any] = {"user_id": user_id}
    if module:
        query["module"] = module
    lim = max(1, min(int(limit or 50), 200))
    cur = self.col.find(query).sort([("created_at", -1)]).limit(lim)
    return list(cur)
```

**Step 3: Verify manually**

Open a Python shell in mpc-ai and confirm:
```python
from mpc_ai.app.domain.repos.uploads_repo import UploadsRepo
import inspect
print(inspect.getsource(UploadsRepo.list))
```
Expected: prints the method source without errors.

**Step 4: Commit**

```bash
cd /Users/mac/Documents/mpc/mpc-ai
git add mpc_ai/app/domain/repos/uploads_repo.py
git commit -m "feat: add UploadsRepo.list() with optional module filter"
```

---

## Task 2: Accept `module` in the upload endpoint

**Files:**
- Modify: `mpc-ai/mpc_ai/app/api/routers/uploads.py`

**Why:** The endpoint currently accepts `file` + `user_id` only. We need it to also accept an optional `module` form field (defaults to `"career"`).

**Step 1: Update the endpoint signature**

In `uploads.py`, the current signature is:
```python
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
) -> Any:
```

Change it to:
```python
async def upload_resume(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    module: str = Form("career"),
) -> Any:
```

**Step 2: Pass `module` into `create_upload()`**

Current call (lines 52-61):
```python
upload_id = uploads_repo.create_upload(
    {
        "user_id": user_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents),
        "bucket": bucket,
        "s3_key": key,
    }
)
```

Change to:
```python
upload_id = uploads_repo.create_upload(
    {
        "user_id": user_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents),
        "bucket": bucket,
        "s3_key": key,
        "module": module,
    }
)
```

**Step 3: Verify FastAPI accepts it**

Start mpc-ai (`uvicorn mpc_ai.app.main:app --reload`) and hit the docs at `http://127.0.0.1:8000/docs` — the `/v1/uploads/resume` endpoint should now show a `module` form field.

**Step 4: Commit**

```bash
cd /Users/mac/Documents/mpc/mpc-ai
git add mpc_ai/app/api/routers/uploads.py
git commit -m "feat: accept module field in upload endpoint, store on uploads record"
```

---

## Task 3: Propagate `module` through the Celery parse task

**File:**
- Modify: `mpc-ai/mpc_ai/app/services/parser/tasks.py`

**Why:** When a PDF is parsed, a `documents` record is created. That record should inherit `module` from the parent upload so documents are also tagged.

**Step 1: Find where the upload record is read**

In `tasks.py` line 38: `up = db.uploads.find_one({"_id": oid})`

**Step 2: Read module from upload, pass to doc_data**

Current `doc_data` (lines 101-110):
```python
doc_data = {
    "user_id": up["user_id"],
    "type": "resume",
    "title": up.get("filename"),
    "sections": sections,
    "meta": {
        "upload_id": str(up["_id"]),
        "original_filename": up.get("filename"),
    },
}
```

Change to:
```python
doc_data = {
    "user_id": up["user_id"],
    "type": "resume",
    "module": up.get("module", "career"),
    "title": up.get("filename"),
    "sections": sections,
    "meta": {
        "upload_id": str(up["_id"]),
        "original_filename": up.get("filename"),
    },
}
```

**Step 3: Commit**

```bash
cd /Users/mac/Documents/mpc/mpc-ai
git add mpc_ai/app/services/parser/tasks.py
git commit -m "feat: propagate module from upload to parsed document record"
```

---

## Task 4: Accept `module` in the documents create endpoint + add module filter to list

**File:**
- Modify: `mpc-ai/mpc_ai/app/api/routers/documents.py`
- Modify: `mpc-ai/mpc_ai/app/domain/repos/document_repo.py`

**Why:** When mpc-api calls `POST /v1/documents` to create a document from the resume builder form (not from file upload), it should pass `module` too. Also `GET /v1/documents/` should support `?module=career` filtering.

**Step 1: Add `module` to `CreateDocumentRequest` schema**

In `documents.py`, the current `CreateDocumentRequest` (lines 54-59):
```python
class CreateDocumentRequest(BaseModel):
    user_id: str
    type: str = "resume"
    title: Optional[str] = None
    sections: List[Any] = []
    status: Optional[str] = "draft"
```

Change to:
```python
class CreateDocumentRequest(BaseModel):
    user_id: str
    type: str = "resume"
    module: Optional[str] = "career"
    title: Optional[str] = None
    sections: List[Any] = []
    status: Optional[str] = "draft"
```

**Step 2: Pass `module` in the create handler**

Current `create_document` handler (lines 202-220) builds:
```python
doc_repo.create_document(
    {
        "user_id": payload.user_id,
        "type": payload.type,
        "title": payload.title,
        "sections": payload.sections,
        "status": payload.status,
    }
)
```

Change to:
```python
doc_repo.create_document(
    {
        "user_id": payload.user_id,
        "type": payload.type,
        "module": payload.module or "career",
        "title": payload.title,
        "sections": payload.sections,
        "status": payload.status,
    }
)
```

**Step 3: Add `module` query param to `list_documents` endpoint**

Current `list_documents` signature (line 170-176):
```python
async def list_documents(
    user_id: str,
    type: Optional[str] = None,
    limit: int = 5,
    offset: int = 0,
):
```

Change to:
```python
async def list_documents(
    user_id: str,
    type: Optional[str] = None,
    module: Optional[str] = None,
    limit: int = 5,
    offset: int = 0,
):
```

And update the call to `doc_repo.list_user_documents()`:
```python
docs = doc_repo.list_user_documents(user_id=user_id, doc_type=type, module=module, limit=limit, offset=offset)
total = doc_repo.count_user_documents(user_id=user_id, doc_type=type, module=module)
```

**Step 4: Add `module` filter to `DocumentRepo`**

In `document_repo.py`, update `list_user_documents()` (lines 58-69):

Current:
```python
def list_user_documents(
    self,
    user_id: str,
    doc_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[Dict[str, Any]]:
    query: Dict[str, Any] = {"user_id": user_id}
    if doc_type:
        query["type"] = doc_type
    cursor = self.col.find(query).sort("created_at", -1).skip(offset).limit(limit)
    return list(cursor)
```

Change to:
```python
def list_user_documents(
    self,
    user_id: str,
    doc_type: Optional[str] = None,
    module: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[Dict[str, Any]]:
    query: Dict[str, Any] = {"user_id": user_id}
    if doc_type:
        query["type"] = doc_type
    if module:
        query["module"] = module
    cursor = self.col.find(query).sort("created_at", -1).skip(offset).limit(limit)
    return list(cursor)
```

And update `count_user_documents()` (lines 71-79):

Current:
```python
def count_user_documents(
    self,
    user_id: str,
    doc_type: Optional[str] = None,
) -> int:
    query: Dict[str, Any] = {"user_id": user_id}
    if doc_type:
        query["type"] = doc_type
    return self.col.count_documents(query)
```

Change to:
```python
def count_user_documents(
    self,
    user_id: str,
    doc_type: Optional[str] = None,
    module: Optional[str] = None,
) -> int:
    query: Dict[str, Any] = {"user_id": user_id}
    if doc_type:
        query["type"] = doc_type
    if module:
        query["module"] = module
    return self.col.count_documents(query)
```

**Step 5: Commit**

```bash
cd /Users/mac/Documents/mpc/mpc-ai
git add mpc_ai/app/api/routers/documents.py mpc_ai/app/domain/repos/document_repo.py
git commit -m "feat: add module field to documents create/list, propagate through repo"
```

---

## Task 5: Update mpc-api to pass `module` when calling mpc-ai

**File:**
- Modify: `mpc-api/src/common/services/mpc-ai.service.ts`

**Why:** mpc-api is the caller that invokes mpc-ai's upload and document endpoints. It must now pass `module` in both calls. The resume builder is always `"career"`.

**Step 1: Update `uploadResume()` to accept and pass `module`**

Current signature (lines 16-21):
```typescript
async uploadResume(
    fileBuffer: Buffer,
    filename: string,
    contentType: string,
    userId: string
): Promise<any>
```

Change to:
```typescript
async uploadResume(
    fileBuffer: Buffer,
    filename: string,
    contentType: string,
    userId: string,
    module: string = "career"
): Promise<any>
```

And in the FormData block (current lines 23-28):
```typescript
const formData = new FormData();
formData.append("file", fileBuffer, {
    filename,
    contentType,
});
formData.append("user_id", userId);
```

Change to:
```typescript
const formData = new FormData();
formData.append("file", fileBuffer, {
    filename,
    contentType,
});
formData.append("user_id", userId);
formData.append("module", module);
```

**Step 2: Update `createDocument()` to accept and pass `module`**

Current signature (lines 367-372):
```typescript
async createDocument(
    userId: string,
    title: string,
    sections: Array<{ name: string; content: string }>,
    status: string = "draft"
): Promise<any>
```

Change to:
```typescript
async createDocument(
    userId: string,
    title: string,
    sections: Array<{ name: string; content: string }>,
    status: string = "draft",
    module: string = "career"
): Promise<any>
```

And update the payload (current lines 375-381):
```typescript
const payload = {
    user_id: userId,
    type: "resume",
    title,
    sections,
    status,
};
```

Change to:
```typescript
const payload = {
    user_id: userId,
    type: "resume",
    module,
    title,
    sections,
    status,
};
```

**Step 3: Verify TypeScript compiles**

```bash
cd /Users/mac/Documents/mpc/mpc-api
npx tsc --noEmit
```

Expected: no errors related to uploadResume or createDocument.

**Step 4: Commit**

```bash
cd /Users/mac/Documents/mpc/mpc-api
git add src/common/services/mpc-ai.service.ts
git commit -m "feat: pass module param to mpc-ai upload and document endpoints (default: career)"
```

---

## Task 6: Include finance uploads in `GET /v1/finance/resources`

**File:**
- Modify: `mpc-ai/mpc_ai/app/tools/finance_tools.py`

**Why:** The finance resources page should show documents the user has uploaded in the finance module, not just AI-generated reports.

**Step 1: Add `UploadsRepo` import**

At the top of `finance_tools.py`, after the existing imports, add:
```python
from mpc_ai.app.domain.repos.uploads_repo import UploadsRepo
```

**Step 2: Add `_serialize_upload()` helper**

Add this helper function near the other `_serialize_*` helpers (around line 44, after `_serialize_generated_doc`):

```python
def _serialize_upload(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": _oid_to_id(doc),
        "user_id": doc.get("user_id"),
        "filename": doc.get("filename"),
        "content_type": doc.get("content_type"),
        "size": doc.get("size"),
        "module": doc.get("module"),
        "status": doc.get("status"),
        "bucket": doc.get("bucket"),
        "s3_key": doc.get("s3_key"),
        "created_at": doc.get("created_at"),
    }
```

**Step 3: Update `finance_resources()` to include uploads**

Current endpoint (lines 364-378):
```python
@router.get("/resources")
async def finance_resources(
    user_id: str,
    window: Optional[SortWindow] = "all_time",
    limit: int = 50,
):
    _require_user_id(user_id)

    docs = FinanceDocsRepo().list(user_id=user_id, window=window or "all_time", limit=limit) or []

    return {
        "generated_documents": [_serialize_generated_doc(d) for d in docs],
        "window": window or "all_time",
    }
```

Change to:
```python
@router.get("/resources")
async def finance_resources(
    user_id: str,
    window: Optional[SortWindow] = "all_time",
    limit: int = 50,
):
    _require_user_id(user_id)

    docs = FinanceDocsRepo().list(user_id=user_id, window=window or "all_time", limit=limit) or []
    uploads = UploadsRepo().list(user_id=user_id, module="finance", limit=limit) or []

    return {
        "generated_documents": [_serialize_generated_doc(d) for d in docs],
        "user_uploads": [_serialize_upload(u) for u in uploads],
        "window": window or "all_time",
    }
```

**Step 4: Verify no import errors**

```bash
cd /Users/mac/Documents/mpc/mpc-ai
python -c "from mpc_ai.app.tools.finance_tools import finance_resources; print('OK')"
```

Expected: `OK`

**Step 5: Commit**

```bash
cd /Users/mac/Documents/mpc/mpc-ai
git add mpc_ai/app/tools/finance_tools.py
git commit -m "feat: include finance-tagged user uploads in GET /v1/finance/resources"
```

---

## Task 7: Update the finance resources page to show uploaded documents

**File:**
- Modify: `mpc-web/app/(dashboard)/financial-literacy/resources/page.tsx`

**Why:** The response from `GET /v1/finance/resources` now includes `user_uploads`. The page should render these in a new "Uploaded Documents" section.

**Step 1: Add `UserUpload` type and update `ResourcesResponse`**

Find the existing type definitions near the top of the file. Add a new type and update the response type:

```tsx
interface UserUpload {
  id: string;
  user_id: string;
  filename: string;
  content_type: string;
  size: number;
  module: string;
  status: "uploaded" | "parsing" | "parsed" | "failed";
  created_at: string;
}
```

Update `ResourcesResponse`:
```tsx
interface ResourcesResponse {
  generated_documents: GeneratedDocument[];
  user_uploads: UserUpload[];
  window: string;
}
```

**Step 2: Add state for `userUploads`**

Find where other state is declared (near `const [resourcesData, setResourcesData] = useState`) and add:

```tsx
const [userUploads, setUserUploads] = useState<UserUpload[]>([]);
```

**Step 3: Update `fetchResources` to pull `user_uploads`**

Find `fetchResources` and update where `setResourcesData` is called to also set user uploads:

```tsx
const fetchResources = useCallback(async (w: WindowFilter) => {
  const res: any = await apiService.get(`/v1/finance/resources?window=${w}&limit=100`);
  const payload = res?.data || res;
  console.log("[SavedResources] /v1/finance/resources →", payload);
  setResourcesData(payload);
  setUserUploads(payload?.user_uploads ?? []);
}, []);
```

**Step 4: Add "Uploaded Documents" section to the JSX**

Find the "Generated Documents" section in the JSX (it renders `resourcesData?.generated_documents`). After the closing `</section>` of that section, add a new section:

```tsx
{/* Uploaded Documents */}
<section className="mb-8">
  <h2 className="text-base font-semibold text-gray-800 mb-3">
    Uploaded Documents
  </h2>

  {userUploads.length === 0 ? (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
      <p className="text-sm text-gray-500">No documents uploaded in the finance module yet.</p>
    </div>
  ) : (
    <div className="space-y-2">
      {userUploads.map((upload) => (
        <div
          key={upload.id}
          className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                {upload.filename}
              </p>
              <p className="text-xs text-gray-400">
                {upload.status} · {upload.size ? `${Math.round(upload.size / 1024)} KB` : ""}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            upload.status === "parsed" ? "bg-green-50 text-green-700"
            : upload.status === "failed" ? "bg-red-50 text-red-600"
            : "bg-yellow-50 text-yellow-700"
          }`}>
            {upload.status}
          </span>
        </div>
      ))}
    </div>
  )}
</section>
```

**Step 5: Test in browser**

1. Start all three services.
2. Navigate to `http://localhost:3000/financial-literacy/resources`.
3. Open DevTools console — look for `[SavedResources] /v1/finance/resources →` log.
4. Confirm `user_uploads` is present in the response (may be empty `[]` if no finance uploads yet).
5. The "Uploaded Documents" section should render with "No documents uploaded" empty state.

**Step 6: Commit**

```bash
cd /Users/mac/Documents/mpc/mpc-web
git add app/\(dashboard\)/financial-literacy/resources/page.tsx
git commit -m "feat: show finance-tagged user uploads on resources page"
```

---

## Task 8: Update db.md documentation

**File:**
- Modify: `mpc-api/docs/db.md`

**Why:** The schema documentation should reflect the new `module` field.

**Step 1: Find the uploads collection section and add `module` field**

In `db.md`, find the `uploads` collection table/description and add:
- `module`: String — which product module this upload belongs to (e.g., `"career"`, `"finance"`, `"business"`, `"study"`)

**Step 2: Find the documents collection section and add `module` field**

In `db.md`, find the `documents` collection table/description and add:
- `module`: String — which product module this document belongs to (e.g., `"career"`, `"finance"`, `"business"`, `"study"`)

**Step 3: Commit**

```bash
cd /Users/mac/Documents/mpc/mpc-api
git add docs/db.md
git commit -m "docs: add module field to uploads and documents collection schemas"
```

---

## End-to-End Smoke Test

After all tasks are complete, do a manual smoke test:

1. **Upload a file as finance module:**
   ```bash
   curl -X POST http://127.0.0.1:8000/v1/uploads/resume \
     -F "file=@/path/to/any.pdf" \
     -F "user_id=YOUR_USER_ID" \
     -F "module=finance"
   ```
   Expected: `{"upload_id": "...", "status": "uploaded"}`

2. **Check the uploads collection in MongoDB:**
   Connect to MongoDB and run:
   ```js
   db.uploads.findOne({ module: "finance" })
   ```
   Expected: document with `module: "finance"` field.

3. **Call finance resources:**
   ```bash
   curl "http://127.0.0.1:8000/v1/finance/resources?user_id=YOUR_USER_ID"
   ```
   Expected: `{"generated_documents": [...], "user_uploads": [{"id": "...", "filename": "...", "module": "finance", ...}], "window": "all_time"}`

4. **Check UI:**
   - Go to `http://localhost:3000/financial-literacy/resources`
   - "Uploaded Documents" section should now list the uploaded file.
