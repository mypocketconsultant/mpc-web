import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const BASE_URL = baseURL;
export const BASE_API_URL = `${baseURL}/v1`;

const axiosInstance = axios.create({
  baseURL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const workspaceId = sessionStorage.getItem("lastWorkspace");
    if (workspaceId) {
      config.headers["X-Workspace-Id"] = workspaceId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Sign out from Firebase
        const { auth } = await import("@/lib/firebase");
        await auth.signOut();
      } catch (logoutError) {
        // Ignore logout errors
      } finally {
        // Always redirect to login on 401
        window.location.href = "/auth/log-in";
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
