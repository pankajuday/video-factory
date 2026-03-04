import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach access token to every request if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Handle FormData - remove Content-Type to let browser set it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Handle unauthorized responses globally
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const errorData = error.response?.data;
    const status = error.response?.status;
    const message = error.response?.statusText;

    if (errorData && typeof errorData === 'object' && 'message' in errorData) {
      const errorMessage = (errorData as { message: string }).message;
      window.alert(`${errorMessage} (Status: ${status})` || message);
    }

    return Promise.reject(error);
  }
);

export default api;
