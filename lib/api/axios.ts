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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { auth } = await import("@/lib/firebase");
        await auth.signOut();
      } catch {
        // Continue even if Firebase signout fails
      }

      // Clear all client-side storage
      sessionStorage.clear();
      localStorage.removeItem("signup-storage");

      window.location.href = "/auth/log-in";

      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
