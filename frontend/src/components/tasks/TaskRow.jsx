import { useState, useEffect } from "react";
import SubtaskForm from "../subtasks/SubtaskForm";
import TaskForm from "./TaskForm";
import ExamForm from "./ExamForm";
import Modal from "../common/Modal";
import { ChevronDown, ChevronRight, Calendar, Award, CheckCircle2, Circle, Plus, Edit2, Trash2, X, GraduationCap } from "lucide-react";
import { updateTask, updateTaskStatus, deleteTask } from "../../services/taskService";
import { getSubtasksByTaskId, createSubtask, toggleSubtaskDone, deleteSubtask, updateSubtaskPlan } from "../../services/subtaskService";
import useIsMobile from "../../hooks/useIsMobile";
import { logError } from "../../utils/logger";

export default function TaskRow({ task, onTaskUpdate, onTaskDelete }) {
  const isMobile = useIsMobile();
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
          logError("TaskRow", "Failed to fetch subtasks", err);
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
      logError("TaskRow", "Failed to toggle subtask", err);
    }
  };

  const handleDeleteSubtask = async (e, subtaskId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this subtask?")) return;
    try {
      await deleteSubtask(subtaskId);
      setSubtasks(prev => prev.filter(s => s.id !== subtaskId));
    } catch (err) {
      logError("TaskRow", "Failed to delete subtask", err);
    }
  };

  const handlePlanSubtask = async (subtaskId, dateStr) => {
    try {
      const updated = await updateSubtaskPlan(subtaskId, dateStr || null);
      setSubtasks(prev => prev.map(s => s.id === subtaskId ? { ...s, plannedForDate: updated.plannedForDate } : s));
    } catch (err) {
      logError("TaskRow", "Failed to update plan", err);
    }
    setPlanningSubtaskId(null);
  };

  const handleAddSubtask = async (formData) => {
    try {
      const newSubtask = await createSubtask({ ...formData, taskId: task.id });
      setSubtasks([...subtasks, newSubtask]);
      setIsAddSubtaskModalOpen(false);
    } catch (err) {
      logError("TaskRow", "Failed to create subtask", err);
      alert("Failed to create subtask. Please try again.");
    }
  };

  const handleEditTask = async (formData) => {
    try {
      const updatedTask = await updateTask(task.id, { ...formData, subjectId: task.subjectId });
      if (onTaskUpdate) onTaskUpdate(updatedTask);
      setIsEditTaskModalOpen(false);
    } catch (err) {
      logError("TaskRow", "Failed to update task", err);
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
      logError("TaskRow", "Failed to delete task", err);
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
        logError("TaskRow", "Failed to update task status", err);
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
          logError("TaskRow", "Failed to update task status", err);
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
      logError("TaskRow", "Failed to update task status", err);
    }
    setIsPointsModalOpen(false);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = task.status !== "DONE" && task.dueDate && new Date(task.dueDate) < today;

  const isDone = task.status === "DONE";
  const isExam = !!task.examPeriodId;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      if (isDone) return { text: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), color: "var(--ink-3)" };
      return { text: `${Math.abs(diffDays)}d overdue`, color: "var(--color-overdue)" };
    }
    if (diffDays === 0) return { text: "Due today", color: "var(--color-due-soon)" };
    if (diffDays === 1) return { text: "Due tomorrow", color: "var(--color-due-soon)" };
    if (diffDays <= 7) return { text: `${diffDays}d left`, color: "var(--color-future)" };
    return { text: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), color: "var(--ink-3)" };
  };

  const dueDate = task.dueDate ? formatDate(task.dueDate) : null;

  return (
    <div style={{
      ...s.row,
      ...(isDone ? s.rowDone : isOverdue ? s.rowOverdue : {}),
    }}>
      {/* Main Row */}
      <div style={s.mainRow} onClick={() => setOpen(!open)}>

        {/* Left */}
        <div style={s.leftSection}>
          <span style={s.chevron}>
            {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </span>

          <span
            style={s.statusIcon}
            onClick={handleToggleStatus}
            title={isDone ? "Mark as to do" : "Mark as done"}
          >
            {isDone
              ? <CheckCircle2 size={18} color="var(--color-done)" />
              : <Circle size={18} color={isOverdue ? "var(--color-overdue)" : "var(--ink-4)"} />
            }
          </span>

          <div style={s.taskInfo}>
            <div style={s.titleRow}>
              {isExam && <GraduationCap size={14} color="var(--rose-500)" style={{ flexShrink: 0 }} />}
              <span style={{ ...s.taskTitle, ...(isDone ? s.taskTitleDone : {}) }}>
                {task.title}
              </span>
            </div>
            {task.description && (
              <span style={s.taskDesc}>{task.description}</span>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={s.rightSection}>
          {/* Due date — hidden on mobile */}
          {dueDate && !isDone && !isMobile && (
            <span style={{ ...s.metaChip, color: dueDate.color }}>
              <Calendar size={12} />
              {dueDate.text}
            </span>
          )}

          {/* Points — hidden on mobile */}
          {task.points > 0 && !isMobile && (
            <span style={{ ...s.metaChip, color: "var(--rose-400)" }}>
              <Award size={12} />
              {isDone && task.earnedPoints != null
                ? `${task.earnedPoints}/${task.points}pts`
                : `${task.points}pts`}
            </span>
          )}

          {/* Actions */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditTaskModalOpen(true); }}
            style={s.iconBtn}
            title="Edit assignment"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={handleDeleteTask}
            style={{ ...s.iconBtn, ...s.iconBtnDanger }}
            title="Delete assignment"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Subtasks panel */}
      {open && (
        <div style={{ ...s.subtasksPanel, paddingLeft: isMobile ? "16px" : "52px" }}>
          {/* Mobile: show chips here since they're hidden in the row */}
          {isMobile && (dueDate || task.points > 0) && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
              {dueDate && !isDone && (
                <span style={{ ...s.metaChip, color: dueDate.color }}>
                  <Calendar size={12} />
                  {dueDate.text}
                </span>
              )}
              {task.points > 0 && (
                <span style={{ ...s.metaChip, color: "var(--rose-400)" }}>
                  <Award size={12} />
                  {isDone && task.earnedPoints != null
                    ? `${task.earnedPoints}/${task.points}pts`
                    : `${task.points}pts`}
                </span>
              )}
            </div>
          )}
          {subtasksLoaded && subtasks.length > 0 && (
            <>
              <div style={s.subtasksHeader}>
                <span style={s.subtasksLabel}>Subtasks</span>
                <span style={s.subtasksCount}>{completedSubtasks}/{subtasks.length} done</span>
              </div>
              <div style={s.subtasksList}>
                {subtasks.map(s => (
                  <div key={s.id} style={s.subtaskItem}>
                    <input
                      type="checkbox"
                      checked={s.done}
                      onChange={() => handleToggleSubtask(s.id)}
                      style={s.checkbox}
                    />
                    <span style={{ ...s.subtaskText, ...(s.done ? s.subtaskDone : {}) }}>
                      {s.title}
                    </span>

                    {/* Plan for date */}
                    {planningSubtaskId === s.id ? (
                      <input
                        type="date"
                        autoFocus
                        style={s.planDateInput}
                        onChange={(e) => { if (e.target.value) handlePlanSubtask(s.id, e.target.value); }}
                        onBlur={() => setPlanningSubtaskId(null)}
                      />
                    ) : s.plannedForDate ? (
                      <span
                        style={s.plannedBadge}
                        onClick={(e) => { e.stopPropagation(); setPlanningSubtaskId(s.id); }}
                        title="Change plan date"
                      >
                        <Calendar size={11} />
                        {Array.isArray(s.plannedForDate)
                          ? `${s.plannedForDate[2]}/${s.plannedForDate[1]}`
                          : new Date(s.plannedForDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePlanSubtask(s.id, null); }}
                          style={s.unplanBtn}
                          title="Remove from plan"
                        >×</button>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setPlanningSubtaskId(s.id); }}
                        style={s.planBtn}
                        title="Add to daily plan"
                      >
                        <Calendar size={12} />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDeleteSubtask(e, s.id)}
                      style={s.subtaskDeleteBtn}
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
            <p style={s.noSubtasks}>No subtasks yet</p>
          )}

          {!subtasksLoaded && (
            <p style={s.noSubtasks}>Loading...</p>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); setIsAddSubtaskModalOpen(true); }}
            style={s.addSubtaskBtn}
          >
            <Plus size={14} />
            Add subtask
          </button>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isAddSubtaskModalOpen} onClose={() => setIsAddSubtaskModalOpen(false)} title="Add Subtask">
        <SubtaskForm onSubmit={handleAddSubtask} onCancel={() => setIsAddSubtaskModalOpen(false)} />
      </Modal>

      <Modal isOpen={isEditTaskModalOpen} onClose={() => setIsEditTaskModalOpen(false)} title={isExam ? "Edit Exam" : "Edit Assignment"}>
        {isExam
          ? <ExamForm initialData={task} onSubmit={handleEditTask} onCancel={() => setIsEditTaskModalOpen(false)} />
          : <TaskForm initialData={task} onSubmit={handleEditTask} onCancel={() => setIsEditTaskModalOpen(false)} />
        }
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

const s = {
  row: {
    borderBottom: "1px solid var(--border)",
    overflow: "hidden",
    transition: "background 0.1s ease",
  },
  rowDone: {
    opacity: 0.65,
  },
  rowOverdue: {
    background: "var(--color-overdue-bg)",
  },
  mainRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    cursor: "pointer",
    gap: "12px",
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    minWidth: 0,
  },
  chevron: {
    color: "var(--ink-4)",
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
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    minWidth: 0,
  },
  taskTitle: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--ink)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  taskTitleDone: {
    textDecoration: "line-through",
    color: "var(--ink-3)",
  },
  taskDesc: {
    fontSize: "12px",
    color: "var(--ink-3)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    flexShrink: 0,
  },
  metaChip: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    fontWeight: "500",
    padding: "2px 7px",
    borderRadius: "99px",
    background: "var(--surface-3)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  iconBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    color: "var(--ink-3)",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  iconBtnDanger: {
    color: "var(--color-overdue)",
    borderColor: "var(--color-overdue)30",
  },
  subtasksPanel: {
    borderTop: "1px solid var(--border)",
    padding: "12px 16px 12px 52px",
    background: "var(--surface-2)",
  },
  subtasksHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  subtasksLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--ink-3)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  subtasksCount: {
    fontSize: "12px",
    color: "var(--ink-3)",
  },
  subtasksList: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "10px",
  },
  subtaskItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "7px 10px",
    borderRadius: "var(--r-sm)",
    background: "var(--surface)",
    border: "1px solid var(--border)",
  },
  checkbox: {
    width: "15px",
    height: "15px",
    cursor: "pointer",
    flexShrink: 0,
    accentColor: "var(--rose-400)",
  },
  subtaskText: {
    fontSize: "13px",
    color: "var(--ink)",
    flex: 1,
  },
  subtaskDone: {
    textDecoration: "line-through",
    color: "var(--ink-3)",
  },
  subtaskDeleteBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "22px",
    height: "22px",
    background: "transparent",
    border: "none",
    borderRadius: "4px",
    color: "var(--ink-4)",
    cursor: "pointer",
    flexShrink: 0,
    padding: 0,
  },
  planBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "22px",
    height: "22px",
    background: "transparent",
    border: "1px dashed var(--border-2)",
    borderRadius: "4px",
    color: "var(--ink-3)",
    cursor: "pointer",
    flexShrink: 0,
    padding: 0,
  },
  plannedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "2px 7px",
    background: "var(--rose-50)",
    border: "1px solid var(--rose-100)",
    borderRadius: "99px",
    fontSize: "11px",
    fontWeight: "500",
    color: "var(--rose-500)",
    cursor: "pointer",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  unplanBtn: {
    background: "transparent",
    border: "none",
    color: "var(--rose-500)",
    cursor: "pointer",
    padding: "0 0 0 2px",
    fontSize: "13px",
    lineHeight: 1,
    fontWeight: "600",
  },
  planDateInput: {
    fontSize: "12px",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    padding: "3px 6px",
    fontFamily: "inherit",
    outline: "none",
    flexShrink: 0,
  },
  noSubtasks: {
    fontSize: "13px",
    color: "var(--ink-3)",
    margin: "0 0 10px 0",
  },
  addSubtaskBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    background: "transparent",
    border: "1px dashed var(--border-2)",
    borderRadius: "var(--r-sm)",
    color: "var(--ink-3)",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
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
    color: "var(--ink)",
    margin: 0,
  },
  max: {
    fontSize: "13px",
    color: "var(--ink-3)",
    margin: 0,
  },
  input: {
    padding: "12px 14px",
    fontSize: "18px",
    fontWeight: "600",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    fontFamily: "inherit",
    outline: "none",
    textAlign: "center",
    width: "100%",
    boxSizing: "border-box",
    color: "var(--ink)",
    background: "var(--surface)",
  },
  buttons: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "8px",
  },
  cancelBtn: {
    padding: "9px 18px",
    background: "var(--surface-3)",
    color: "var(--ink)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  confirmBtn: {
    padding: "9px 18px",
    background: "var(--rose-400)",
    color: "white",
    border: "none",
    borderRadius: "var(--r-md)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
};
