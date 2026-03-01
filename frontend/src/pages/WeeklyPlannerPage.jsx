import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, X } from "lucide-react";
import {
  getSubtasksByDate,
  getUnplannedSubtasks,
  toggleSubtaskDone,
  updateSubtaskPlan,
  deleteSubtask,
  createSubtask,
} from "../services/subtaskService";
import { getAllSubjects } from "../services/subjectService";
import { getTasksBySubjectId } from "../services/taskService";

// ─── Constants ────────────────────────────────────────────────────────────────
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const SUBJECT_HUES = [210, 340, 150, 40, 280, 20, 190, 310];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMondayOf(date) {
  const d = new Date(date);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toDateStr(date) {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

function getTodayStr() {
  return toDateStr(new Date());
}

function formatWeekRange(monday) {
  const sunday = addDays(monday, 6);
  const m1 = MONTH_SHORT[monday.getMonth()];
  const m2 = MONTH_SHORT[sunday.getMonth()];
  const year = sunday.getFullYear();
  if (m1 === m2) {
    return `${m1} ${monday.getDate()} – ${sunday.getDate()}, ${year}`;
  }
  return `${m1} ${monday.getDate()} – ${m2} ${sunday.getDate()}, ${year}`;
}

function subjectColor(subjectId) {
  if (!subjectId) return { bg: "#f3f4f6", text: "#6b7280" };
  const hue = SUBJECT_HUES[subjectId % SUBJECT_HUES.length];
  return {
    bg: `hsl(${hue}, 70%, 94%)`,
    text: `hsl(${hue}, 60%, 35%)`,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
function useWeeklyPlanner() {
  const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()));
  const [subtasksByDay, setSubtasksByDay] = useState({});
  const [backlog, setBacklog] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dayResults, unplanned] = await Promise.all([
        Promise.all(weekDays.map(d => getSubtasksByDate(toDateStr(d)))),
        getUnplannedSubtasks(),
      ]);
      const map = {};
      weekDays.forEach((d, i) => {
        map[toDateStr(d)] = dayResults[i];
      });
      setSubtasksByDay(map);
      setBacklog(unplanned);
    } catch (e) {
      console.error("Failed to fetch planner data", e);
    } finally {
      setLoading(false);
    }
  }, [weekDays]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const goToPrev = useCallback(() => setWeekStart(d => addDays(d, -7)), []);
  const goToNext = useCallback(() => setWeekStart(d => addDays(d, 7)), []);
  const goToThisWeek = useCallback(() => setWeekStart(getMondayOf(new Date())), []);

  return {
    weekStart, weekDays, subtasksByDay, backlog, loading,
    goToPrev, goToNext, goToThisWeek,
    refetch: fetchAll,
    setSubtasksByDay, setBacklog,
  };
}

// ─── SubtaskCard ──────────────────────────────────────────────────────────────
function SubtaskCard({ subtask, onToggle, onDelete, onUnplan, isBacklog, onAssign, weekDays }) {
  const [hovered, setHovered] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const color = subjectColor(subtask.subjectId);

  return (
    <div
      style={{
        ...c.card,
        ...(subtask.done ? c.cardDone : {}),
        ...(hovered ? c.cardHover : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setAssigning(false); }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(subtask.id, !subtask.done)}
        style={{ ...c.checkbox, ...(subtask.done ? c.checkboxDone : {}) }}
        title={subtask.done ? "Mark undone" : "Mark done"}
      >
        {subtask.done && <Check size={10} strokeWidth={3} />}
      </button>

      {/* Content */}
      <div style={c.cardBody}>
        <div style={{ ...c.cardTitle, ...(subtask.done ? c.cardTitleDone : {}) }}>
          {subtask.title}
        </div>
        {subtask.subjectName && (
          <span style={{ ...c.subjectBadge, background: color.bg, color: color.text }}>
            {subtask.subjectName}
          </span>
        )}
      </div>

      {/* Actions on hover */}
      {hovered && (
        <div style={c.actions}>
          {isBacklog ? (
            assigning ? (
              <div style={c.dayPicker}>
                {weekDays.map(day => (
                  <button
                    key={toDateStr(day)}
                    onClick={() => { onAssign(subtask.id, toDateStr(day)); setAssigning(false); }}
                    style={c.dayPickerBtn}
                    title={toDateStr(day)}
                  >
                    {DAY_NAMES[(day.getDay() + 6) % 7].slice(0, 1)}
                    <span style={c.dayPickerNum}>{day.getDate()}</span>
                  </button>
                ))}
                <button onClick={() => setAssigning(false)} style={c.dayPickerCancel}>
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAssigning(true)}
                style={c.assignBtn}
                title="Assign to a day this week"
              >
                <Plus size={12} />
                Plan
              </button>
            )
          ) : (
            <button
              onClick={() => onUnplan(subtask.id)}
              style={c.unplanBtn}
              title="Remove from plan"
            >
              <X size={12} />
            </button>
          )}
          <button
            onClick={() => onDelete(subtask.id)}
            style={c.deleteBtn}
            title="Delete subtask"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── DayColumn ────────────────────────────────────────────────────────────────
function DayColumn({ day, subtasks, filterSubjectId, onAdd, onToggle, onDelete, onUnplan }) {
  const dateStr = toDateStr(day);
  const isToday = dateStr === getTodayStr();
  const dayIdx = (day.getDay() + 6) % 7;

  const filtered = useMemo(
    () => filterSubjectId ? subtasks.filter(st => st.subjectId === filterSubjectId) : subtasks,
    [subtasks, filterSubjectId]
  );

  const doneCount = filtered.filter(st => st.done).length;

  return (
    <div style={{ ...col.column, ...(isToday ? col.columnToday : {}) }}>
      <div style={col.header}>
        <div style={col.dayName}>{DAY_NAMES[dayIdx]}</div>
        <div style={{ ...col.dayNum, ...(isToday ? col.dayNumToday : {}) }}>
          {day.getDate()}
        </div>
        {filtered.length > 0 && (
          <div style={col.progress}>{doneCount}/{filtered.length}</div>
        )}
      </div>

      <div style={col.list}>
        {filtered.length === 0 ? (
          <div style={col.emptyMsg}>Nothing to do</div>
        ) : (
          filtered.map(st => (
            <SubtaskCard
              key={st.id}
              subtask={st}
              onToggle={onToggle}
              onDelete={onDelete}
              onUnplan={onUnplan}
            />
          ))
        )}
      </div>

      <button onClick={() => onAdd(dateStr)} style={col.addBtn}>
        <Plus size={14} />
        Add
      </button>
    </div>
  );
}

// ─── BacklogSection ───────────────────────────────────────────────────────────
function BacklogSection({ backlog, filterSubjectId, weekDays, onToggle, onDelete, onAssign }) {
  const filtered = useMemo(
    () => filterSubjectId ? backlog.filter(st => st.subjectId === filterSubjectId) : backlog,
    [backlog, filterSubjectId]
  );

  if (filtered.length === 0) return null;

  return (
    <div style={bl.section}>
      <div style={bl.header}>
        <span style={bl.title}>Backlog</span>
        <span style={bl.count}>{filtered.length} unplanned</span>
      </div>
      <div style={bl.list}>
        {filtered.map(st => (
          <SubtaskCard
            key={st.id}
            subtask={st}
            onToggle={onToggle}
            onDelete={onDelete}
            onUnplan={() => {}}
            onAssign={onAssign}
            isBacklog
            weekDays={weekDays}
          />
        ))}
      </div>
    </div>
  );
}

// ─── AddSubtaskModal ──────────────────────────────────────────────────────────
function AddSubtaskModal({ date, subjects, onClose, onCreate }) {
  const [subjectId, setSubjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskId, setTaskId] = useState("");
  const [title, setTitle] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!subjectId) { setTasks([]); setTaskId(""); return; }
      setLoadingTasks(true);
      try {
        const data = await getTasksBySubjectId(subjectId);
        if (!cancelled) { setTasks(data); setLoadingTasks(false); }
      } catch {
        if (!cancelled) setLoadingTasks(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [subjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !taskId) return;
    await onCreate({ title: title.trim(), taskId: Number(taskId), plannedForDate: date });
    onClose();
  };

  const dateLabel = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric",
      })
    : "";

  return (
    <div
      style={mo.overlay}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={mo.modal}>
        <div style={mo.modalHeader}>
          <span style={mo.modalTitle}>New Subtask</span>
          <button onClick={onClose} style={mo.closeBtn}><X size={18} /></button>
        </div>
        {date && <div style={mo.dateLabel}>{dateLabel}</div>}

        <form onSubmit={handleSubmit} style={mo.form}>
          <div style={mo.field}>
            <label style={mo.label}>Subject</label>
            <select
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              style={mo.select}
              required
            >
              <option value="">Select subject...</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div style={mo.field}>
            <label style={mo.label}>Assignment</label>
            <select
              value={taskId}
              onChange={e => setTaskId(e.target.value)}
              style={mo.select}
              required
              disabled={!subjectId || loadingTasks}
            >
              <option value="">
                {!subjectId ? "Select subject first" : loadingTasks ? "Loading..." : "Select assignment..."}
              </option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div style={mo.field}>
            <label style={mo.label}>Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              style={mo.input}
              autoFocus
              required
            />
          </div>

          <div style={mo.footer}>
            <button type="button" onClick={onClose} style={mo.cancelBtn}>Cancel</button>
            <button
              type="submit"
              style={{ ...mo.submitBtn, ...(!title.trim() || !taskId ? mo.submitDisabled : {}) }}
              disabled={!title.trim() || !taskId}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WeeklyPlannerPage() {
  const {
    weekStart, weekDays, subtasksByDay, backlog, loading,
    goToPrev, goToNext, goToThisWeek,
    refetch, setSubtasksByDay, setBacklog,
  } = useWeeklyPlanner();

  const [filterSubjectId, setFilterSubjectId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [addModal, setAddModal] = useState(null); // { date: "YYYY-MM-DD" } | null

  useEffect(() => {
    getAllSubjects().then(setSubjects).catch(console.error);
  }, []);

  const todayWeekStart = getMondayOf(new Date());
  const isCurrentWeek = toDateStr(weekStart) === toDateStr(todayWeekStart);

  // ── Handlers ──
  const handleToggle = useCallback(async (id, done) => {
    try {
      await toggleSubtaskDone(id, done);
      setSubtasksByDay(prev => {
        const next = {};
        for (const key of Object.keys(prev)) {
          next[key] = prev[key].map(st => st.id === id ? { ...st, done } : st);
        }
        return next;
      });
      // done backlog items disappear from backlog; undone items stay
      setBacklog(prev => done
        ? prev.filter(st => st.id !== id)
        : prev.map(st => st.id === id ? { ...st, done } : st)
      );
    } catch (e) {
      console.error(e);
    }
  }, [setSubtasksByDay, setBacklog]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteSubtask(id);
      setSubtasksByDay(prev => {
        const next = {};
        for (const key of Object.keys(prev)) {
          next[key] = prev[key].filter(st => st.id !== id);
        }
        return next;
      });
      setBacklog(prev => prev.filter(st => st.id !== id));
    } catch (e) {
      console.error(e);
    }
  }, [setSubtasksByDay, setBacklog]);

  const handleUnplan = useCallback(async (id) => {
    try {
      await updateSubtaskPlan(id, null);
      let found = null;
      setSubtasksByDay(prev => {
        const next = {};
        for (const key of Object.keys(prev)) {
          const st = prev[key].find(st => st.id === id);
          if (st) found = st;
          next[key] = prev[key].filter(st => st.id !== id);
        }
        return next;
      });
      if (found) setBacklog(prev => [{ ...found, plannedForDate: null }, ...prev]);
    } catch (e) {
      console.error(e);
    }
  }, [setSubtasksByDay, setBacklog]);

  const handleAssign = useCallback(async (id, dateStr) => {
    try {
      await updateSubtaskPlan(id, dateStr);
      let found = null;
      setBacklog(prev => {
        found = prev.find(st => st.id === id);
        return prev.filter(st => st.id !== id);
      });
      if (found) {
        setSubtasksByDay(prev => {
          if (!(dateStr in prev)) return prev;
          return { ...prev, [dateStr]: [...prev[dateStr], { ...found, plannedForDate: dateStr }] };
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, [setBacklog, setSubtasksByDay]);

  const handleCreate = useCallback(async (data) => {
    try {
      await createSubtask(data);
      refetch();
    } catch (e) {
      console.error(e);
    }
  }, [refetch]);

  if (loading) {
    return (
      <div style={s.loadingWrap}>
        <div style={s.loadingText}>Loading planner...</div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <h1 style={s.pageTitle}>Weekly Planner</h1>
          <span style={s.weekRange}>{formatWeekRange(weekStart)}</span>
        </div>
        <div style={s.headerRight}>
          <select
            value={filterSubjectId ?? ""}
            onChange={e => setFilterSubjectId(e.target.value ? Number(e.target.value) : null)}
            style={s.filterSelect}
          >
            <option value="">All subjects</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>

          <div style={s.navGroup}>
            <button onClick={goToPrev} style={s.navBtn} title="Previous week">
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goToThisWeek}
              style={{ ...s.navBtn, ...(isCurrentWeek ? s.navBtnActive : {}) }}
            >
              Today
            </button>
            <button onClick={goToNext} style={s.navBtn} title="Next week">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 7-column grid */}
      <div style={s.grid}>
        {weekDays.map(day => (
          <DayColumn
            key={toDateStr(day)}
            day={day}
            subtasks={subtasksByDay[toDateStr(day)] ?? []}
            filterSubjectId={filterSubjectId}
            onAdd={date => setAddModal({ date })}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onUnplan={handleUnplan}
          />
        ))}
      </div>

      {/* Backlog */}
      <BacklogSection
        backlog={backlog}
        filterSubjectId={filterSubjectId}
        weekDays={weekDays}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onAssign={handleAssign}
      />

      {/* Add Subtask Modal */}
      {addModal && (
        <AddSubtaskModal
          date={addModal.date}
          subjects={subjects}
          onClose={() => setAddModal(null)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    padding: "32px",
    minHeight: "100vh",
    background: "#f9fafb",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  loadingWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f9fafb",
  },
  loadingText: {
    color: "#737373",
    fontSize: "15px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  pageTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#171717",
    margin: 0,
  },
  weekRange: {
    fontSize: "14px",
    color: "#737373",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  filterSelect: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e5e5e5",
    background: "#fff",
    fontSize: "14px",
    color: "#171717",
    cursor: "pointer",
    outline: "none",
  },
  navGroup: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "10px",
    padding: "4px",
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px",
    borderRadius: "7px",
    border: "none",
    background: "transparent",
    color: "#737373",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  navBtnActive: {
    background: "#f43f5e",
    color: "#ffffff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "10px",
    marginBottom: "24px",
  },
};

const col = {
  column: {
    background: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e5e5",
    display: "flex",
    flexDirection: "column",
    minHeight: "320px",
    overflow: "hidden",
  },
  columnToday: {
    border: "1.5px solid #f43f5e",
    background: "#fffbfc",
  },
  header: {
    padding: "12px 12px 8px",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    alignItems: "baseline",
    gap: "5px",
  },
  dayName: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#9ca3af",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  dayNum: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#171717",
    lineHeight: 1,
  },
  dayNumToday: {
    color: "#f43f5e",
  },
  progress: {
    marginLeft: "auto",
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: "500",
  },
  list: {
    flex: 1,
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    overflowY: "auto",
  },
  emptyMsg: {
    fontSize: "12px",
    color: "#d1d5db",
    textAlign: "center",
    marginTop: "24px",
    userSelect: "none",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    margin: "8px",
    padding: "7px",
    borderRadius: "8px",
    border: "1.5px dashed #e5e5e5",
    background: "transparent",
    color: "#9ca3af",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
  },
};

const c = {
  card: {
    display: "flex",
    alignItems: "flex-start",
    gap: "7px",
    padding: "7px 8px",
    borderRadius: "7px",
    border: "1px solid #f3f4f6",
    background: "#fafafa",
    position: "relative",
    transition: "background 0.15s ease, border-color 0.15s ease",
  },
  cardDone: {
    opacity: 0.55,
  },
  cardHover: {
    background: "#f3f4f6",
    border: "1px solid #e5e5e5",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    minWidth: "16px",
    borderRadius: "50%",
    border: "1.5px solid #d1d5db",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    padding: 0,
    marginTop: "2px",
    flexShrink: 0,
  },
  checkboxDone: {
    background: "#22c55e",
    border: "1.5px solid #22c55e",
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  cardTitle: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#171717",
    lineHeight: 1.35,
    wordBreak: "break-word",
  },
  cardTitleDone: {
    textDecoration: "line-through",
    color: "#9ca3af",
  },
  subjectBadge: {
    display: "inline-block",
    fontSize: "9px",
    fontWeight: "700",
    padding: "2px 5px",
    borderRadius: "4px",
    letterSpacing: "0.03em",
    width: "fit-content",
    textTransform: "uppercase",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    flexShrink: 0,
  },
  assignBtn: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    padding: "3px 6px",
    borderRadius: "5px",
    border: "1px solid #e5e5e5",
    background: "#fff",
    color: "#374151",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  unplanBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "22px",
    height: "22px",
    borderRadius: "5px",
    border: "1px solid #fde8e8",
    background: "#fff5f5",
    color: "#ef4444",
    cursor: "pointer",
    padding: 0,
  },
  deleteBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "22px",
    height: "22px",
    borderRadius: "5px",
    border: "1px solid #fee2e2",
    background: "#fff5f5",
    color: "#dc2626",
    cursor: "pointer",
    padding: 0,
  },
  dayPicker: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: "6px",
    padding: "3px",
  },
  dayPickerBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "3px 5px",
    borderRadius: "4px",
    border: "none",
    background: "transparent",
    color: "#6b7280",
    fontSize: "9px",
    fontWeight: "600",
    cursor: "pointer",
    lineHeight: 1,
    gap: "1px",
  },
  dayPickerNum: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#171717",
  },
  dayPickerCancel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "18px",
    height: "18px",
    borderRadius: "4px",
    border: "none",
    background: "transparent",
    color: "#9ca3af",
    cursor: "pointer",
    padding: 0,
  },
};

const bl = {
  section: {
    background: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e5e5e5",
    padding: "16px 20px",
    marginBottom: "20px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  title: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
  },
  count: {
    fontSize: "12px",
    color: "#9ca3af",
    background: "#f3f4f6",
    padding: "2px 8px",
    borderRadius: "99px",
    fontWeight: "500",
  },
  list: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
};

const mo = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    width: "420px",
    maxWidth: "90vw",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  modalTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#171717",
  },
  closeBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "none",
    background: "#f3f4f6",
    color: "#6b7280",
    cursor: "pointer",
    padding: 0,
  },
  dateLabel: {
    fontSize: "13px",
    color: "#f43f5e",
    fontWeight: "600",
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
    letterSpacing: "0.02em",
  },
  select: {
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #e5e5e5",
    fontSize: "14px",
    color: "#171717",
    background: "#fafafa",
    outline: "none",
    cursor: "pointer",
  },
  input: {
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #e5e5e5",
    fontSize: "14px",
    color: "#171717",
    background: "#fafafa",
    outline: "none",
  },
  footer: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "4px",
  },
  cancelBtn: {
    padding: "9px 16px",
    borderRadius: "8px",
    border: "1px solid #e5e5e5",
    background: "transparent",
    color: "#737373",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "9px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#f43f5e",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  submitDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
};
