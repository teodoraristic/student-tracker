import { useState, useEffect } from "react";
import SubtaskForm from "../subtasks/SubtaskForm";
import TaskForm from "./TaskForm";
import Modal from "../common/Modal";
import { ChevronDown, ChevronRight, Calendar, Award, CheckCircle2, Circle, Plus, Edit2, Trash2, X } from "lucide-react";
import { updateTask, updateTaskStatus, deleteTask } from "../../services/taskService";
import { getSubtasksByTaskId, createSubtask, toggleSubtaskDone, deleteSubtask, updateSubtaskPlan } from "../../services/subtaskService";

export default function TaskRow({ task, onTaskUpdate, onTaskDelete }) {
  const [open, setOpen] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [subtasksLoaded, setSubtasksLoaded] = useState(false);
  const [isAddSubtaskModalOpen, setIsAddSubtaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [earnedPointsInput, setEarnedPointsInput] = useState("");
  const [planningSubtaskId, setPlanningSubtaskId] = useState(null);

  useEffect(() => {
    if (open && !subtasksLoaded) {
      const fetchSubtasks = async () => {
        try {
          const data = await getSubtasksByTaskId(task.id);
          setSubtasks(data);
        } catch (err) {
          console.error("Failed to fetch subtasks:", err);
        } finally {
          setSubtasksLoaded(true);
        }
      };
      fetchSubtasks();
    }
  }, [open, subtasksLoaded, task.id]);

  const completedSubtasks = subtasks.filter(s => s.done).length;

  const handleToggleSubtask = async (subtaskId) => {
    const subtask = subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;
    try {
      const updated = await toggleSubtaskDone(subtaskId, !subtask.done);
      setSubtasks(prev => prev.map(s => s.id === subtaskId ? updated : s));
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
    }
  };

  const handleDeleteSubtask = async (e, subtaskId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this subtask?")) return;
    try {
      await deleteSubtask(subtaskId);
      setSubtasks(prev => prev.filter(s => s.id !== subtaskId));
    } catch (err) {
      console.error("Failed to delete subtask:", err);
    }
  };

  const handlePlanSubtask = async (subtaskId, dateStr) => {
    try {
      const updated = await updateSubtaskPlan(subtaskId, dateStr || null);
      setSubtasks(prev => prev.map(s => s.id === subtaskId ? { ...s, plannedForDate: updated.plannedForDate } : s));
    } catch (err) {
      console.error("Failed to update plan:", err);
    }
    setPlanningSubtaskId(null);
  };

  const handleAddSubtask = async (formData) => {
    try {
      const newSubtask = await createSubtask({ ...formData, taskId: task.id });
      setSubtasks([...subtasks, newSubtask]);
      setIsAddSubtaskModalOpen(false);
    } catch (err) {
      console.error("Failed to create subtask:", err);
      alert("Failed to create subtask. Please try again.");
    }
  };

  const handleEditTask = async (formData) => {
    try {
      const updatedTask = await updateTask(task.id, { ...formData, subjectId: task.subjectId });
      if (onTaskUpdate) onTaskUpdate(updatedTask);
      setIsEditTaskModalOpen(false);
    } catch (err) {
      console.error("Failed to update task:", err);
      alert("Failed to update assignment. Please try again.");
    }
  };

  const handleDeleteTask = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await deleteTask(task.id);
      if (onTaskDelete) onTaskDelete(task.id);
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert("Failed to delete assignment. Please try again.");
    }
  };

  const handleToggleStatus = async (e) => {
    e.stopPropagation();
    if (task.status === "DONE") {
      try {
        const updatedTask = await updateTaskStatus(task.id, "TODO");
        if (onTaskUpdate) onTaskUpdate(updatedTask);
      } catch (err) {
        console.error("Failed to update task status:", err);
      }
    } else {
      if (task.points) {
        setEarnedPointsInput(String(task.points));
        setIsPointsModalOpen(true);
      } else {
        try {
          const updatedTask = await updateTaskStatus(task.id, "DONE");
          if (onTaskUpdate) onTaskUpdate(updatedTask);
        } catch (err) {
          console.error("Failed to update task status:", err);
        }
      }
    }
  };

  const handleConfirmPoints = async () => {
    const earned = earnedPointsInput ? parseInt(earnedPointsInput) : 0;
    try {
      const updatedTask = await updateTaskStatus(task.id, "DONE", earned);
      if (onTaskUpdate) onTaskUpdate(updatedTask);
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
    setIsPointsModalOpen(false);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = task.status !== "DONE" && task.dueDate && new Date(task.dueDate) < today;

  const priorityColors = {
    LOW:    { bg: "#dcfce7", text: "#16a34a" },
    MEDIUM: { bg: "#fef3c7", text: "#d97706" },
    HIGH:   { bg: "#fee2e2", text: "#dc2626" },
  };
  const typeColor = priorityColors[task.priority] || { bg: "#f5f5f5", text: "#737373" };

  const isDone = task.status === "DONE";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      if (isDone) return { text: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), color: "#a3a3a3" };
      return { text: `${Math.abs(diffDays)}d overdue`, color: "#dc2626" };
    }
    if (diffDays === 0) return { text: "Due today", color: "#d97706" };
    if (diffDays === 1) return { text: "Due tomorrow", color: "#d97706" };
    if (diffDays <= 7) return { text: `${diffDays}d left`, color: "#2563eb" };
    return { text: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), color: "#737373" };
  };

  const dueDate = task.dueDate ? formatDate(task.dueDate) : null;

  return (
    <div style={{ ...styles.card, ...(isDone ? styles.cardDone : isOverdue ? styles.cardOverdue : {}) }}>
      {/* Main Row */}
      <div style={styles.mainRow} onClick={() => setOpen(!open)}>

        {/* Left */}
        <div style={styles.leftSection}>
          <span style={styles.chevron}>
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>

          <span
            style={styles.statusIcon}
            onClick={handleToggleStatus}
            title={isDone ? "Mark as to do" : "Mark as done"}
          >
            {isDone
              ? <CheckCircle2 size={20} color="#059669" />
              : <Circle size={20} color={isOverdue ? "#fca5a5" : "#d4d4d4"} />
            }
          </span>

          <div style={styles.taskInfo}>
            <span style={{ ...styles.taskTitle, ...(isDone ? styles.taskTitleDone : {}) }}>
              {task.title}
            </span>
            {task.description && (
              <span style={styles.taskDesc}>{task.description}</span>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={styles.rightSection}>
          {/* Priority chip */}
          <span style={{ ...styles.typeChip, background: typeColor.bg, color: typeColor.text }}>
            {task.priority}
          </span>

          {/* Due date */}
          {dueDate && !isDone && (
            <span style={{ ...styles.metaChip, color: dueDate.color }}>
              <Calendar size={13} />
              {dueDate.text}
            </span>
          )}

          {/* Points */}
          {task.points > 0 && (
            <span style={{ ...styles.metaChip, color: "#f43f5e" }}>
              <Award size={13} />
              {isDone && task.earnedPoints != null
                ? `${task.earnedPoints}/${task.points}pts`
                : `${task.points}pts`}
            </span>
          )}

          {/* Actions */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditTaskModalOpen(true); }}
            style={styles.iconBtn}
            title="Edit assignment"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={handleDeleteTask}
            style={{ ...styles.iconBtn, ...styles.iconBtnDanger }}
            title="Delete assignment"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Subtasks panel */}
      {open && (
        <div style={styles.subtasksPanel}>
          {subtasksLoaded && subtasks.length > 0 && (
            <>
              <div style={styles.subtasksHeader}>
                <span style={styles.subtasksLabel}>Subtasks</span>
                <span style={styles.subtasksCount}>{completedSubtasks}/{subtasks.length} done</span>
              </div>
              <div style={styles.subtasksList}>
                {subtasks.map(s => (
                  <div key={s.id} style={styles.subtaskItem}>
                    <input
                      type="checkbox"
                      checked={s.done}
                      onChange={() => handleToggleSubtask(s.id)}
                      style={styles.checkbox}
                    />
                    <span style={{ ...styles.subtaskText, ...(s.done ? styles.subtaskDone : {}) }}>
                      {s.title}
                    </span>

                    {/* Plan for date */}
                    {planningSubtaskId === s.id ? (
                      <input
                        type="date"
                        autoFocus
                        style={styles.planDateInput}
                        onChange={(e) => { if (e.target.value) handlePlanSubtask(s.id, e.target.value); }}
                        onBlur={() => setPlanningSubtaskId(null)}
                      />
                    ) : s.plannedForDate ? (
                      <span
                        style={styles.plannedBadge}
                        onClick={(e) => { e.stopPropagation(); setPlanningSubtaskId(s.id); }}
                        title="Change plan date"
                      >
                        <Calendar size={11} />
                        {Array.isArray(s.plannedForDate)
                          ? `${s.plannedForDate[2]}/${s.plannedForDate[1]}`
                          : new Date(s.plannedForDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePlanSubtask(s.id, null); }}
                          style={styles.unplanBtn}
                          title="Remove from plan"
                        >×</button>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setPlanningSubtaskId(s.id); }}
                        style={styles.planBtn}
                        title="Add to daily plan"
                      >
                        <Calendar size={12} />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDeleteSubtask(e, s.id)}
                      style={styles.subtaskDeleteBtn}
                      title="Delete subtask"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {subtasksLoaded && subtasks.length === 0 && (
            <p style={styles.noSubtasks}>No subtasks yet</p>
          )}

          {!subtasksLoaded && (
            <p style={styles.noSubtasks}>Loading...</p>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); setIsAddSubtaskModalOpen(true); }}
            style={styles.addSubtaskBtn}
          >
            <Plus size={15} />
            Add subtask
          </button>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isAddSubtaskModalOpen} onClose={() => setIsAddSubtaskModalOpen(false)} title="Add Subtask">
        <SubtaskForm onSubmit={handleAddSubtask} onCancel={() => setIsAddSubtaskModalOpen(false)} />
      </Modal>

      <Modal isOpen={isEditTaskModalOpen} onClose={() => setIsEditTaskModalOpen(false)} title="Edit Assignment">
        <TaskForm initialData={task} onSubmit={handleEditTask} onCancel={() => setIsEditTaskModalOpen(false)} />
      </Modal>

      <Modal isOpen={isPointsModalOpen} onClose={() => setIsPointsModalOpen(false)} title="Points Earned">
        <div style={pointsStyles.container}>
          <p style={pointsStyles.desc}>
            How many points did you earn for <strong>{task.title}</strong>?
          </p>
          <p style={pointsStyles.max}>Maximum: {task.points} pts</p>
          <input
            type="number"
            value={earnedPointsInput}
            onChange={(e) => setEarnedPointsInput(e.target.value)}
            min="0"
            max={task.points}
            style={pointsStyles.input}
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleConfirmPoints(); }}
          />
          <div style={pointsStyles.buttons}>
            <button onClick={() => setIsPointsModalOpen(false)} style={pointsStyles.cancelBtn}>Cancel</button>
            <button onClick={handleConfirmPoints} style={pointsStyles.confirmBtn}>Confirm</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    marginBottom: "10px",
    overflow: "hidden",
    transition: "box-shadow 0.15s ease",
  },
  cardDone: {
    opacity: 0.7,
  },
  cardOverdue: {
    borderColor: "#fca5a5",
    background: "#fffafa",
  },
  mainRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    cursor: "pointer",
    gap: "12px",
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
    minWidth: 0,
  },
  chevron: {
    color: "#a3a3a3",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  statusIcon: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  taskInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
    flex: 1,
  },
  taskTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#171717",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  taskTitleDone: {
    textDecoration: "line-through",
    color: "#a3a3a3",
  },
  taskDesc: {
    fontSize: "13px",
    color: "#a3a3a3",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
  },
  typeChip: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 8px",
    borderRadius: "5px",
    letterSpacing: "0.3px",
    textTransform: "uppercase",
  },
  metaChip: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    fontWeight: "500",
    padding: "3px 8px",
    borderRadius: "5px",
    background: "#f5f5f5",
  },
  iconBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    background: "transparent",
    border: "1px solid #e5e5e5",
    borderRadius: "6px",
    color: "#a3a3a3",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  iconBtnDanger: {
    color: "#fca5a5",
    borderColor: "#fde8e8",
  },
  subtasksPanel: {
    borderTop: "1px solid #f0f0f0",
    padding: "14px 18px 14px 54px",
    background: "#fafafa",
  },
  subtasksHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  subtasksLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#525252",
  },
  subtasksCount: {
    fontSize: "12px",
    color: "#a3a3a3",
  },
  subtasksList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "10px",
  },
  subtaskItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#ffffff",
    border: "1px solid #ebebeb",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
    flexShrink: 0,
  },
  subtaskText: {
    fontSize: "14px",
    color: "#171717",
    flex: 1,
  },
  subtaskDone: {
    textDecoration: "line-through",
    color: "#a3a3a3",
  },
  subtaskDeleteBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    background: "transparent",
    border: "none",
    borderRadius: "4px",
    color: "#d4d4d4",
    cursor: "pointer",
    flexShrink: 0,
    padding: 0,
  },
  planBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    background: "transparent",
    border: "1px dashed #d4d4d4",
    borderRadius: "4px",
    color: "#a3a3a3",
    cursor: "pointer",
    flexShrink: 0,
    padding: 0,
  },
  plannedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "2px 7px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "5px",
    fontSize: "11px",
    fontWeight: "500",
    color: "#f43f5e",
    cursor: "pointer",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  unplanBtn: {
    background: "transparent",
    border: "none",
    color: "#f43f5e",
    cursor: "pointer",
    padding: "0 0 0 2px",
    fontSize: "13px",
    lineHeight: 1,
    fontWeight: "600",
  },
  planDateInput: {
    fontSize: "12px",
    border: "1px solid #e5e5e5",
    borderRadius: "6px",
    padding: "3px 6px",
    fontFamily: "inherit",
    outline: "none",
    flexShrink: 0,
  },
  noSubtasks: {
    fontSize: "13px",
    color: "#a3a3a3",
    margin: "0 0 10px 0",
  },
  addSubtaskBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 12px",
    background: "transparent",
    border: "1px dashed #d4d4d4",
    borderRadius: "7px",
    color: "#a3a3a3",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
};

const pointsStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  desc: {
    fontSize: "15px",
    color: "#171717",
    margin: 0,
  },
  max: {
    fontSize: "13px",
    color: "#737373",
    margin: 0,
  },
  input: {
    padding: "12px 14px",
    fontSize: "18px",
    fontWeight: "600",
    border: "1px solid #e5e5e5",
    borderRadius: "10px",
    fontFamily: "inherit",
    outline: "none",
    textAlign: "center",
    width: "100%",
    boxSizing: "border-box",
  },
  buttons: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "8px",
  },
  cancelBtn: {
    padding: "10px 20px",
    background: "#f5f5f5",
    color: "#171717",
    border: "1px solid #e5e5e5",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
  },
  confirmBtn: {
    padding: "10px 20px",
    background: "#f43f5e",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    boxShadow: "0 2px 8px rgba(244, 63, 94, 0.2)",
  },
};
