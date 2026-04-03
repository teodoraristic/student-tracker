import axios from "axios";
import { handleRequestError } from "../utils/errorHandler";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api"
});

let refreshPromise = null; // Queue refresh requests to prevent multiple refresh calls

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Error interceptor - catch all errors and handle them
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - try to refresh token if not already attempted
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Queue refresh requests - if already refreshing, wait for it
        if (!refreshPromise) {
          refreshPromise = refreshToken();
        }

        const { accessToken, refreshToken: newRefreshToken } = await refreshPromise;

        // Update tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Update auth header and retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        error.userMessage = handleRequestError(refreshError);
        return Promise.reject(error);
      } finally {
        refreshPromise = null;
      }
    }

    // Re-throw error with user-friendly message attached
    error.userMessage = handleRequestError(error);
    return Promise.reject(error);
  }
);

/**
 * Refreshes the access token using the stored refresh token
 */
async function refreshToken() {
  const refreshTokenValue = localStorage.getItem("refreshToken");

  if (!refreshTokenValue) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post(
    `${import.meta.env.VITE_API_URL || "http://localhost:8080/api"}/auth/refresh`,
    { refreshToken: refreshTokenValue }
  );

  return response.data; // { accessToken, refreshToken }
}

export default api;