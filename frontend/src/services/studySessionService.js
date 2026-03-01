import api from "../api/axios";

// Log a completed study session
// { subtaskId?: number, durationSeconds: number, note?: string }
export const logStudySession = async (data) => {
  const response = await api.post("/study-sessions", data);
  return response.data;
};

// Get all study sessions for today
export const getTodaySessions = async () => {
  const response = await api.get("/study-sessions/today");
  return response.data;
};
