import { useState, useEffect, useMemo, useCallback } from "react";
import { getAllTasks, createTask } from "../services/taskService";
import { getAllSubjects } from "../services/subjectService";
import Modal from "../components/common/Modal";
import TaskForm from "../components/tasks/TaskForm";
import Badge from "../components/ui/Badge";
import { ChevronLeft, ChevronRight, Plus, Clock, BookOpen } from "lucide-react";
import { PriorityLabels } from "../utils/enums";

// ── Constants ──────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PRIORITY_COLORS = {
  LOW:    { bg: "#dcfce7", color: "#16a34a" },
  MEDIUM: { bg: "#fef3c7", color: "#d97706" },
  HIGH:   { bg: "#fee2e2", color: "#dc2626" },
};

// ── Date helpers ───────────────────────────────────────────────────────────────
const toDateStr = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

// Handles both string ("2026-02-28") and array ([2026, 2, 28]) from Jackson
const normalizeDueDate = (raw) => {
  if (!raw) return null;
  if (Array.isArray(raw)) return toDateStr(raw[0], raw[1] - 1, raw[2]);
  return String(raw);
};

const getTodayStr = () => {
  const now = new Date();
  return toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
};

const getWeekDays = (anchorDate) => {
  const start = new Date(anchorDate);
  // (getDay() + 6) % 7 converts Sun=0→6, Mon=1→0, Tue=2→1, … so week starts on Monday
  start.setDate(anchorDate.getDate() - ((anchorDate.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

// ── Custom hook: calendar navigation ──────────────────────────────────────────
function useCalendar() {
  const [viewMode, setViewMode] = useState("month"); // "month" | "week"
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(getTodayStr);

  const goToPrev = useCallback(() => {
    setCurrentDate((prev) => {
      if (viewMode === "month") return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }, [viewMode]);

  const goToNext = useCallback(() => {
    setCurrentDate((prev) => {
      if (viewMode === "month") return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }, [viewMode]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(getTodayStr());
  }, []);

  return { viewMode, setViewMode, currentDate, selectedDate, setSelectedDate, goToPrev, goToNext, goToToday };
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState("");
  const [hoveredDate, setHoveredDate] = useState(null);

  const { viewMode, setViewMode, currentDate, selectedDate, setSelectedDate, goToPrev, goToNext, goToToday } = useCalendar();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksData, subjectsData] = await Promise.all([getAllTasks(), getAllSubjects()]);
        setTasks(tasksData);
        setSubjects(subjectsData);
      } catch (err) {
        console.error("Failed to fetch calendar data:", err);
        setError("Failed to load calendar data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────────
  const todayStr = useMemo(getTodayStr, []);
  const todayMidnight = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const filteredTasks = useMemo(
    () => filterSubjectId ? tasks.filter((t) => t.subjectId === Number(filterSubjectId)) : tasks,
    [tasks, filterSubjectId]
  );

  const tasksByDate = useMemo(() => {
    const map = {};
    filteredTasks.forEach((task) => {
      const key = normalizeDueDate(task.dueDate);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return map;
  }, [filteredTasks]);

  const selectedTasks = useMemo(
    () => (selectedDate ? tasksByDate[selectedDate] || [] : []),
    [selectedDate, tasksByDate]
  );

  // Group selected-day tasks by subject for the date panel
  const tasksBySubject = useMemo(() => {
    const groups = {};
    selectedTasks.forEach((task) => {
      if (!groups[task.subjectId]) groups[task.subjectId] = [];
      groups[task.subjectId].push(task);
    });
    return Object.entries(groups).map(([subjectId, subTasks]) => ({
      subject: subjects.find((s) => s.id === Number(subjectId)),
      tasks: subTasks,
    }));
  }, [selectedTasks, subjects]);

  // Calendar grid values
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  // Monday-based offset: Sun=0→6, Mon=1→0, Tue=2→1, …
  const firstDay = useMemo(() => (new Date(year, month, 1).getDay() + 6) % 7, [year, month]);
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  // Task color helpers
  const getDotColor = useCallback((task) => {
    if (task.status === "DONE") return "#059669";
    const key = normalizeDueDate(task.dueDate);
    if (key && new Date(key + "T00:00:00") < todayMidnight) return "#dc2626";
    return "#f43f5e";
  }, [todayMidnight]);

  const getStatusColor = useCallback((task) => {
    if (task.status === "DONE") return "#059669";
    const key = normalizeDueDate(task.dueDate);
    if (key && new Date(key + "T00:00:00") < todayMidnight) return "#dc2626";
    return "#d4d4d4";
  }, [todayMidnight]);

  // Handlers
  const handleAddTask = useCallback(async (formData) => {
    if (!selectedSubjectId) {
      alert("Please select a subject for this assignment.");
      return;
    }
    try {
      const newTask = await createTask({ ...formData, subjectId: Number(selectedSubjectId) });
      setTasks((prev) => [...prev, newTask]);
      setIsModalOpen(false);
      setSelectedSubjectId("");
    } catch (err) {
      console.error("Failed to create task:", err);
      alert("Failed to create assignment. Please try again.");
    }
  }, [selectedSubjectId]);

  const openModal = useCallback(() => {
    if (!subjects.length) { alert("Please create a subject first before adding assignments."); return; }
    setIsModalOpen(true);
  }, [subjects.length]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSubjectId("");
  }, []);

  const navLabel = viewMode === "month"
    ? `${MONTH_NAMES[month]} ${year}`
    : `${weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  if (loading) return (
    <div style={s.centered}>
      <span style={s.loadingText}>Loading…</span>
    </div>
  );

  if (error) return (
    <div style={s.centered}>
      <span style={s.errorText}>{error}</span>
      <button style={s.retryBtn} onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div style={s.page}>

      {/* Page header */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Calendar</h1>
          <p style={s.pageSubtitle}>View and manage your assignments by date</p>
        </div>
        <div style={s.headerRight}>
          <select
            style={s.filterSelect}
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
          >
            <option value="">All subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
          <div style={s.viewToggle}>
            <button
              style={{ ...s.viewBtn, ...(viewMode === "month" ? s.viewBtnActive : {}) }}
              onClick={() => setViewMode("month")}
            >
              Month
            </button>
            <button
              style={{ ...s.viewBtn, ...(viewMode === "week" ? s.viewBtnActive : {}) }}
              onClick={() => setViewMode("week")}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={s.layout}>

        {/* Calendar card */}
        <div style={s.calCard}>
          <div style={s.nav}>
            <button style={s.navBtn} onClick={goToPrev}><ChevronLeft size={18} /></button>
            <span style={s.navLabel}>{navLabel}</span>
            <button style={s.navBtn} onClick={goToNext}><ChevronRight size={18} /></button>
            <button style={s.todayBtn} onClick={goToToday}>Today</button>
          </div>

          {viewMode === "month" ? (
            <MonthGrid
              year={year}
              month={month}
              daysInMonth={daysInMonth}
              firstDay={firstDay}
              todayStr={todayStr}
              selectedDate={selectedDate}
              hoveredDate={hoveredDate}
              tasksByDate={tasksByDate}
              onSelectDate={setSelectedDate}
              onHoverDate={setHoveredDate}
              getDotColor={getDotColor}
            />
          ) : (
            <WeekView
              weekDays={weekDays}
              todayStr={todayStr}
              selectedDate={selectedDate}
              tasksByDate={tasksByDate}
              onSelectDate={setSelectedDate}
              getDotColor={getDotColor}
            />
          )}
        </div>

        {/* Date panel */}
        <div style={s.panel}>
          {selectedDate ? (
            <>
              <div style={s.panelHead}>
                <div>
                  <p style={s.panelDate}>
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long", month: "long", day: "numeric",
                    })}
                  </p>
                  <p style={s.panelCount}>
                    {selectedTasks.length === 0
                      ? "No assignments"
                      : `${selectedTasks.length} assignment${selectedTasks.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <button style={s.addBtn} onClick={openModal}>
                  <Plus size={14} />
                  Add Assignment
                </button>
              </div>

              {tasksBySubject.length === 0 ? (
                <EmptyState message="No assignments on this date" />
              ) : (
                <div style={s.groups}>
                  {tasksBySubject.map(({ subject, tasks: subTasks }) => (
                    <SubjectGroup
                      key={subject?.id ?? "unknown"}
                      subject={subject}
                      tasks={subTasks}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <EmptyState message="Select a date to view assignments" />
          )}
        </div>

      </div>

      {/* Add Task Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Add Assignment">
        <div style={s.mSubjectField}>
          <label style={s.mLabel}>Subject *</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            style={s.mSelect}
          >
            <option value="">Select a subject…</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>
        <TaskForm
          defaultDate={selectedDate || ""}
          onSubmit={handleAddTask}
          onCancel={closeModal}
        />
      </Modal>

    </div>
  );
}

// ── MonthGrid ─────────────────────────────────────────────────────────────────
function MonthGrid({ year, month, daysInMonth, firstDay, todayStr, selectedDate, hoveredDate, tasksByDate, onSelectDate, onHoverDate, getDotColor }) {
  return (
    <>
      <div style={g.headers}>
        {DAY_NAMES.map((d) => <div key={d} style={g.headerCell}>{d}</div>)}
      </div>
      <div style={g.grid}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`pad${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = toDateStr(year, month, day);
          return (
            <DayCell
              key={day}
              day={day}
              dateStr={dateStr}
              tasks={tasksByDate[dateStr] || []}
              isToday={dateStr === todayStr}
              isSelected={dateStr === selectedDate}
              isHovered={dateStr === hoveredDate && dateStr !== selectedDate}
              onSelect={onSelectDate}
              onHover={onHoverDate}
              getDotColor={getDotColor}
            />
          );
        })}
      </div>
    </>
  );
}

// ── DayCell ───────────────────────────────────────────────────────────────────
function DayCell({ day, dateStr, tasks, isToday, isSelected, isHovered, onSelect, onHover, getDotColor }) {
  const visibleTasks = tasks.slice(0, 3);
  const extraCount = tasks.length - 3;

  return (
    <div
      style={{
        ...g.cell,
        ...(isHovered ? g.cellHover : {}),
        ...(isToday && !isSelected ? g.cellToday : {}),
        ...(isSelected ? g.cellSelected : {}),
      }}
      onClick={() => onSelect(dateStr)}
      onMouseEnter={() => onHover(dateStr)}
      onMouseLeave={() => onHover(null)}
    >
      <span style={{
        ...g.dayNum,
        ...(isToday && !isSelected ? g.dayNumToday : {}),
        ...(isSelected ? g.dayNumSelected : {}),
      }}>
        {day}
      </span>
      {tasks.length > 0 && (
        <div style={g.dotsRow}>
          {visibleTasks.map((task, idx) => (
            <TaskDot
              key={task.id ?? idx}
              task={task}
              color={getDotColor(task)}
              isSelected={isSelected}
            />
          ))}
          {extraCount > 0 && (
            <span style={{ ...g.extra, color: isSelected ? "rgba(255,255,255,0.75)" : "#a3a3a3" }}>
              +{extraCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── TaskDot with tooltip ───────────────────────────────────────────────────────
function TaskDot({ task, color, isSelected }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div style={{ position: "relative", display: "flex" }}>
      <div
        style={{ ...g.dot, background: isSelected ? "rgba(255,255,255,0.85)" : color }}
        onMouseEnter={(e) => { e.stopPropagation(); setShowTip(true); }}
        onMouseLeave={() => setShowTip(false)}
      />
      {showTip && <div style={g.tooltip}>{task.title}</div>}
    </div>
  );
}

// ── WeekView ──────────────────────────────────────────────────────────────────
function WeekView({ weekDays, todayStr, selectedDate, tasksByDate, onSelectDate, getDotColor }) {
  return (
    <div style={wk.container}>
      {weekDays.map((day) => {
        const dateStr = toDateStr(day.getFullYear(), day.getMonth(), day.getDate());
        const dayTasks = tasksByDate[dateStr] || [];
        const isToday = dateStr === todayStr;
        const isSelected = dateStr === selectedDate;

        return (
          <div
            key={dateStr}
            style={{
              ...wk.col,
              ...(isToday && !isSelected ? wk.colToday : {}),
              ...(isSelected ? wk.colSelected : {}),
            }}
            onClick={() => onSelectDate(dateStr)}
          >
            <div style={wk.colHeader}>
              <span style={wk.dayLabel}>{DAY_NAMES[(day.getDay() + 6) % 7]}</span>
              <span style={{
                ...wk.dayNum,
                ...(isToday ? wk.dayNumToday : {}),
                ...(isSelected ? wk.dayNumSelected : {}),
              }}>
                {day.getDate()}
              </span>
            </div>
            <div style={wk.tasksList}>
              {dayTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  style={{ ...wk.taskChip, borderLeft: `3px solid ${getDotColor(task)}` }}
                >
                  <span style={wk.chipTitle}>
                    {task.title.length > 18 ? task.title.slice(0, 18) + "…" : task.title}
                  </span>
                </div>
              ))}
              {dayTasks.length > 3 && (
                <span style={wk.more}>+{dayTasks.length - 3} more</span>
              )}
              {dayTasks.length === 0 && (
                <span style={wk.empty}>—</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── SubjectGroup ──────────────────────────────────────────────────────────────
function SubjectGroup({ subject, tasks, getStatusColor }) {
  return (
    <div style={p.group}>
      <div style={p.groupHeader}>
        <BookOpen size={12} color="#f43f5e" />
        <span style={p.groupName}>{subject?.name || "Unknown Subject"}</span>
        <span style={p.groupBadge}>{tasks.length}</span>
      </div>
      {tasks.map((task) => {
        const pc = PRIORITY_COLORS[task.priority] || { bg: "#f5f5f5", color: "#737373" };
        return (
          <div key={task.id} style={p.taskRow}>
            <div style={{ ...p.statusDot, background: getStatusColor(task) }} />
            <span style={p.taskTitle}>{task.title}</span>
            <Badge style={{ background: pc.bg, color: pc.color, fontSize: "11px", flexShrink: 0 }}>
              {PriorityLabels[task.priority] || task.priority}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <div style={p.empty}>
      <div style={p.emptyIconWrap}>
        <Clock size={24} color="#d4d4d4" />
      </div>
      <span style={p.emptyMsg}>{message}</span>
      <span style={p.emptyHint}>Assignments with due dates appear here</span>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  page: { width: "100%", maxWidth: "1400px", margin: "0 auto" },
  centered: {
    display: "flex", flexDirection: "column", justifyContent: "center",
    alignItems: "center", minHeight: "400px", gap: "16px",
  },
  loadingText: { fontSize: "15px", color: "#a3a3a3" },
  errorText: { fontSize: "15px", color: "#dc2626" },
  retryBtn: {
    padding: "9px 20px", background: "#f43f5e", border: "none",
    borderRadius: "9px", color: "#ffffff", fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },

  pageHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
    marginBottom: "28px",
  },
  pageTitle: { fontSize: "28px", fontWeight: "700", color: "#171717", margin: "0 0 4px 0" },
  pageSubtitle: { fontSize: "14px", color: "#a3a3a3", margin: 0 },

  headerRight: { display: "flex", alignItems: "center", gap: "10px" },
  filterSelect: {
    padding: "8px 12px", border: "1px solid #e5e5e5", borderRadius: "9px",
    fontSize: "13px", color: "#525252", background: "#fafafa",
    fontFamily: "inherit", outline: "none", cursor: "pointer",
  },
  viewToggle: {
    display: "flex", background: "#f5f5f5", borderRadius: "9px", padding: "3px", gap: "2px",
  },
  viewBtn: {
    padding: "6px 14px", background: "transparent", border: "none",
    borderRadius: "7px", fontSize: "13px", fontWeight: "500", color: "#737373", cursor: "pointer",
  },
  viewBtnActive: {
    background: "#ffffff", color: "#171717", fontWeight: "600",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },

  layout: { display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", alignItems: "start" },
  calCard: { background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px", padding: "24px" },

  nav: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" },
  navBtn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "34px", height: "34px", background: "#fafafa",
    border: "1px solid #e5e5e5", borderRadius: "9px", color: "#525252", cursor: "pointer",
  },
  navLabel: { flex: 1, textAlign: "center", fontSize: "17px", fontWeight: "700", color: "#171717" },
  todayBtn: {
    padding: "7px 16px", background: "#171717", border: "none",
    borderRadius: "8px", fontSize: "13px", fontWeight: "600", color: "#ffffff", cursor: "pointer",
  },

  panel: {
    background: "#ffffff", border: "1px solid #e5e5e5", borderRadius: "16px",
    padding: "22px", minHeight: "320px",
  },
  panelHead: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px",
  },
  panelDate: { fontSize: "16px", fontWeight: "700", color: "#171717", margin: "0 0 3px 0" },
  panelCount: { fontSize: "13px", color: "#a3a3a3", margin: 0 },
  addBtn: {
    display: "inline-flex", alignItems: "center", gap: "5px",
    padding: "7px 14px", background: "#f43f5e", border: "none",
    borderRadius: "8px", fontSize: "13px", fontWeight: "600", color: "#ffffff", cursor: "pointer",
  },
  groups: { display: "flex", flexDirection: "column", gap: "12px" },

  mSubjectField: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" },
  mLabel: { fontSize: "14px", fontWeight: "600", color: "#171717" },
  mSelect: {
    padding: "12px 14px", fontSize: "15px", border: "1px solid #e5e5e5",
    borderRadius: "10px", fontFamily: "inherit", outline: "none",
    background: "#ffffff", cursor: "pointer",
  },
};

// Month grid
const g = {
  headers: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "4px" },
  headerCell: {
    textAlign: "center", fontSize: "12px", fontWeight: "600",
    color: "#a3a3a3", padding: "6px 0", letterSpacing: "0.3px",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" },
  cell: {
    aspectRatio: "1", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "flex-start",
    padding: "8px 4px 6px", borderRadius: "10px",
    cursor: "pointer", transition: "background 0.15s ease", gap: "4px",
  },
  cellHover: { background: "#f5f5f5" },
  cellToday: { background: "#fff1f2" },
  cellSelected: { background: "#f43f5e" },
  dayNum: { fontSize: "14px", fontWeight: "500", color: "#171717", lineHeight: 1 },
  dayNumToday: { color: "#f43f5e", fontWeight: "700" },
  dayNumSelected: { color: "#ffffff", fontWeight: "700" },
  dotsRow: { display: "flex", gap: "3px", alignItems: "center" },
  dot: { width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0 },
  extra: { fontSize: "9px", fontWeight: "600" },
  tooltip: {
    position: "absolute", bottom: "calc(100% + 5px)", left: "50%",
    transform: "translateX(-50%)",
    background: "#171717", color: "#ffffff",
    fontSize: "11px", fontWeight: "500",
    padding: "4px 8px", borderRadius: "6px",
    whiteSpace: "nowrap", zIndex: 200, pointerEvents: "none",
  },
};

// Week view
const wk = {
  container: {
    display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px", minHeight: "260px",
  },
  col: {
    display: "flex", flexDirection: "column", borderRadius: "10px",
    border: "1px solid #f0f0f0", overflow: "hidden", cursor: "pointer",
    transition: "border-color 0.15s ease",
  },
  colToday: { border: "1px solid #fecdd3", background: "#fff9fa" },
  colSelected: { border: "1px solid #f43f5e", background: "#fff1f2" },
  colHeader: {
    padding: "10px 8px 8px", borderBottom: "1px solid #f5f5f5",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
  },
  dayLabel: {
    fontSize: "10px", fontWeight: "700", color: "#a3a3a3",
    textTransform: "uppercase", letterSpacing: "0.5px",
  },
  dayNum: { fontSize: "18px", fontWeight: "700", color: "#171717", lineHeight: 1 },
  dayNumToday: { color: "#f43f5e" },
  dayNumSelected: { color: "#f43f5e" },
  tasksList: { flex: 1, padding: "6px", display: "flex", flexDirection: "column", gap: "3px" },
  taskChip: { padding: "3px 6px", background: "#fafafa", borderRadius: "4px" },
  chipTitle: {
    fontSize: "10px", color: "#525252", fontWeight: "500",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    display: "block",
  },
  more: { fontSize: "10px", color: "#a3a3a3", fontWeight: "500", paddingLeft: "4px" },
  empty: { fontSize: "12px", color: "#d4d4d4", textAlign: "center", paddingTop: "8px" },
};

// Date panel
const p = {
  group: {
    background: "#fafafa", border: "1px solid #f0f0f0",
    borderRadius: "12px", overflow: "hidden",
  },
  groupHeader: {
    display: "flex", alignItems: "center", gap: "7px",
    padding: "10px 14px", background: "#f5f5f5", borderBottom: "1px solid #ebebeb",
  },
  groupName: { flex: 1, fontSize: "13px", fontWeight: "700", color: "#171717" },
  groupBadge: {
    fontSize: "11px", fontWeight: "600", color: "#737373",
    background: "#e5e5e5", borderRadius: "20px", padding: "1px 8px",
  },
  taskRow: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px 14px", borderBottom: "1px solid #f0f0f0",
  },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  taskTitle: { flex: 1, fontSize: "13px", color: "#171717", fontWeight: "500" },
  empty: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "10px", padding: "50px 20px", textAlign: "center",
  },
  emptyIconWrap: {
    width: "52px", height: "52px", borderRadius: "14px",
    background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center",
  },
  emptyMsg: { fontSize: "14px", fontWeight: "600", color: "#525252" },
  emptyHint: { fontSize: "13px", color: "#a3a3a3" },
};
