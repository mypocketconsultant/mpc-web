import { apiService } from "@/lib/api/apiService";

export interface SwotItem {
  text: string;
  confidence?: number | null;
}

export interface SwotDocument {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
}

export async function createSwot(
  title: string,
  projectId?: string
): Promise<SwotDocument> {
  const res: any = await apiService.post("/v1/business/swots", {
    title,
    ...(projectId ? { project_id: projectId } : {}),
  });
  return res?.data ?? res;
}

export async function getSwot(swotId: string): Promise<SwotDocument> {
  const res: any = await apiService.get(`/v1/business/swots/${swotId}`);
  return res?.data ?? res;
}

export async function patchSwot(
  swotId: string,
  payload: Partial<
    Pick<SwotDocument, "title" | "strengths" | "weaknesses" | "opportunities" | "threats" | "status"> & {
      project_id: string;
    }
  >
): Promise<SwotDocument> {
  const res: any = await apiService.patch(
    `/v1/business/swots/${swotId}`,
    payload
  );
  return res?.data ?? res;
}

export async function publishSwot(swotId: string): Promise<SwotDocument> {
  const res: any = await apiService.post(
    `/v1/business/swots/${swotId}/publish`,
    {}
  );
  return res?.data ?? res;
}
