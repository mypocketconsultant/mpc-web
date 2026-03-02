import { apiService } from "@/lib/api/apiService";

export interface CanvasDocument {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  blocks: Record<string, string[]>;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
}

export async function createCanvas(
  title: string,
  projectId?: string
): Promise<CanvasDocument> {
  const res: any = await apiService.post("/v1/business/canvases", {
    title,
    ...(projectId ? { project_id: projectId } : {}),
  });
  return res?.data ?? res;
}

export async function getCanvas(canvasId: string): Promise<CanvasDocument> {
  const res: any = await apiService.get(`/v1/business/canvases/${canvasId}`);
  return res?.data ?? res;
}

export async function patchCanvas(
  canvasId: string,
  payload: Partial<Pick<CanvasDocument, "title" | "blocks" | "status"> & { project_id: string }>
): Promise<CanvasDocument> {
  const res: any = await apiService.patch(
    `/v1/business/canvases/${canvasId}`,
    payload
  );
  return res?.data ?? res;
}

export async function publishCanvas(canvasId: string): Promise<CanvasDocument> {
  const res: any = await apiService.post(
    `/v1/business/canvases/${canvasId}/publish`,
    {}
  );
  return res?.data ?? res;
}

export async function deleteCanvas(canvasId: string): Promise<void> {
  await apiService.delete(`/v1/business/canvases/${canvasId}`);
}

export async function deleteSwot(swotId: string): Promise<void> {
  await apiService.delete(`/v1/business/swots/${swotId}`);
}

export async function exportCanvas(canvasId: string): Promise<{ id: string; status: string }> {
  const res: any = await apiService.post(
    `/v1/business/canvases/${canvasId}/export`,
    {}
  );
  return res?.data ?? res;
}

export async function exportSwot(swotId: string): Promise<{ id: string; status: string }> {
  const res: any = await apiService.post(
    `/v1/business/swots/${swotId}/export`,
    {}
  );
  return res?.data ?? res;
}
