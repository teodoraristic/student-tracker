import api from "../api/axios";

export const getAllSemesters = async () => (await api.get("/semesters")).data;
export const createSemester = async (data) => (await api.post("/semesters", data)).data;
export const updateSemester = async (id, data) => (await api.put(`/semesters/${id}`, data)).data;
export const deleteSemester = async (id) => (await api.delete(`/semesters/${id}`)).data;
