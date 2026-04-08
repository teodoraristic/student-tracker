import api from "../api/axios";

export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const register = async (email, password, firstName, lastName) => {
  const response = await api.post("/auth/register", { email, password, firstName, lastName });
  return response.data;
};

export const validateToken = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const logoutApi = async () => {
  await api.post("/auth/logout");
};

export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  await api.post("/auth/change-password", {
    currentPassword,
    newPassword,
    confirmPassword,
  });
};

/**
 * Refresh the access token using the refresh token
 * Returns new access token and new refresh token (rotated)
 */
export const refreshAccessToken = async (refreshToken) => {
  const response = await api.post("/auth/refresh", { refreshToken });
  return response.data; // { accessToken, refreshToken }
};

export const forgotPassword = async (email) => {
  await api.post("/auth/forgot-password", { email });
};

export const resetPassword = async (token, newPassword, confirmPassword) => {
  await api.post("/auth/reset-password", { token, newPassword, confirmPassword });
};

export const deleteAccount = async () => {
  await api.delete("/auth/account");
};
