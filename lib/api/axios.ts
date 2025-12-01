import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const BASE_URL = baseURL;
export const BASE_API_URL = `${baseURL}/v1`;

const axiosInstance = axios.create({
  baseURL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const workspaceId = localStorage.getItem("lastWorkspace");
    if (workspaceId) {
      config.headers["X-Workspace-Id"] = workspaceId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Import and call logout function
        // const { logout } = await import('@/services/auth');
        // await logout();
      } catch (logoutError) {
        console.error('Logout failed:', logoutError);
        window.location.href = "/auth/sign-in";
      }
      
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
