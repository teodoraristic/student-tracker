import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, X } from "lucide-react";
import useIsMobile from "../hooks/useIsMobile";
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
  if (!subjectId) return { bg: "var(--surface-3)", text: "var(--ink-3)" };
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
function SubtaskCard({ subtask, onToggle, onDelete, onUnplan, isBacklog, onAssign, weekDays, onDragStart, isDragging }) {
  const [hovered, setHovered] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const isMobile = useIsMobile();
  const color = subjectColor(subtask.subjectId);

  return (
    <div
      draggable={!isMobile}
      onDragStart={!isMobile ? (e => { e.dataTransfer.effectAllowed = "move"; onDragStart(); }) : undefined}
      style={{
        ...c.card,
        ...(subtask.done ? c.cardDone : {}),
        ...(hovered ? c.cardHover : {}),
        ...(isDragging ? c.cardDragging : {}),
        cursor: isMobile ? "default" : "grab",
      }}
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => { if (!isMobile) { setHovered(false); setAssigning(false); } }}
    >
      {/* Checkbox — hidden in backlog on mobile to avoid accidental "deletion" */}
      {!(isMobile && isBacklog) && (
        <button
          onClick={() => onToggle(subtask.id, !subtask.done)}
          style={{ ...c.checkbox, ...(subtask.done ? c.checkboxDone : {}) }}
          title={subtask.done ? "Mark undone" : "Mark done"}
        >
          {subtask.done && <Check size={10} strokeWidth={3} />}
        </button>
      )}

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

        {/* Mobile backlog: day picker */}
        {isMobile && isBacklog && (
          assigning ? (
            <div style={c.dayPicker}>
              {weekDays.map(day => {
                const dateStr = toDateStr(day);
                const dayIdx = (day.getDay() + 6) % 7;
                return (
                  <button
                    key={dateStr}
                    style={c.dayPickerBtn}
                    onClick={e => { e.stopPropagation(); onAssign(subtask.id, dateStr); setAssigning(false); }}
                  >
                    <span style={c.dayPickerDay}>{DAY_NAMES[dayIdx]}</span>
                    <span style={c.dayPickerNum}>{day.getDate()}</span>
                  </button>
                );
              })}
              <button style={c.dayPickerCancel} onClick={e => { e.stopPropagation(); setAssigning(false); }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              style={c.assignBtn}
              onClick={e => { e.stopPropagation(); setAssigning(true); }}
            >
              + Assign to day
            </button>
          )
        )}
      </div>

      {/* Actions on hover — only shown for planned (non-backlog) subtasks on desktop */}
      {hovered && !isBacklog && !isMobile && (
        <div style={c.actions}>
          <button
            onClick={() => onUnplan(subtask.id)}
            style={c.unplanBtn}
            title="Remove from plan"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Mobile non-backlog: unplan button always visible */}
      {isMobile && !isBacklog && (
        <button
          onClick={e => { e.stopPropagation(); onUnplan(subtask.id); }}
          style={c.unplanBtn}
          title="Remove from plan"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

// ─── DayColumn ────────────────────────────────────────────────────────────────
function DayColumn({ day, subtasks, filterSubjectId, onAdd, onToggle, onDelete, onUnplan, onDragStart, onDrop, isDragOver, draggingId }) {
  const dateStr = toDateStr(day);
  const isToday = dateStr === getTodayStr();
  const dayIdx = (day.getDay() + 6) % 7;

  const filtered = useMemo(
    () => filterSubjectId ? subtasks.filter(st => st.subjectId === filterSubjectId) : subtasks,
    [subtasks, filterSubjectId]
  );

  const doneCount = filtered.filter(st => st.done).length;

  return (
    <div
      style={{
        ...col.column,
        ...(isToday ? col.columnToday : {}),
        ...(isDragOver ? col.columnDragOver : {}),
      }}
      onDragOver={e => { e.preventDefault(); onDrop.onDragOver(); }}
      onDragLeave={onDrop.onDragLeave}
      onDrop={e => { e.preventDefault(); onDrop.onDrop(); }}
    >
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
              onDragStart={() => onDragStart(st.id, "day", dateStr)}
              isDragging={draggingId === st.id}
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
function BacklogSection({ backlog, filterSubjectId, weekDays, onToggle, onDelete, onAssign, onDragStart, onDrop, isDragOver, draggingId }) {
  const filtered = useMemo(
    () => filterSubjectId ? backlog.filter(st => st.subjectId === filterSubjectId) : backlog,
    [backlog, filterSubjectId]
  );

  if (filtered.length === 0 && !isDragOver) return null;

  return (
    <div
      style={{ ...bl.section, ...(isDragOver ? bl.sectionDragOver : {}) }}
      onDragOver={e => { e.preventDefault(); onDrop.onDragOver(); }}
      onDragLeave={onDrop.onDragLeave}
      onDrop={e => { e.preventDefault(); onDrop.onDrop(); }}
    >
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
            onDragStart={() => onDragStart(st.id, "backlog", null)}
            isDragging={draggingId === st.id}
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
  const isMobile = useIsMobile();
  const {
    weekStart, weekDays, subtasksByDay, backlog, loading,
    goToPrev, goToNext, goToThisWeek,
    refetch, setSubtasksByDay, setBacklog,
  } = useWeeklyPlanner();

  const [filterSubjectId, setFilterSubjectId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [addModal, setAddModal] = useState(null); // { date: "YYYY-MM-DD" } | null
  const [dragInfo, setDragInfo] = useState(null);   // { id, sourceType, sourceDateStr }
  const [dragOverTarget, setDragOverTarget] = useState(null); // { type, dateStr } | null

  useEffect(() => {
    getAllSubjects().then(setSubjects).catch(console.error);
  }, []);

  const todayWeekStart = getMondayOf(new Date());
  const isCurrentWeek = toDateStr(weekStart) === toDateStr(todayWeekStart);

  const activeSubjects = useMemo(
    () => subjects.filter(s => s.status === "IN_PROGRESS" || !s.status),
    [subjects]
  );
  const finalizedSubjectIds = useMemo(
    () => new Set(subjects.filter(s => s.status === "PASSED" || s.status === "FAILED").map(s => s.id)),
    [subjects]
  );
  const activeBacklog = useMemo(
    () => backlog.filter(st => !finalizedSubjectIds.has(st.subjectId)),
    [backlog, finalizedSubjectIds]
  );

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

  const handleDragStart = useCallback((id, sourceType, sourceDateStr) => {
    setDragInfo({ id, sourceType, sourceDateStr });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragInfo(null);
    setDragOverTarget(null);
  }, []);

  const handleDrop = useCallback(async (targetType, targetDateStr) => {
    if (!dragInfo) return;
    const { id, sourceType, sourceDateStr } = dragInfo;
    setDragInfo(null);
    setDragOverTarget(null);

    if (targetType === sourceType && targetDateStr === sourceDateStr) return;

    if (targetType === "backlog") {
      await handleUnplan(id);
    } else if (sourceType === "backlog") {
      await handleAssign(id, targetDateStr);
    } else {
      // day → different day
      try {
        await updateSubtaskPlan(id, targetDateStr);
        setSubtasksByDay(prev => {
          const st = prev[sourceDateStr]?.find(s => s.id === id);
          if (!st) return prev;
          const next = { ...prev };
          next[sourceDateStr] = prev[sourceDateStr].filter(s => s.id !== id);
          if (targetDateStr in next) {
            next[targetDateStr] = [...prev[targetDateStr], { ...st, plannedForDate: targetDateStr }];
          }
          return next;
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [dragInfo, handleUnplan, handleAssign, setSubtasksByDay]);

  const makeDayDropProps = useCallback((targetType, targetDateStr) => ({
    onDragOver:  () => setDragOverTarget({ type: targetType, dateStr: targetDateStr }),
    onDragLeave: () => setDragOverTarget(null),
    onDrop:      () => handleDrop(targetType, targetDateStr),
  }), [handleDrop]);

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
    <div style={{ ...s.page, padding: isMobile ? "16px" : "32px" }} onDragEnd={handleDragEnd}>
      {/* Header */}
      <div style={isMobile ? s.headerMobile : s.header}>
        <div style={s.headerLeft}>
          {!isMobile && <h1 style={s.pageTitle}>Weekly Planner</h1>}
          <span style={s.weekRange}>{formatWeekRange(weekStart)}</span>
        </div>
        <div style={isMobile ? s.headerRightMobile : s.headerRight}>
          <select
            value={filterSubjectId ?? ""}
            onChange={e => setFilterSubjectId(e.target.value ? Number(e.target.value) : null)}
            style={{ ...s.filterSelect, flex: isMobile ? 1 : undefined }}
          >
            <option value="">All subjects</option>
            {activeSubjects.map(sub => (
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

      {/* 7-column grid — horizontally scrollable on mobile */}
      <div style={isMobile ? s.gridScrollWrapper : undefined}>
      <div style={isMobile ? s.gridMobile : s.grid}>
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
            onDragStart={handleDragStart}
            onDrop={makeDayDropProps("day", toDateStr(day))}
            isDragOver={dragOverTarget?.type === "day" && dragOverTarget?.dateStr === toDateStr(day)}
            draggingId={dragInfo?.id}
          />
        ))}
      </div>
      </div>

      {/* Backlog */}
      <BacklogSection
        backlog={activeBacklog}
        filterSubjectId={filterSubjectId}
        weekDays={weekDays}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onAssign={handleAssign}
        onDragStart={handleDragStart}
        onDrop={makeDayDropProps("backlog", null)}
        isDragOver={dragOverTarget?.type === "backlog"}
        draggingId={dragInfo?.id}
      />

      {/* Add Subtask Modal */}
      {addModal && (
        <AddSubtaskModal
          date={addModal.date}
          subjects={activeSubjects}
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
    background: "var(--surface-3)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    boxSizing: "border-box",
  },
  loadingWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "var(--surface-3)",
  },
  loadingText: {
    color: "var(--ink-3)",
    fontSize: "15px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
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
    fontSize: "32px",
    fontWeight: "400",
    color: "var(--ink)",
    margin: 0,
    fontFamily: "'Instrument Serif', serif",
  },
  weekRange: {
    fontSize: "14px",
    color: "var(--ink-3)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  filterSelect: {
    padding: "8px 12px",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    fontSize: "13px",
    color: "var(--ink)",
    cursor: "pointer",
    outline: "none",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  navGroup: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    padding: "4px",
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px",
    borderRadius: "var(--r-sm)",
    border: "none",
    background: "transparent",
    color: "var(--ink-3)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  navBtnActive: {
    background: "var(--rose-400)",
    color: "#ffffff",
  },
  gridScrollWrapper: {
    overflowX: "auto",
    marginLeft: "-16px",
    marginRight: "-16px",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingBottom: "8px",
  },
  gridMobile: {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(150px, 1fr))",
    gap: "8px",
    width: "max-content",
    minWidth: "100%",
  },
  headerMobile: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "16px",
  },
  headerRightMobile: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
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
    background: "var(--surface)",
    borderRadius: "var(--r-lg)",
    border: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    minHeight: "320px",
    overflow: "hidden",
  },
  columnToday: {
    border: "1.5px solid var(--rose-400)",
    background: "var(--rose-50)",
  },
  columnDragOver: {
    border: "2px dashed var(--rose-400)",
    background: "var(--rose-50)",
  },
  header: {
    padding: "12px 12px 8px",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "baseline",
    gap: "5px",
  },
  dayName: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--ink-3)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  dayNum: {
    fontSize: "20px",
    fontWeight: "400",
    color: "var(--ink)",
    lineHeight: 1,
    fontFamily: "'Instrument Serif', serif",
  },
  dayNumToday: {
    color: "var(--rose-400)",
  },
  progress: {
    marginLeft: "auto",
    fontSize: "11px",
    color: "var(--ink-3)",
    fontWeight: "500",
    fontFamily: "'DM Sans', system-ui, sans-serif",
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
    color: "var(--ink-4)",
    textAlign: "center",
    marginTop: "24px",
    userSelect: "none",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    margin: "8px",
    padding: "7px",
    borderRadius: "var(--r-md)",
    border: "1.5px dashed var(--border)",
    background: "transparent",
    color: "var(--ink-3)",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
};

const c = {
  card: {
    display: "flex",
    alignItems: "flex-start",
    gap: "7px",
    padding: "7px 8px",
    borderRadius: "var(--r-sm)",
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
    position: "relative",
    transition: "background 0.15s ease, border-color 0.15s ease",
  },
  cardDone: {
    opacity: 0.55,
  },
  cardDragging: {
    opacity: 0.4,
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
  },
  cardHover: {
    background: "var(--surface-3)",
    border: "1px solid var(--border-2)",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    minWidth: "16px",
    borderRadius: "50%",
    border: "1.5px solid var(--ink-4)",
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
    background: "var(--color-done)",
    border: "1.5px solid var(--color-done)",
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
    color: "var(--ink)",
    lineHeight: 1.35,
    wordBreak: "break-word",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  cardTitleDone: {
    textDecoration: "line-through",
    color: "var(--ink-3)",
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
    fontFamily: "'DM Sans', system-ui, sans-serif",
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
    padding: "5px 8px",
    borderRadius: "var(--r-sm)",
    border: "1px dashed var(--rose-400)",
    background: "var(--rose-50)",
    color: "var(--rose-500)",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    marginTop: "4px",
    width: "fit-content",
  },
  dayPicker: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    marginTop: "6px",
    alignItems: "center",
  },
  dayPickerBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "4px 6px",
    borderRadius: "var(--r-sm)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    cursor: "pointer",
    minWidth: "36px",
  },
  dayPickerDay: {
    fontSize: "9px",
    fontWeight: "600",
    color: "var(--ink-3)",
    textTransform: "uppercase",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  dayPickerNum: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--ink)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    lineHeight: 1,
  },
  dayPickerCancel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    border: "none",
    background: "transparent",
    color: "var(--ink-3)",
    cursor: "pointer",
    borderRadius: "var(--r-sm)",
    padding: 0,
  },
  unplanBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "22px",
    height: "22px",
    borderRadius: "var(--r-sm)",
    border: "1px solid var(--color-overdue-bg)",
    background: "var(--color-overdue-bg)",
    color: "var(--color-overdue)",
    cursor: "pointer",
    padding: 0,
  },
  deleteBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "22px",
    height: "22px",
    borderRadius: "var(--r-sm)",
    border: "1px solid var(--color-overdue-bg)",
    background: "var(--color-overdue-bg)",
    color: "var(--color-overdue)",
    cursor: "pointer",
    padding: 0,
  },
  dayPicker: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    padding: "3px",
  },
  dayPickerBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "3px 5px",
    borderRadius: "var(--r-sm)",
    border: "none",
    background: "transparent",
    color: "var(--ink-3)",
    fontSize: "9px",
    fontWeight: "600",
    cursor: "pointer",
    lineHeight: 1,
    gap: "1px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  dayPickerNum: {
    fontSize: "10px",
    fontWeight: "700",
    color: "var(--ink)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  dayPickerCancel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "18px",
    height: "18px",
    borderRadius: "var(--r-sm)",
    border: "none",
    background: "transparent",
    color: "var(--ink-3)",
    cursor: "pointer",
    padding: 0,
  },
};

const bl = {
  section: {
    background: "var(--surface)",
    borderRadius: "var(--r-lg)",
    border: "1px solid var(--border)",
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
    fontWeight: "600",
    color: "var(--ink)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  count: {
    fontSize: "12px",
    color: "var(--ink-3)",
    background: "var(--surface-3)",
    padding: "2px 8px",
    borderRadius: "99px",
    fontWeight: "500",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  list: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  sectionDragOver: {
    border: "2px dashed var(--rose-400)",
    background: "var(--rose-50)",
  },
};

const mo = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(26, 21, 35, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "var(--surface)",
    borderRadius: "var(--r-xl)",
    padding: "24px",
    width: "420px",
    maxWidth: "90vw",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    border: "1px solid var(--border)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  modalTitle: {
    fontSize: "22px",
    fontWeight: "400",
    color: "var(--ink)",
    fontFamily: "'Instrument Serif', serif",
  },
  closeBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "var(--r-sm)",
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
    color: "var(--ink-3)",
    cursor: "pointer",
    padding: 0,
  },
  dateLabel: {
    fontSize: "13px",
    color: "var(--rose-400)",
    fontWeight: "600",
    marginBottom: "16px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
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
    color: "var(--ink)",
    letterSpacing: "0.02em",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  select: {
    padding: "9px 12px",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    fontSize: "13px",
    color: "var(--ink)",
    background: "var(--surface)",
    outline: "none",
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  input: {
    padding: "9px 12px",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    fontSize: "13px",
    color: "var(--ink)",
    background: "var(--surface)",
    outline: "none",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  footer: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "4px",
  },
  cancelBtn: {
    padding: "8px 18px",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    background: "var(--surface-3)",
    color: "var(--ink)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  submitBtn: {
    padding: "8px 18px",
    borderRadius: "var(--r-md)",
    border: "none",
    background: "var(--rose-400)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  submitDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
};
