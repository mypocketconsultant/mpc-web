import axiosInstance from "./axios";


class ApiService {
  async get<T>(url: string, config = {}) {
    try {
      const response = await axiosInstance.get<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async post<T>(url: string, data: unknown, config = {}) {
    try {
      const response = await axiosInstance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async put<T>(url: string, data: unknown, config = {}) {
    try {
      const response = await axiosInstance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async delete<T>(url: string, config = {}) {
    try {
      const response = await axiosInstance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const axiosError = error as { response: { data: unknown } };
      console.error("Response Error:", axiosError.response.data);
    } else if (error && typeof error === "object" && "request" in error) {
      // The request was made but no response was received
      const axiosError = error as { request: unknown };
      console.error("Request Error:", axiosError.request);
    } else if (error instanceof Error) {
      // Something happened in setting up the request that triggered an Error
      console.error("Error:", error.message);
    } else {
      console.error("Unknown Error:", error);
    }
  }
}

export const apiService = new ApiService();
