import api from "../api/axios";

// Get all tasks for the current user
export const getAllTasks = async () => {
  const response = await api.get("/tasks");
  return response.data;
};

// Get all tasks for a subject
export const getTasksBySubjectId = async (subjectId) => {
  const response = await api.get(`/tasks/subject/${subjectId}`);
  return response.data;
};

// Get a single task by ID
export const getTaskById = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
};

// Create a new task (taskData should include subjectId)
export const createTask = async (taskData) => {
  const response = await api.post(`/tasks`, taskData);
  return response.data;
};

// Update a task
export const updateTask = async (taskId, taskData) => {
  const response = await api.put(`/tasks/${taskId}`, taskData);
  return response.data;
};

// Delete a task
export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

// Update task status (and optionally earnedPoints when marking DONE)
export const updateTaskStatus = async (taskId, status, earnedPoints = null) => {
  const body = { status };
  if (earnedPoints !== null && earnedPoints !== undefined) {
    body.earnedPoints = earnedPoints;
  }
  const response = await api.patch(`/tasks/${taskId}/status`, body);
  return response.data;
};
