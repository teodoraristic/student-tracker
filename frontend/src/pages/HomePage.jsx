import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { getAllSubjects } from "../services/subjectService";
import { getAllTasks } from "../services/taskService";
import { getSubtasksByDate, toggleSubtaskDone, updateSubtaskPlan, createSubtask } from "../services/subtaskService";
import { getTaskBreakdown, getRiskAssessment } from "../services/aiService";
import { toISODate, parseDateLocal } from "../utils/dateUtils";
import {
  Calendar, Clock, CheckSquare, Square, CalendarX,
  X, ChevronDown, Check, AlertTriangle, BookOpen, ArrowRight, ExternalLink,
  Play, Pause, RotateCcw, Sparkles, Plus,
} from "lucide-react";

const QUOTES = [
  "Small steps every day lead to big results.",
  "The secret of getting ahead is getting started.",
  "Focus on progress, not perfection.",
  "Discipline is the bridge between goals and accomplishment.",
  "Your future is created by what you do today.",
  "One assignment at a time. You've got this.",
];

const getGreeting = (firstName) => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return {
    text: `Good morning, ${firstName}`,
    note: "Let's see what's on the agenda today.",
  };
  if (h >= 12 && h < 14) return {
    text: `Good afternoon, ${firstName}`,
    note: "Hope the morning was productive.",
  };
  if (h >= 14 && h < 18) return {
    text: `Still going, ${firstName}?`,
    note: "Afternoon grind. Keep the momentum.",
  };
  if (h >= 18 && h < 22) return {
    text: `Good evening, ${firstName}`,
    note: "Time to wrap up or plan ahead.",
  };
  return {
    text: `Still up, ${firstName}?`,
    note: "Late night study session. Respect.",
  };
};

const DONE_QUOTES = [
  "All clear for today. Well done.",
  "You crushed it today. Rest up.",
  "Today's work is done. Be proud.",
  "Nothing left on the list. That's the goal.",
  "Done and dusted. Great job.",
  "You showed up and got it done.",
];

const formatDue = (raw) => {
  if (!raw) return null;
  const date = parseDateLocal(raw);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((date - today) / 86400000);
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, color: "var(--color-overdue)" };
  if (diff === 0) return { text: "Due today", color: "var(--color-due-soon)" };
  if (diff === 1) return { text: "Due tomorrow", color: "var(--color-due-soon)" };
  if (diff <= 7) return { text: `${diff}d left`, color: "var(--color-future)" };
  return { text: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), color: "var(--ink-3)" };
};

// ── component ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const greeting = getGreeting(user?.firstName ?? "");
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const [selectedDate] = useState(todayDate);
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [plannedSubtasks, setPlannedSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [deadlinesExpanded, setDeadlinesExpanded] = useState(false);
  const [breakdownTaskId, setBreakdownTaskId] = useState(null);
  const [breakdownItems, setBreakdownItems] = useState([]);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [addedIndices, setAddedIndices] = useState(new Set());

  useEffect(() => {
    const fetchStatic = async () => {
      try {
        const [subjectsData, tasksData] = await Promise.all([
          getAllSubjects(),
          getAllTasks(),
        ]);
        setSubjects(subjectsData);
        setTasks(tasksData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatic();
  }, []);

  const fetchPlanned = useCallback(async () => {
    setPlanLoading(true);
    try {
      const data = await getSubtasksByDate(toISODate(selectedDate));
      setPlannedSubtasks(data);
    } catch (err) {
      console.error("Failed to load planned subtasks:", err);
    } finally {
      setPlanLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchPlanned();
  }, [fetchPlanned]);

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleToggleDone = async (subtask) => {
    try {
      await toggleSubtaskDone(subtask.id, !subtask.done);
      setPlannedSubtasks((prev) =>
        prev.map((s) => (s.id === subtask.id ? { ...s, done: !s.done } : s))
      );
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
    }
  };

  const handleRemovePlan = async (subtaskId) => {
    try {
      await updateSubtaskPlan(subtaskId, null);
      setPlannedSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
    } catch (err) {
      console.error("Failed to remove from plan:", err);
    }
  };

  const handleReschedule = async (subtaskId, newDateStr) => {
    if (!newDateStr) return;
    try {
      await updateSubtaskPlan(subtaskId, newDateStr);
      if (newDateStr !== toISODate(selectedDate)) {
        setPlannedSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
      }
    } catch (err) {
      console.error("Failed to reschedule:", err);
    }
  };

  const handleBreakdown = async (e, task) => {
    e.stopPropagation();
    if (breakdownTaskId === task.id) {
      setBreakdownTaskId(null);
      setBreakdownItems([]);
      setAddedIndices(new Set());
      return;
    }
    setBreakdownTaskId(task.id);
    setBreakdownItems([]);
    setAddedIndices(new Set());
    setBreakdownLoading(true);
    try {
      const data = await getTaskBreakdown(task.id);
      setBreakdownItems(data.subtasks || []);
    } catch (err) {
      console.error("AI breakdown failed:", err);
    } finally {
      setBreakdownLoading(false);
    }
  };

  const handleAddSubtask = async (taskId, title, index) => {
    try {
      await createSubtask({ title, taskId });
      setAddedIndices((prev) => new Set([...prev, index]));
    } catch (err) {
      console.error("Failed to add subtask:", err);
    }
  };


  // ── derived data ──────────────────────────────────────────────────────────
  const isSelectedToday = true;

  const pendingToday = plannedSubtasks.filter((s) => !s.done);
  const doneToday = plannedSubtasks.filter((s) => s.done);

  const dayIndex = todayDate.getDay();
  const emptyQuote = QUOTES[dayIndex % QUOTES.length];
  const doneQuote = DONE_QUOTES[dayIndex % DONE_QUOTES.length];


  // Warning: shown only when selectedDate === today
  // Assignments due within 3 days that have fewer planned subtasks than total
  const today3 = new Date(todayDate);
  today3.setDate(today3.getDate() + 3);
  const warningTasks = isSelectedToday
    ? tasks.filter((t) => {
        if (t.status === "DONE" || !t.dueDate) return false;
        const due = parseDateLocal(t.dueDate);
        if (due > today3) return false;
        const subtasks = t.subTasks || [];
        if (subtasks.length === 0) return false;
        const plannedCount = subtasks.filter((s) => s.plannedForDate).length;
        return plannedCount < subtasks.length;
      })
    : [];

  // Priority chip colors for deadline cards
  const priorityChipColors = {
    HIGH:   { bg: "var(--color-overdue-bg)", color: "var(--color-overdue)" },
    MEDIUM: { bg: "var(--color-due-soon-bg)", color: "var(--color-due-soon)" },
    LOW:    { bg: "var(--surface-3)", color: "var(--ink-3)" },
  };

  // Upcoming deadlines — improved sorting
  const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  const upcomingTasks = tasks
    .filter((t) => t.status !== "DONE" && t.dueDate)
    .sort((a, b) => {
      const dateA = parseDateLocal(a.dueDate);
      const dateB = parseDateLocal(b.dueDate);
      const aOverdue = dateA < todayDate;
      const bOverdue = dateB < todayDate;
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      const dateDiff = dateA - dateB;
      if (dateDiff !== 0) return dateDiff;
      const pDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      const subA = a.subTasks || [];
      const subB = b.subTasks || [];
      const pctA = subA.length > 0 ? subA.filter((s) => s.done).length / subA.length : 0;
      const pctB = subB.length > 0 ? subB.filter((s) => s.done).length / subB.length : 0;
      return pctA - pctB;
    });

  const currentMonthName = todayDate.toLocaleDateString("en-US", { month: "long" });
  const currentMonthTasks = upcomingTasks.filter((t) => {
    const due = parseDateLocal(t.dueDate);
    return due && due.getMonth() === todayDate.getMonth() && due.getFullYear() === todayDate.getFullYear();
  });



  // Stat: Next Assignment
  const nextAssignmentTask = tasks
    .filter((t) => t.status !== "DONE" && t.dueDate)
    .sort((a, b) => parseDateLocal(a.dueDate) - parseDateLocal(b.dueDate))[0];

  const daysToNextAssignment = nextAssignmentTask
    ? Math.ceil((parseDateLocal(nextAssignmentTask.dueDate) - todayDate) / 86400000)
    : null;

  const nextAssignmentSubjectName = nextAssignmentTask
    ? (subjects.find((s) => s.id === nextAssignmentTask.subjectId)?.name ?? null)
    : null;

  // Stat: Subjects In Progress
  const inProgressCount = subjects.filter((s) => s.status === "IN_PROGRESS").length;

  // Stat: Tasks Left (uncompleted)
  const tasksLeftCount = tasks.filter((t) => t.status !== "DONE").length;

  if (loading) {
    return (
      <div style={styles.centered}>
        <span style={styles.loadingText}>Loading…</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={styles.dayHeader}>
        <div>
          <h1 style={styles.dayTitle}>
            {todayDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </h1>
          <p style={styles.dayGreeting}>{greeting.text}</p>
          <p style={styles.dayNote}>{greeting.note}</p>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div style={styles.statsRow}>
        {/* Card 1 — Next Assignment */}
        <div style={styles.statCard}>
          <span style={{ ...styles.statNum, color: daysToNextAssignment !== null ? "var(--rose-400)" : "var(--ink)" }}>
            {daysToNextAssignment !== null ? daysToNextAssignment : "—"}
          </span>
          <span style={styles.statLabel}>NEXT ASSIGNMENT - {nextAssignmentSubjectName && (
            <span style={styles.statSub}>{nextAssignmentSubjectName}</span>
          )}</span>
          
        </div>

        {/* Card 2 — Tasks Left */}
        <div style={styles.statCard}>
          <span style={styles.statNum}>{tasksLeftCount}</span>
          <span style={styles.statLabel}>ASSIGNMENTS LEFT</span>
        </div>

        {/* Card 3 — Subjects In Progress */}
        <div style={styles.statCard}>
          <span style={styles.statNum}>{inProgressCount}</span>
          <span style={styles.statLabel}> SUBJECTS LEFT </span>
        </div>
      </div>

      {/* ── 2-column layout ────────────────────────────────────────────── */}
      <div style={styles.columns}>

        {/* LEFT COLUMN — Daily To-Do + AI ───────────────────────── */}
        <div style={styles.sideCol}>

          {/* Daily To-Do ──────────────────────────────────────────────── */}
          <div style={styles.column}>
            <div style={styles.colTitleRow}>
              <h2 style={styles.colTitle}>
                <CheckSquare size={16} color="var(--rose-400)" />
                Today
              </h2>
              <button style={styles.plannerBtn} onClick={() => navigate("/planner")}>
                Planner <ArrowRight size={13} />
              </button>
            </div>

            {/* Warning */}
            {warningTasks.length > 0 && (
              <div style={styles.warningCard}>
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                You have {warningTasks.length} assignment{warningTasks.length !== 1 ? "s" : ""} due soon with no study sessions planned.
              </div>
            )}

            {planLoading ? (
              <div style={styles.emptyState}>
                <span style={styles.loadingText}>Loading…</span>
              </div>
            ) : plannedSubtasks.length === 0 ? (
              <div style={styles.emptyState}>
                <CalendarX size={36} color="var(--ink-4)" />
                <p style={styles.emptyText}>Nothing planned for today.</p>
                <p style={styles.emptyHint}>Head to the Planner to schedule your study sessions.</p>
                <p style={styles.emptyQuote}>"{emptyQuote}"</p>
              </div>
            ) : (
              <div style={styles.todoList}>
                {pendingToday.length === 0 && doneToday.length > 0 && (
                  <div style={styles.allDoneCard}>
                    <Check size={15} color="var(--color-done)" style={{ flexShrink: 0 }} />
                    <p style={styles.allDoneText}>{doneQuote}</p>
                  </div>
                )}
                {pendingToday.map((s) => (
                  <SubtaskTodoItem
                    key={s.id}
                    subtask={s}
                    onToggle={handleToggleDone}
                    onReschedule={handleReschedule}
                    onRemove={handleRemovePlan}
                  />
                ))}

                {doneToday.length > 0 && (
                  <>
                    <button
                      style={styles.doneSeparatorBtn}
                      onClick={() => setCompletedExpanded((v) => !v)}
                    >
                      <span>Completed · {doneToday.length}</span>
                      <ChevronDown
                        size={13}
                        style={{
                          transform: completedExpanded ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s",
                        }}
                      />
                    </button>
                    {completedExpanded && doneToday.map((s) => (
                      <SubtaskTodoItem
                        key={s.id}
                        subtask={s}
                        onToggle={handleToggleDone}
                        onReschedule={handleReschedule}
                        onRemove={handleRemovePlan}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* AI Assistant ─────────────────────────────────────────────── */}
          <AIAssistantWidget tasks={tasks} subjects={subjects} />

        </div>{/* end LEFT COLUMN */}

        {/* RIGHT COLUMN — Deadlines + Pomodoro ────────────────────────── */}
        <div style={styles.sideCol}>

          {/* Upcoming Deadlines ───────────────────────────────────────── */}
          <div style={styles.column}>
            <div style={styles.colTitleRow}>
              <h2 style={styles.colTitle}>
                <Clock size={16} color="var(--rose-400)" />
                Coming up
                <span style={styles.monthLabel}>in {currentMonthName}</span>
              </h2>
              <button style={styles.plannerBtn} onClick={() => navigate("/calendar")}>
                Calendar <ArrowRight size={13} />
              </button>
            </div>

            {currentMonthTasks.length === 0 ? (
              <div style={styles.emptyState}>
                <Clock size={36} color="var(--ink-4)" />
                <p style={styles.emptyText}>No assignments this month.</p>
              </div>
            ) : (
              <div style={styles.deadlineList}>
                {(deadlinesExpanded ? currentMonthTasks : currentMonthTasks.slice(0, 3)).map((task) => {
                  const subject = subjects.find((s) => s.id === task.subjectId);
                  const due = formatDue(task.dueDate);
                  const subtasks = task.subTasks || [];
                  const doneSubs = subtasks.filter((s) => s.done).length;
                  const totalSubs = subtasks.length;
                  const subPct = totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0;
                  const isExpanded = breakdownTaskId === task.id;

                  return (
                    <div key={task.id}>
                      <div
                        style={styles.deadlineRow}
                        onClick={() => navigate(`/subjects/${task.subjectId}`)}
                      >
                        <div style={styles.deadlineLeft}>
                          <span style={styles.deadlineTitle}>{task.title}</span>
                          <div style={styles.deadlineMeta}>
                            {subject && <span style={styles.subjectChip}>{subject.name}</span>}
                            {task.priority && (() => {
                              const pc = priorityChipColors[task.priority] || priorityChipColors.LOW;
                              return (
                                <span style={{ ...styles.typeChip, background: pc.bg, color: pc.color }}>
                                  {task.priority}
                                </span>
                              );
                            })()}
                          </div>
                          {totalSubs > 0 && (
                            <div style={styles.subProgressRow}>
                              <div style={styles.subProgressTrack}>
                                <div style={{ ...styles.subProgressFill, width: `${subPct}%` }} />
                              </div>
                              <span style={styles.subProgressLabel}>{doneSubs}/{totalSubs} subtasks</span>
                            </div>
                          )}
                        </div>
                        <div style={styles.deadlineRight}>
                          {due && (
                            <span style={{
                              ...styles.dueBadge,
                              color: due.color,
                              border: `1px solid ${due.color}40`,
                              background: due.color + "12",
                            }}>
                              {due.text}
                            </span>
                          )}
                          <button
                            style={{
                              ...styles.sparkleBtn,
                              ...(isExpanded ? styles.sparkleBtnActive : {}),
                            }}
                            onClick={(e) => handleBreakdown(e, task)}
                            title="AI Task Breakdown"
                          >
                            <Sparkles size={12} />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={styles.breakdownPanel}>
                          <div style={styles.breakdownHeader}>
                            <span style={styles.breakdownTitle}>AI Breakdown</span>
                            <button
                              style={styles.breakdownClose}
                              onClick={() => { setBreakdownTaskId(null); setBreakdownItems([]); setAddedIndices(new Set()); }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                          {breakdownLoading ? (
                            <p style={styles.breakdownLoading}>Generating subtasks…</p>
                          ) : breakdownItems.length === 0 ? (
                            <p style={styles.breakdownLoading}>No suggestions generated.</p>
                          ) : (
                            <div style={styles.breakdownList}>
                              {breakdownItems.map((item, i) => (
                                <div key={i} style={styles.breakdownItem}>
                                  <span style={styles.breakdownItemText}>{item}</span>
                                  {addedIndices.has(i) ? (
                                    <span style={styles.breakdownAdded}><Check size={11} /> Added</span>
                                  ) : (
                                    <button
                                      style={styles.breakdownAddBtn}
                                      onClick={() => handleAddSubtask(task.id, item, i)}
                                    >
                                      <Plus size={11} /> Add
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {currentMonthTasks.length > 3 && (
                  <button
                    style={styles.expandBtn}
                    onClick={() => setDeadlinesExpanded((v) => !v)}
                  >
                    {deadlinesExpanded
                      ? "Show less"
                      : `+${currentMonthTasks.length - 3} more`}
                    <ChevronDown size={13} style={{ transform: deadlinesExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pomodoro widget ──────────────────────────────────────────── */}
          <PomodoroWidget />

        </div>{/* end RIGHT COLUMN */}

      </div>
    </div>
  );
}

// ── SubtaskTodoItem ───────────────────────────────────────────────────────────
function SubtaskTodoItem({ subtask: s, onToggle, onReschedule, onRemove }) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [tempDate, setTempDate] = useState("");
  const due = formatDue(s.taskDueDate);
  const isDone = s.done;

  return (
    <div style={{ ...itemStyles.card, ...(isDone ? itemStyles.cardDone : {}) }}>
      <button style={itemStyles.checkBtn} onClick={() => onToggle(s)}>
        {isDone
          ? <CheckSquare size={18} color="var(--color-done)" />
          : <Square size={18} color="var(--ink-4)" />}
      </button>

      <div style={itemStyles.body}>
        <span style={{ ...itemStyles.title, ...(isDone ? itemStyles.titleDone : {}) }}>
          {s.title}
        </span>
        <div style={itemStyles.meta}>
          <span style={itemStyles.taskName}>{s.taskTitle}</span>
          {s.subjectName && <span style={itemStyles.subjectBadge}>{s.subjectName}</span>}
          {due && !isDone && (
            <span style={{ ...itemStyles.dueMini, color: due.color }}>{due.text}</span>
          )}
        </div>
      </div>

      <div style={itemStyles.actions}>
        {isRescheduling ? (
          <>
            <input
              type="date"
              autoFocus
              value={tempDate}
              style={itemStyles.dateInput}
              onChange={(e) => setTempDate(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") { setIsRescheduling(false); setTempDate(""); }
              }}
            />
            <button
              style={{
                ...itemStyles.actionBtn,
                ...itemStyles.confirmBtn,
                opacity: tempDate ? 1 : 0.4,
              }}
              onClick={() => {
                if (tempDate) onReschedule(s.id, tempDate);
                setIsRescheduling(false);
                setTempDate("");
              }}
              title="Confirm reschedule"
            >
              <Check size={13} />
            </button>
          </>
        ) : (
          <button
            style={itemStyles.actionBtn}
            onClick={() => { setTempDate(""); setIsRescheduling(true); }}
            title="Reschedule"
          >
            <Calendar size={13} />
          </button>
        )}
        <button
          style={{ ...itemStyles.actionBtn, ...itemStyles.removeBtn }}
          onClick={() => onRemove(s.id)}
          title="Remove from plan"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}


// ── AIAssistantWidget ─────────────────────────────────────────────────────────
function AIAssistantWidget({ tasks, subjects }) {
  const [riskItems, setRiskItems] = useState([]);
  const [riskLoading, setRiskLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [breakdownItems, setBreakdownItems] = useState([]);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [addedIdxs, setAddedIdxs] = useState(new Set());
  const [userDescription, setUserDescription] = useState("");
  const [needsDescription, setNeedsDescription] = useState(false);

  useEffect(() => {
    getRiskAssessment()
      .then(setRiskItems)
      .catch(() => {})
      .finally(() => setRiskLoading(false));
  }, []);

  const todoTasks = tasks.filter((t) => t.status === "TODO");

  const handleTaskSelect = (e) => {
    const id = e.target.value;
    setSelectedTaskId(id);
    setBreakdownItems([]);
    setAddedIdxs(new Set());
    setUserDescription("");
    if (id) {
      const task = todoTasks.find((t) => String(t.id) === id);
      setNeedsDescription(!task?.description?.trim());
    } else {
      setNeedsDescription(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTaskId) return;
    if (needsDescription && !userDescription.trim()) return;
    setBreakdownItems([]);
    setAddedIdxs(new Set());
    setBreakdownLoading(true);
    try {
      const data = await getTaskBreakdown(
        Number(selectedTaskId),
        needsDescription ? userDescription : null
      );
      setBreakdownItems(data.subtasks || []);
    } catch (err) {
      console.error("Breakdown failed:", err);
    } finally {
      setBreakdownLoading(false);
    }
  };

  const handleAddItem = async (title, index) => {
    try {
      await createSubtask({ title, taskId: Number(selectedTaskId) });
      setAddedIdxs((prev) => new Set([...prev, index]));
    } catch (err) {
      console.error("Failed to add subtask:", err);
    }
  };

  return (
    <div style={styles.column}>
      <div style={{ ...styles.colTitleRow, marginBottom: "16px" }}>
        <h2 style={{ ...styles.colTitle, color: "#7e22ce" }}>
          <Sparkles size={16} color="#9333ea" />
          AI Assistant
        </h2>
      </div>

      {/* Risk Radar */}
      <p style={aiStyles.sectionLabel}>Risk Radar</p>
      {riskLoading ? (
        <p style={aiStyles.hint}>Analyzing your assignments…</p>
      ) : riskItems.length === 0 ? (
        <p style={aiStyles.hint}>No assignments at risk. Keep it up!</p>
      ) : (
        <div style={aiStyles.riskList}>
          {riskItems.map((item) => {
            const isHigh = item.riskLevel === "HIGH";
            return (
              <div key={item.taskId} style={aiStyles.riskRow}>
                <span style={{
                  ...aiStyles.riskBadge,
                  background: isHigh ? "var(--color-overdue-bg)" : "var(--color-due-soon-bg)",
                  color: isHigh ? "var(--color-overdue)" : "var(--color-due-soon)",
                  border: `1px solid ${isHigh ? "var(--color-overdue)" : "var(--color-due-soon)"}30`,
                }}>
                  {item.riskLevel}
                </span>
                <div style={aiStyles.riskInfo}>
                  <span style={aiStyles.riskTitle}>{item.title}</span>
                  {item.subjectName && (
                    <span style={aiStyles.riskSubject}>{item.subjectName}</span>
                  )}
                  <span style={aiStyles.riskReason}>{item.reason}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={aiStyles.divider} />

      {/* Task Breakdown */}
      <p style={aiStyles.sectionLabel}>Task Breakdown</p>
      <select
        style={aiStyles.select}
        value={selectedTaskId}
        onChange={handleTaskSelect}
      >
        <option value="">Select a task…</option>
        {todoTasks.map((t) => {
          const subj = subjects.find((s) => s.id === t.subjectId);
          return (
            <option key={t.id} value={t.id}>
              {subj ? `[${subj.name}] ` : ""}{t.title}
            </option>
          );
        })}
      </select>
      {needsDescription && selectedTaskId && (
        <div style={{ marginBottom: "10px" }}>
          <p style={{ ...aiStyles.hint, marginBottom: "6px" }}>
            This task has no description. Briefly describe what it's about so AI can generate relevant subtasks.
          </p>
          <textarea
            style={aiStyles.descTextarea}
            value={userDescription}
            onChange={(e) => setUserDescription(e.target.value)}
            placeholder="e.g. Write a 5-page essay analyzing the causes of WWI…"
            rows={3}
          />
        </div>
      )}
      <button
        style={{
          ...aiStyles.generateBtn,
          opacity: selectedTaskId && !breakdownLoading && (!needsDescription || userDescription.trim()) ? 1 : 0.5,
          cursor: selectedTaskId && !breakdownLoading && (!needsDescription || userDescription.trim()) ? "pointer" : "default",
        }}
        disabled={!selectedTaskId || breakdownLoading || (needsDescription && !userDescription.trim())}
        onClick={handleGenerate}
      >
        <Sparkles size={13} />
        {breakdownLoading ? "Generating…" : "Generate Subtasks"}
      </button>

      {breakdownItems.length > 0 && (
        <div style={aiStyles.breakdownList}>
          {breakdownItems.map((item, i) => (
            <div key={i} style={aiStyles.breakdownRow}>
              <span style={aiStyles.breakdownText}>{item}</span>
              {addedIdxs.has(i) ? (
                <span style={styles.breakdownAdded}><Check size={11} /> Added</span>
              ) : (
                <button style={styles.breakdownAddBtn} onClick={() => handleAddItem(item, i)}>
                  <Plus size={11} /> Add
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PomodoroWidget ────────────────────────────────────────────────────────────
const POMODORO_MODES = {
  work:  { label: "Focus",  minutes: 25, color: "var(--rose-400)" },
  break: { label: "Break",  minutes: 5,  color: "var(--color-done)" },
};

function PomodoroWidget() {
  const [mode, setMode] = useState("work");
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_MODES.work.minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const cfg = POMODORO_MODES[mode];
  const total = cfg.minutes * 60;
  const pct = ((total - secondsLeft) / total) * 100;
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          if (mode === "work") setSessions((n) => n + 1);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, mode]);

  const switchMode = (m) => {
    setMode(m);
    setRunning(false);
    setSecondsLeft(POMODORO_MODES[m].minutes * 60);
  };

  const reset = () => {
    setRunning(false);
    setSecondsLeft(cfg.minutes * 60);
  };

  return (
    <div style={styles.column}>
      {/* header */}
      <div style={pomoStyles.header}>
        <h2 style={styles.colTitle}>
          <Clock size={16} color="var(--rose-400)" />
          Focus Timer
        </h2>
        <span style={pomoStyles.sessionBadge}>
          {sessions} session{sessions !== 1 ? "s" : ""}
        </span>
      </div>

      {/* mode tabs */}
      <div style={pomoStyles.tabs}>
        {Object.entries(POMODORO_MODES).map(([key, m]) => (
          <button
            key={key}
            style={{
              ...pomoStyles.tab,
              ...(mode === key ? { background: "var(--rose-50)", color: "var(--rose-500)", borderColor: "var(--rose-100)" } : {}),
            }}
            onClick={() => switchMode(key)}
          >
            {m.label} · {m.minutes}m
          </button>
        ))}
      </div>

      {/* ring + time */}
      <div style={pomoStyles.ringWrap}>
        <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="7" />
          <circle
            cx="60" cy="60" r="52" fill="none"
            stroke="var(--rose-400)" strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div style={pomoStyles.timeOverlay}>
          <span style={pomoStyles.timeText}>{mins}:{secs}</span>
        </div>
      </div>

      {/* controls */}
      <div style={pomoStyles.controls}>
        <button style={pomoStyles.resetBtn} onClick={reset} title="Reset">
          <RotateCcw size={15} />
        </button>
        <button
          style={pomoStyles.playBtn}
          onClick={() => setRunning((r) => !r)}
        >
          {running ? <Pause size={18} /> : <Play size={18} />}
          {running ? "Pause" : secondsLeft === total ? "Start" : "Resume"}
        </button>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  container: { width: "100%", maxWidth: "1400px", margin: "0 auto" },
  centered: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" },
  loadingText: { fontSize: "15px", color: "var(--ink-3)" },

  dayHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: "24px",
  },
  dayTitle: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "28px", fontWeight: "400", color: "var(--ink)", margin: "0 0 4px 0",
  },
  dayGreeting: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "22px", fontWeight: "400", fontStyle: "italic",
    color: "var(--ink-3)", margin: 0,
  },
  dayNote: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: "13px",
    color: "var(--ink-3)",
    margin: "4px 0 0 0",
  },
  examBadge: {
    padding: "6px 14px",
    background: "var(--rose-50)",
    color: "var(--rose-400)",
    border: "1px solid var(--rose-100)",
    borderRadius: "99px",
    fontSize: "12px",
    fontWeight: "600",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "24px",
  },
  statCard: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statNum: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "24px",
    fontWeight: "400",
    color: "var(--ink)",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "10px",
    fontWeight: "600",
    color: "var(--ink-3)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  statSub: {
    fontSize: "11px",
    color: "var(--ink-3)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    marginTop: "2px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  columns: { display: "flex", gap: "14px", alignItems: "flex-start" },
  sideCol: { display: "flex", flexDirection: "column", gap: "14px", flex: 1, minWidth: 0 },
  column: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "16px",
    height: "fit-content",
  },
  colTitle: {
    display: "flex", alignItems: "center", gap: "8px",
    fontSize: "15px", fontWeight: "600", color: "var(--ink)", margin: 0,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  warningCard: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "10px 14px", background: "var(--color-due-soon-bg)", border: "1px solid var(--color-due-soon)30",
    borderRadius: "var(--r-md)", fontSize: "13px", fontWeight: "500", color: "var(--color-due-soon)",
    marginBottom: "16px",
  },

  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "20px 16px", textAlign: "center" },
  emptyText: { fontSize: "14px", color: "var(--ink-3)", margin: 0, fontWeight: "500" },
  emptyHint: { fontSize: "13px", color: "var(--ink-4)", margin: 0, lineHeight: 1.5, maxWidth: "240px" },
  emptyQuote: { fontSize: "12px", fontStyle: "italic", color: "var(--ink-4)", margin: "4px 0 0", maxWidth: "260px", lineHeight: 1.5, textAlign: "center" },

  allDoneCard: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "10px 14px", background: "var(--color-done-bg)", border: "1px solid var(--color-done)30",
    borderRadius: "var(--r-md)", marginBottom: "4px",
  },
  allDoneText: { fontSize: "13px", color: "var(--color-done)", margin: 0, fontStyle: "italic", fontWeight: "500" },

  todoList: { display: "flex", flexDirection: "column", gap: "1px" },
  doneSeparatorBtn: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    width: "100%", padding: "10px 0 4px", background: "transparent", border: "none",
    borderTop: "1px solid var(--border)", marginTop: "4px", cursor: "pointer",
    fontSize: "11px", fontWeight: "600", color: "var(--ink-4)",
    textTransform: "uppercase", letterSpacing: "0.06em",
  },

  deadlineList: { display: "flex", flexDirection: "column", gap: "0" },
  deadlineRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
    padding: "10px 0",
    borderBottom: "1px solid var(--border)",
    cursor: "pointer",
  },
  deadlineLeft: { display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 },
  deadlineRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 },
  deadlineTitle: { fontSize: "13px", fontWeight: "500", color: "var(--ink)", lineHeight: 1.3 },
  dueBadge: {
    fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "99px",
    flexShrink: 0, whiteSpace: "nowrap",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  deadlineMeta: { display: "flex", gap: "5px", alignItems: "center" },
  subjectChip: {
    fontSize: "11px", fontWeight: "500", padding: "1px 7px", borderRadius: "99px",
    background: "var(--rose-50)", color: "var(--rose-500)",
  },
  typeChip: {
    fontSize: "11px", fontWeight: "600", padding: "1px 7px", borderRadius: "99px",
    textTransform: "uppercase", letterSpacing: "0.04em",
  },
  subProgressRow: { display: "flex", alignItems: "center", gap: "6px" },
  subProgressTrack: { flex: 1, height: "4px", background: "var(--border)", borderRadius: "99px", overflow: "hidden" },
  subProgressFill: { height: "100%", background: "var(--rose-400)", borderRadius: "99px", transition: "width 0.3s ease" },
  subProgressLabel: { fontSize: "11px", color: "var(--ink-3)", fontWeight: "500", whiteSpace: "nowrap" },

  colTitleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  monthLabel: { fontSize: "13px", fontWeight: "400", color: "var(--ink-3)", marginLeft: "4px" },
  plannerBtn: {
    display: "flex", alignItems: "center", gap: "4px",
    background: "transparent", border: "none", cursor: "pointer",
    fontSize: "12px", fontWeight: "500", color: "var(--rose-400)", padding: 0,
  },

  expandBtn: {
    display: "flex", alignItems: "center", gap: "5px", marginTop: "8px",
    background: "transparent", border: "none", color: "var(--ink-3)",
    fontSize: "13px", fontWeight: "500", cursor: "pointer", padding: "4px 0",
  },

  sparkleBtn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "24px", height: "24px", flexShrink: 0,
    background: "transparent", border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)", color: "var(--ink-3)", cursor: "pointer", padding: 0,
  },
  sparkleBtnActive: {
    background: "#fdf4ff", border: "1px solid #e9d5ff", color: "#9333ea",
  },

  breakdownPanel: {
    background: "#fdf4ff", border: "1px solid #e9d5ff",
    borderRadius: "var(--r-md)", padding: "12px 14px", marginTop: "4px",
  },
  breakdownHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px",
  },
  breakdownTitle: {
    fontSize: "12px", fontWeight: "700", color: "#7e22ce", letterSpacing: "0.3px",
  },
  breakdownClose: {
    background: "transparent", border: "none", cursor: "pointer",
    color: "var(--ink-3)", padding: 0, display: "flex",
  },
  breakdownLoading: {
    fontSize: "13px", color: "#a855f7", margin: 0, fontStyle: "italic",
  },
  breakdownList: { display: "flex", flexDirection: "column", gap: "7px" },
  breakdownItem: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px",
  },
  breakdownItemText: {
    fontSize: "13px", color: "#3b0764", flex: 1, lineHeight: 1.4,
  },
  breakdownAddBtn: {
    display: "flex", alignItems: "center", gap: "3px",
    fontSize: "11px", fontWeight: "600", color: "#9333ea",
    background: "#f3e8ff", border: "1px solid #d8b4fe",
    borderRadius: "6px", padding: "3px 8px", cursor: "pointer",
    flexShrink: 0, whiteSpace: "nowrap",
  },
  breakdownAdded: {
    display: "flex", alignItems: "center", gap: "3px",
    fontSize: "11px", fontWeight: "600", color: "var(--color-done)", whiteSpace: "nowrap",
  },
};

const itemStyles = {
  card: {
    display: "flex", alignItems: "flex-start", gap: "10px",
    padding: "10px 0",
    borderBottom: "1px solid var(--border)",
  },
  cardDone: { opacity: 0.5 },
  checkBtn: { background: "transparent", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", flexShrink: 0, marginTop: "1px" },
  body: { flex: 1, minWidth: 0 },
  title: { display: "block", fontSize: "14px", fontWeight: "500", color: "var(--ink)", marginBottom: "3px", wordBreak: "break-word" },
  titleDone: { textDecoration: "line-through", color: "var(--ink-3)" },
  meta: { display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" },
  taskName: { fontSize: "12px", color: "var(--ink-3)", fontWeight: "500" },
  subjectBadge: { fontSize: "11px", fontWeight: "500", padding: "1px 7px", borderRadius: "99px", background: "var(--rose-50)", color: "var(--rose-500)" },
  dueMini: { fontSize: "11px", fontWeight: "500" },
  actions: { display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 },
  actionBtn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "26px", height: "26px", background: "transparent",
    border: "1px solid var(--border)", borderRadius: "var(--r-sm)",
    color: "var(--ink-3)", cursor: "pointer", padding: 0,
  },
  removeBtn: { borderColor: "var(--color-overdue)30", color: "var(--color-overdue)" },
  confirmBtn: { background: "var(--color-done-bg)", borderColor: "var(--color-done)30", color: "var(--color-done)" },
  dateInput: {
    fontSize: "12px", border: "1px solid var(--border)", borderRadius: "var(--r-sm)",
    padding: "3px 6px", fontFamily: "inherit", outline: "none", width: "120px",
  },
};

const pomoStyles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" },
  sessionBadge: {
    fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "99px",
    background: "var(--rose-50)", color: "var(--rose-400)",
  },
  tabs: { display: "flex", gap: "8px", marginBottom: "20px" },
  tab: {
    flex: 1, padding: "7px 0", fontSize: "12px", fontWeight: "600",
    background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)",
    color: "var(--ink-3)", cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  ringWrap: { position: "relative", width: "120px", height: "120px", margin: "0 auto 20px" },
  timeOverlay: {
    position: "absolute", inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  timeText: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "26px", fontWeight: "400", letterSpacing: "1px",
    color: "var(--rose-400)",
    fontVariantNumeric: "tabular-nums",
  },
  controls: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  resetBtn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "36px", height: "36px", background: "transparent",
    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
    color: "var(--ink-3)", cursor: "pointer",
  },
  playBtn: {
    display: "flex", alignItems: "center", gap: "7px",
    padding: "9px 22px", border: "none", borderRadius: "var(--r-md)",
    background: "var(--rose-400)",
    color: "#fff", fontSize: "13px", fontWeight: "500", cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
};

const aiStyles = {
  sectionLabel: {
    fontSize: "11px", fontWeight: "600", textTransform: "uppercase",
    letterSpacing: "0.06em", color: "var(--ink-3)", margin: "0 0 10px 0",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  hint: { fontSize: "13px", color: "var(--ink-3)", margin: 0, fontStyle: "italic" },
  riskList: { display: "flex", flexDirection: "column", gap: "8px" },
  riskRow: { display: "flex", alignItems: "flex-start", gap: "8px" },
  riskBadge: {
    fontSize: "10px", fontWeight: "700", padding: "2px 7px",
    borderRadius: "99px", textTransform: "uppercase", letterSpacing: "0.5px",
    flexShrink: 0, marginTop: "2px",
  },
  riskInfo: { display: "flex", flexDirection: "column", gap: "1px" },
  riskTitle: { fontSize: "13px", fontWeight: "600", color: "var(--ink)" },
  riskSubject: { fontSize: "11px", color: "var(--rose-500)", fontWeight: "500" },
  riskReason: { fontSize: "12px", color: "var(--ink-3)", fontStyle: "italic" },
  divider: { height: "1px", background: "var(--border)", margin: "14px 0" },
  select: {
    width: "100%", padding: "8px 10px", fontSize: "13px",
    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    outline: "none", background: "var(--surface-2)", marginBottom: "8px",
    color: "var(--ink)", cursor: "pointer", boxSizing: "border-box",
  },
  generateBtn: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
    padding: "9px 0", background: "linear-gradient(135deg, #9333ea, #7e22ce)",
    color: "#fff", border: "none", borderRadius: "var(--r-md)",
    fontSize: "13px", fontWeight: "600", marginBottom: "10px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  breakdownList: { display: "flex", flexDirection: "column", gap: "7px" },
  breakdownRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" },
  breakdownText: { fontSize: "13px", color: "#3b0764", flex: 1, lineHeight: 1.4 },
  descTextarea: {
    width: "100%", padding: "8px 10px", fontSize: "13px",
    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    outline: "none", background: "var(--surface-2)", color: "var(--ink)",
    resize: "vertical", boxSizing: "border-box",
  },
};
