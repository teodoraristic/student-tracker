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
