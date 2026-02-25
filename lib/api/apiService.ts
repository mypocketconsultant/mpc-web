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

  async patch<T>(url: string, data: unknown, config = {}) {
    try {
      const response = await axiosInstance.patch<T>(url, data, config);
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
    // Error handling without console logging
    // Errors are re-thrown to be handled by the calling code
  }
}

export const apiService = new ApiService();
