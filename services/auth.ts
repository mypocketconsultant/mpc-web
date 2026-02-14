import { apiService } from "@/lib/api/apiService";

export const verifyAuth = async () => {
  try {
    const response = await apiService.get("/v1/auth/me");
    return { response };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
