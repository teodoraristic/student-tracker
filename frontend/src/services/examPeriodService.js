import api from "../api/axios";

export const getAllExamPeriods = async () => (await api.get("/exam-periods")).data;
export const createExamPeriod = async (data) => (await api.post("/exam-periods", data)).data;
export const updateExamPeriod = async (id, data) => (await api.put(`/exam-periods/${id}`, data)).data;
export const deleteExamPeriod = async (id) => (await api.delete(`/exam-periods/${id}`)).data;
