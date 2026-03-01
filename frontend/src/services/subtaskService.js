import api from "../api/axios";

// Get all subtasks for a task
export const getSubtasksByTaskId = async (taskId) => {
  const response = await api.get(`/subtasks/task/${taskId}`);
  return response.data;
};

// Create a new subtask (subtaskData should include taskId)
export const createSubtask = async (subtaskData) => {
  const response = await api.post(`/subtasks`, subtaskData);
  return response.data;
};

// Update a subtask
export const updateSubtask = async (subtaskId, subtaskData) => {
  const response = await api.put(`/subtasks/${subtaskId}`, subtaskData);
  return response.data;
};

// Toggle subtask done status
export const toggleSubtaskDone = async (subtaskId, done) => {
  const response = await api.put(`/subtasks/${subtaskId}/done?done=${done}`);
  return response.data;
};

// Delete a subtask
export const deleteSubtask = async (subtaskId) => {
  const response = await api.delete(`/subtasks/${subtaskId}`);
  return response.data;
};

// Get all subtasks planned for a specific date (YYYY-MM-DD)
export const getSubtasksByDate = async (date) => {
  const response = await api.get(`/subtasks/planned?date=${date}`);
  return response.data;
};

// Set or clear plannedForDate for a subtask (pass null to remove from plan)
export const updateSubtaskPlan = async (subtaskId, plannedForDate) => {
  const response = await api.patch(`/subtasks/${subtaskId}/plan`, { plannedForDate });
  return response.data;
};

// Get all subtasks with no planned date (backlog)
export const getUnplannedSubtasks = async () => {
  const response = await api.get("/subtasks/unplanned");
  return response.data;
};
