import api from "../api/axios";

export const getTaskBreakdown = async (taskId, description) => {
  const response = await api.post(`/ai/breakdown/${taskId}`, description ? { description } : {});
  return response.data; // { subtasks: string[] }
};

export const getRiskAssessment = async () => {
  const response = await api.get("/ai/risk");
  return response.data; // RiskItem[]
};
