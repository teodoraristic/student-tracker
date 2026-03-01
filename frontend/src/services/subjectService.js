import api from "../api/axios";

// Get all subjects for the current user
export const getAllSubjects = async () => {
  const response = await api.get("/subjects");
  return response.data;
};

// Get a single subject by ID
export const getSubjectById = async (id) => {
  const response = await api.get(`/subjects/${id}`);
  return response.data;
};

// Create a new subject
export const createSubject = async (subjectData) => {
  const response = await api.post("/subjects", subjectData);
  return response.data;
};

// Update a subject
export const updateSubject = async (id, subjectData) => {
  const response = await api.put(`/subjects/${id}`, subjectData);
  return response.data;
};

// Delete a subject
export const deleteSubject = async (id) => {
  const response = await api.delete(`/subjects/${id}`);
  return response.data;
};

// Finalize a subject (set grade + PASSED/FAILED)
export const finalizeSubject = async (id, data) => {
  const response = await api.patch(`/subjects/${id}/finalize`, data);
  return response.data;
};

// Reset subject status back to IN_PROGRESS
export const resetSubjectStatus = async (id) => {
  const response = await api.patch(`/subjects/${id}/reset`, {});
  return response.data;
};
