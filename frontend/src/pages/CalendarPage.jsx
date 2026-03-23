import { useState, useEffect, useMemo, useCallback } from "react";
import { getAllTasks, createTask } from "../services/taskService";
import { getAllSubjects } from "../services/subjectService";
import { getAllExamPeriods } from "../services/examPeriodService";
import Modal from "../components/common/Modal";
import TaskForm from "../components/tasks/TaskForm";
import { SUBJECT_COLORS } from "../utils/subjectColors";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronRightIcon, Plus, Clock, GraduationCap } from "lucide-react";
import { getSubtasksByTaskId } from "../services/subtaskService";
import useIsMobile from "../hooks/useIsMobile";
// ── Constants ──────────────────────────────────────────────────────────────────
const EXAM_PERIOD_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ec4899", "#14b8a6", "#f97316", "#6366f1"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

const formatEpDate = (raw) => {
  const str = normalizeDueDate(raw);
  if (!str) return "";
  return new Date(str + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
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
  const [selectedDate, setSelectedDate] = useState(null);

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
    setSelectedDate(null);
  }, []);

  return { viewMode, setViewMode, currentDate, selectedDate, setSelectedDate, goToPrev, goToNext, goToToday };
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const isMobile = useIsMobile();
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examPeriods, setExamPeriods] = useState([]);
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
        const [tasksData, subjectsData, epData] = await Promise.all([getAllTasks(), getAllSubjects(), getAllExamPeriods()]);
        setTasks(tasksData);
        setSubjects(subjectsData);
        setExamPeriods(epData);
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

  const handleSelectDate = useCallback((dateStr) => {
    setSelectedDate(prev => prev === dateStr ? null : dateStr);
  }, [setSelectedDate]);

  // Exam period date map: dateStr → examPeriod
  const examPeriodByDate = useMemo(() => {
    const map = {};
    examPeriods.forEach(ep => {
      const start = normalizeDueDate(ep.startDate);
      const end = normalizeDueDate(ep.endDate);
      if (!start || !end) return;
      const cur = new Date(start + "T00:00:00");
      const endD = new Date(end + "T00:00:00");
      while (cur <= endD) {
        const key = toDateStr(cur.getFullYear(), cur.getMonth(), cur.getDate());
        if (!map[key]) map[key] = ep;
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [examPeriods]);

  const examPeriodColorMap = useMemo(() => {
    const map = {};
    examPeriods.forEach((ep, i) => { map[ep.id] = EXAM_PERIOD_COLORS[i % EXAM_PERIOD_COLORS.length]; });
    return map;
  }, [examPeriods]);

  // Calendar grid values
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthTasks = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return filteredTasks
      .filter(t => normalizeDueDate(t.dueDate)?.startsWith(prefix))
      .sort((a, b) => (normalizeDueDate(a.dueDate) || "").localeCompare(normalizeDueDate(b.dueDate) || ""));
  }, [filteredTasks, year, month]);

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  // Monday-based offset: Sun=0→6, Mon=1→0, Tue=2→1, …
  const firstDay = useMemo(() => (new Date(year, month, 1).getDay() + 6) % 7, [year, month]);
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const weekTasks = useMemo(() => {
    const weekDateStrs = new Set(weekDays.map(d => toDateStr(d.getFullYear(), d.getMonth(), d.getDate())));
    return filteredTasks
      .filter(t => weekDateStrs.has(normalizeDueDate(t.dueDate)))
      .sort((a, b) => (normalizeDueDate(a.dueDate) || "").localeCompare(normalizeDueDate(b.dueDate) || ""));
  }, [filteredTasks, weekDays]);

  // Exam periods visible in current view
  const examPeriodsInView = useMemo(() => {
    const viewStart = viewMode === "month" ? new Date(year, month, 1) : weekDays[0];
    const viewEnd = viewMode === "month" ? new Date(year, month + 1, 0) : weekDays[6];
    return examPeriods.filter(ep => {
      const start = normalizeDueDate(ep.startDate);
      const end = normalizeDueDate(ep.endDate);
      if (!start || !end) return false;
      return new Date(start + "T00:00:00") <= viewEnd && new Date(end + "T00:00:00") >= viewStart;
    });
  }, [examPeriods, viewMode, year, month, weekDays]);

  // Task color helpers
  const getDotColor = useCallback((task) => {
    if (task.examPeriodId) return "var(--color-due-soon)";
    if (task.status === "DONE") return "var(--color-done)";
    const key = normalizeDueDate(task.dueDate);
    if (key && new Date(key + "T00:00:00") < todayMidnight) return "var(--color-overdue)";
    return "var(--rose-400)";
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
      <div style={isMobile ? s.pageHeaderMobile : s.pageHeader}>
        {!isMobile && (
          <div>
            <h1 style={s.pageTitle}>Calendar</h1>
            <p style={s.pageSubtitle}>View and manage your assignments by date</p>
          </div>
        )}
        <div style={isMobile ? s.headerRightMobile : s.headerRight}>
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
      <div style={isMobile ? s.layoutMobile : s.layout}>

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
              examPeriodByDate={examPeriodByDate}
              examPeriodColorMap={examPeriodColorMap}
              subjects={subjects}
              onSelectDate={handleSelectDate}
              onHoverDate={setHoveredDate}
              getDotColor={getDotColor}
            />
          ) : (
            <WeekView
              weekDays={weekDays}
              todayStr={todayStr}
              selectedDate={selectedDate}
              tasksByDate={tasksByDate}
              examPeriodByDate={examPeriodByDate}
              examPeriodColorMap={examPeriodColorMap}
              onSelectDate={handleSelectDate}
              getDotColor={getDotColor}
            />
          )}
          {examPeriodsInView.length > 0 && (
            <div style={g.legend}>
              {examPeriodsInView.map(ep => {
                const epColor = examPeriodColorMap[ep.id];
                const undatedExams = tasks.filter(t => t.examPeriodId === ep.id && !t.dueDate);
                return (
                  <div key={ep.id} style={g.legendBlock}>
                    <div style={g.legendItem}>
                      <div style={{ ...g.legendDot, background: epColor }} />
                      <span style={g.legendName}>{ep.name}</span>
                      <span style={g.legendDates}>
                        {formatEpDate(ep.startDate)} – {formatEpDate(ep.endDate)}
                      </span>
                    </div>
                    {undatedExams.length > 0 && (
                      <div style={g.legendExams}>
                        {undatedExams.map(t => {
                          const subName = subjects.find(s => s.id === t.subjectId)?.name;
                          return (
                            <span key={t.id} style={{ ...g.legendExamChip, background: `${epColor}18`, color: epColor }}>
                              {subName ?? t.title}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Date panel */}
        <div style={s.panel}>
          {selectedDate ? (
            <>
              <div style={s.panelHead}>
                <p style={s.panelTitle}>
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long", month: "long", day: "numeric",
                  })}
                </p>
                <div style={s.panelHeadActions}>
                  <button style={s.addIconBtn} onClick={openModal} title="Add assignment">
                    <Plus size={16} />
                  </button>
                  <button style={s.backBtn} onClick={() => setSelectedDate(null)} title="Back to month view">
                    ✕
                  </button>
                </div>
              </div>
              <p style={s.panelCount}>
                {selectedTasks.length} assignment{selectedTasks.length !== 1 ? "s" : ""}
              </p>
              {selectedTasks.length === 0 ? (
                <EmptyState message="No assignments on this date" />
              ) : (
                <div style={s.taskCards}>
                  {selectedTasks.map(task => (
                    <TaskOverviewCard key={task.id} task={task} subjects={subjects} />
                  ))}
                </div>
              )}
            </>
          ) : viewMode === "week" ? (
            <>
              <div style={s.panelHead}>
                <p style={s.panelTitle}>
                  {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {" – "}
                  {weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <p style={s.panelCount}>
                {weekTasks.length} assignment{weekTasks.length !== 1 ? "s" : ""}
              </p>
              {weekTasks.length === 0 ? (
                <EmptyState message="No assignments this week" />
              ) : (
                <div style={s.monthTaskList}>
                  {weekTasks.map(task => (
                    <TaskOverviewCard key={task.id} task={task} subjects={subjects} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={s.panelHead}>
                <p style={s.panelTitle}>{MONTH_NAMES[month]} {year}</p>
              </div>
              <p style={s.panelCount}>
                {monthTasks.length} assignment{monthTasks.length !== 1 ? "s" : ""}
              </p>
              {monthTasks.length === 0 ? (
                <EmptyState message="No assignments this month" />
              ) : (
                <div style={s.monthTaskList}>
                  {monthTasks.map(task => (
                    <TaskOverviewCard key={task.id} task={task} subjects={subjects} />
                  ))}
                </div>
              )}
            </>
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
function MonthGrid({ year, month, daysInMonth, firstDay, todayStr, selectedDate, hoveredDate, tasksByDate, examPeriodByDate, examPeriodColorMap, subjects, onSelectDate, onHoverDate, getDotColor }) {
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
              examPeriod={examPeriodByDate[dateStr] || null}
              examColor={examPeriodByDate[dateStr] ? examPeriodColorMap[examPeriodByDate[dateStr].id] : null}
              subjects={subjects}
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
function DayCell({ day, dateStr, tasks, isToday, isSelected, isHovered, examPeriod, examColor, subjects, onSelect, onHover, getDotColor }) {
  const visibleTasks = tasks.slice(0, 3);
  const extraCount = tasks.length - 3;

  return (
    <div
      style={{
        ...g.cell,
        ...(examPeriod && !isSelected && !isToday && examColor ? { background: `${examColor}12` } : {}),
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
        <div style={g.taskList}>
          {visibleTasks.map((task, idx) => {
            const subjectName = subjects?.find(s => s.id === task.subjectId)?.name;
            return (
              <div key={task.id ?? idx} style={g.taskLine}>
                <div style={{ ...g.dot, background: isSelected ? "rgba(255,255,255,0.85)" : getDotColor(task) }} />
                <span style={{ ...g.taskLineTitle, color: isSelected ? "rgba(255,255,255,0.9)" : "var(--ink-2)" }}>
                  {task.title.length > 10 ? task.title.slice(0, 10) + "…" : task.title}
                </span>
                {subjectName && (
                  <span style={{ ...g.taskLineSubject, color: isSelected ? "rgba(255,255,255,0.6)" : "var(--ink-4)" }}>
                    {subjectName.length > 7 ? subjectName.slice(0, 7) + "…" : subjectName}
                  </span>
                )}
              </div>
            );
          })}
          {extraCount > 0 && (
            <span style={{ ...g.extra, color: isSelected ? "rgba(255,255,255,0.75)" : "var(--ink-3)" }}>
              +{extraCount}
            </span>
          )}
        </div>
      )}
      {examPeriod && (
        <div style={{
          ...g.examBar,
          background: isSelected ? "rgba(255,255,255,0.45)" : (examColor ?? "var(--color-due-soon)"),
        }} />
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
function WeekView({ weekDays, todayStr, selectedDate, tasksByDate, examPeriodByDate, examPeriodColorMap, onSelectDate, getDotColor }) {
  return (
    <div style={wk.container}>
      {weekDays.map((day) => {
        const dateStr = toDateStr(day.getFullYear(), day.getMonth(), day.getDate());
        const dayTasks = tasksByDate[dateStr] || [];
        const isToday = dateStr === todayStr;
        const isSelected = dateStr === selectedDate;
        const examPeriod = examPeriodByDate[dateStr] || null;
        const epColor = examPeriod ? examPeriodColorMap[examPeriod.id] : null;

        return (
          <div
            key={dateStr}
            style={{
              ...wk.col,
              ...(examPeriod && !isToday && !isSelected && epColor
                ? { background: `${epColor}0e`, borderColor: `${epColor}55` }
                : {}),
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
              {examPeriod && epColor && (
                <span style={{ ...wk.examBadge, color: epColor, background: `${epColor}20` }}>exam</span>
              )}
            </div>
            <div style={wk.tasksList}>
              {dayTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  style={{
                    ...wk.taskChip,
                    borderLeft: `3px solid ${getDotColor(task)}`,
                    ...(task.examPeriodId ? { background: "var(--color-due-soon-bg)" } : {}),
                  }}
                >
                  {task.examPeriodId && <GraduationCap size={11} color="var(--color-due-soon)" style={{ flexShrink: 0 }} />}
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

// ── TaskOverviewCard ──────────────────────────────────────────────────────────
function TaskOverviewCard({ task, subjects }) {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [subtasksLoaded, setSubtasksLoaded] = useState(false);

  const subject = subjects.find(s => s.id === task.subjectId);
  const accentColor = subject?.color ?? SUBJECT_COLORS[(subject?.id || 0) % SUBJECT_COLORS.length];
  const isDone = task.status === "DONE";
  const isExam = !!task.examPeriodId;

  const handleToggleSubtasks = async () => {
    if (!subtasksLoaded) {
      try {
        const data = await getSubtasksByTaskId(task.id);
        setSubtasks(data);
        setSubtasksLoaded(true);
      } catch (err) {
        console.error("Failed to fetch subtasks:", err);
      }
    }
    setShowSubtasks(prev => !prev);
  };

  return (
    <div style={{
      ...oc.card,
      border: `1.5px solid ${accentColor}`,
      background: isDone ? "var(--surface-2)" : `${accentColor}12`,
      opacity: isDone ? 0.65 : 1,
    }}>
      <div style={oc.cardTop}>
        <div style={oc.cardLeft}>
          {isExam && <span style={oc.examBadge}>Exam</span>}
          <span style={{ ...oc.taskTitle, ...(isDone ? oc.taskTitleDone : {}) }}>
            {task.title}
          </span>
        </div>
          <button style={oc.subtaskToggleBtn} onClick={handleToggleSubtasks} title="View subtasks">
            {showSubtasks ? <ChevronDown size={13} /> : <ChevronRightIcon size={13} />}
          </button>
      </div>

      <div style={oc.cardMeta}>
        {subject && (
          <span style={{ ...oc.subjectChip, background: `${accentColor}20`, color: accentColor }}>
            {subject.name}
          </span>
        )}
        {task.points > 0 && (
          <span style={oc.pointsChip}>
            {isDone && task.earnedPoints != null
              ? `${task.earnedPoints} / ${task.points} pts`
              : `${task.points} pts`}
          </span>
        )}
        {task.examPeriodName && (
          <span style={oc.periodChip}>{task.examPeriodName}</span>
        )}
      </div>

      {showSubtasks && (
        <div style={oc.subtasksList}>
          {!subtasksLoaded && <span style={oc.subtasksHint}>Loading…</span>}
          {subtasksLoaded && subtasks.length === 0 && (
            <span style={oc.subtasksHint}>No subtasks</span>
          )}
          {subtasksLoaded && subtasks.map(st => (
            <div key={st.id} style={oc.subtaskItem}>
              <div style={{ ...oc.subtaskDot, background: st.done ? "var(--color-done)" : "var(--ink-4)" }} />
              <span style={{ ...oc.subtaskText, ...(st.done ? oc.subtaskDone : {}) }}>
                {st.title}
              </span>
            </div>
          ))}
        </div>
      )}
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
  loadingText: { fontSize: "15px", color: "var(--ink-3)" },
  errorText: { fontSize: "15px", color: "var(--color-overdue)" },
  retryBtn: {
    padding: "7px 16px", background: "var(--rose-400)", border: "none",
    borderRadius: "var(--r-md)", color: "#ffffff", fontSize: "13px", fontWeight: "500", cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  pageHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
    marginBottom: "24px",
  },
  pageTitle: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "32px", fontWeight: "400", color: "var(--ink)", margin: "0 0 4px 0",
  },
  pageSubtitle: { fontSize: "14px", color: "var(--ink-3)", margin: 0 },

  headerRight: { display: "flex", alignItems: "center", gap: "10px" },
  filterSelect: {
    padding: "7px 12px", border: "1px solid var(--border)", borderRadius: "var(--r-md)",
    fontSize: "13px", color: "var(--ink-2)", background: "var(--surface)",
    fontFamily: "'DM Sans', system-ui, sans-serif", outline: "none", cursor: "pointer",
  },
  viewToggle: {
    display: "flex", background: "var(--surface-3)", borderRadius: "var(--r-sm)", padding: "3px", gap: "2px",
  },
  viewBtn: {
    padding: "5px 12px", background: "transparent", border: "none",
    borderRadius: "6px", fontSize: "13px", fontWeight: "500", color: "var(--ink-3)", cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  viewBtnActive: {
    background: "var(--surface)", color: "var(--ink)", fontWeight: "600",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },

  layout: { display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "start" },
  layoutMobile: { display: "flex", flexDirection: "column", gap: "16px" },
  pageHeaderMobile: { display: "flex", justifyContent: "flex-end", marginBottom: "12px" },
  headerRightMobile: { display: "flex", alignItems: "center", gap: "8px", width: "100%" },
  calCard: {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)", padding: "24px",
  },

  nav: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" },
  navBtn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "32px", height: "32px", background: "var(--surface-2)",
    border: "1px solid var(--border)", borderRadius: "var(--r-sm)", color: "var(--ink-2)", cursor: "pointer",
  },
  navLabel: {
    flex: 1, textAlign: "center",
    fontFamily: "'Instrument Serif', serif",
    fontSize: "18px", fontWeight: "400", color: "var(--ink)",
  },
  todayBtn: {
    padding: "6px 14px", background: "var(--ink)", border: "none",
    borderRadius: "var(--r-sm)", fontSize: "13px", fontWeight: "500", color: "var(--surface)", cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  panel: {
    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)",
    padding: "20px", minHeight: "320px",
  },
  panelHead: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px",
  },
  panelDate: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "16px", fontWeight: "400", color: "var(--ink)", margin: "0 0 3px 0",
  },
  panelCount: { fontSize: "13px", color: "var(--ink-3)", margin: "0 0 14px 0" },
  addIconBtn: {
    width: "32px", height: "32px",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "var(--rose-400)", border: "none",
    borderRadius: "var(--r-sm)", color: "#ffffff", cursor: "pointer",
  },
  taskCards: { display: "flex", flexDirection: "column", gap: "8px" },

  mSubjectField: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" },
  mLabel: { fontSize: "13px", fontWeight: "600", color: "var(--ink)", fontFamily: "'DM Sans', system-ui, sans-serif" },
  mSelect: {
    padding: "10px 12px", fontSize: "13px", border: "1px solid var(--border)",
    borderRadius: "var(--r-md)", fontFamily: "'DM Sans', system-ui, sans-serif", outline: "none",
    background: "var(--surface)", cursor: "pointer", color: "var(--ink)",
  },
  panelTitle: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "18px", fontWeight: "400", color: "var(--ink)", margin: 0,
  },
  panelHeadActions: { display: "flex", alignItems: "center", gap: "6px" },
  backBtn: {
    width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--r-sm)",
    color: "var(--ink-3)", fontSize: "13px", cursor: "pointer",
  },
  monthTaskList: { display: "flex", flexDirection: "column", gap: "4px", marginTop: "2px" },
};

// Month grid
const g = {
  headers: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "4px" },
  headerCell: {
    textAlign: "center", fontSize: "11px", fontWeight: "600",
    color: "var(--ink-3)", padding: "6px 0", letterSpacing: "0.06em",
    textTransform: "uppercase", fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" },
  cell: {
    height: "96px", display: "flex", flexDirection: "column",
    alignItems: "flex-start", justifyContent: "flex-start",
    padding: "6px 5px 5px", borderRadius: "var(--r-sm)",
    cursor: "pointer", transition: "background 0.15s ease", gap: "3px",
    position: "relative", overflow: "hidden",
  },
  cellHover: { background: "var(--surface-3)" },
  cellToday: { background: "var(--rose-50)" },
  cellSelected: { background: "var(--rose-400)" },
  cellExam: { background: "rgba(245,158,11,0.08)" },
  examBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: "3px", background: "var(--color-due-soon)",
  },
  dayNum: { fontSize: "13px", fontWeight: "500", color: "var(--ink)", lineHeight: 1 },
  dayNumToday: { color: "var(--rose-400)", fontWeight: "700" },
  dayNumSelected: { color: "#ffffff", fontWeight: "700" },
  taskList: { display: "flex", flexDirection: "column", gap: "1px", width: "100%" },
  taskLine: { display: "flex", alignItems: "center", gap: "3px", width: "100%", minWidth: 0 },
  taskLineTitle: {
    fontSize: "11px", fontWeight: "500", flex: "2 1 0",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  taskLineSubject: {
    fontSize: "10px", fontWeight: "400", flex: "1 1 0",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  dot: { width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0 },
  extra: { fontSize: "10px", fontWeight: "600" },
  tooltip: {
    position: "absolute", bottom: "calc(100% + 5px)", left: "50%",
    transform: "translateX(-50%)",
    background: "var(--ink)", color: "var(--surface)",
    fontSize: "11px", fontWeight: "500",
    padding: "4px 8px", borderRadius: "var(--r-sm)",
    whiteSpace: "nowrap", zIndex: 200, pointerEvents: "none",
  },
  legend: {
    display: "flex", flexWrap: "wrap", gap: "8px 16px",
    marginTop: "16px", paddingTop: "14px",
    borderTop: "1px solid var(--border)",
  },
  legendItem: { display: "flex", alignItems: "center", gap: "6px" },
  legendDot: {
    width: "8px", height: "8px", borderRadius: "2px", flexShrink: 0,
    background: "var(--color-due-soon)",
  },
  legendName: {
    fontSize: "12px", fontWeight: "600", color: "var(--ink-2)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  legendDates: {
    fontSize: "12px", color: "var(--ink-3)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  legendBlock: { display: "flex", flexDirection: "column", gap: "6px" },
  legendExams: { display: "flex", flexWrap: "wrap", gap: "4px", paddingLeft: "14px" },
  legendExamChip: {
    fontSize: "11px", fontWeight: "500", padding: "2px 8px", borderRadius: "99px",
    background: "var(--surface-3)", color: "var(--ink-3)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
};

// Week view
const wk = {
  container: {
    display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px", minHeight: "260px",
  },
  col: {
    display: "flex", flexDirection: "column", borderRadius: "var(--r-sm)",
    border: "1px solid var(--border)", overflow: "hidden", cursor: "pointer",
    transition: "border-color 0.15s ease",
  },
  colToday: { border: "1px solid var(--rose-100)", background: "var(--rose-50)" },
  colSelected: { border: "1px solid var(--rose-400)", background: "var(--rose-50)" },
  colHeader: {
    padding: "10px 8px 8px", borderBottom: "1px solid var(--border)",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
  },
  dayLabel: {
    fontSize: "10px", fontWeight: "600", color: "var(--ink-3)",
    textTransform: "uppercase", letterSpacing: "0.06em",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  dayNum: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "18px", fontWeight: "400", color: "var(--ink)", lineHeight: 1,
  },
  dayNumToday: { color: "var(--rose-400)" },
  dayNumSelected: { color: "var(--rose-400)" },
  tasksList: { flex: 1, padding: "6px", display: "flex", flexDirection: "column", gap: "3px" },
  taskChip: {
    padding: "3px 6px", background: "var(--surface-2)", borderRadius: "4px",
    display: "flex", alignItems: "center", gap: "4px",
  },
  chipTitle: {
    fontSize: "10px", color: "var(--ink-2)", fontWeight: "500",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    display: "block",
  },
  more: { fontSize: "10px", color: "var(--ink-3)", fontWeight: "500", paddingLeft: "4px" },
  empty: { fontSize: "12px", color: "var(--ink-4)", textAlign: "center", paddingTop: "8px" },
  colExam: { background: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.3)" },
  examBadge: {
    fontSize: "9px", fontWeight: "700", color: "var(--color-due-soon)",
    background: "rgba(245,158,11,0.15)", borderRadius: "3px",
    padding: "1px 4px", textTransform: "uppercase", letterSpacing: "0.04em",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
};

// Empty state
const p = {
  empty: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "10px", padding: "50px 20px", textAlign: "center",
  },
  emptyIconWrap: {
    width: "52px", height: "52px", borderRadius: "var(--r-md)",
    background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center",
  },
  emptyMsg: { fontSize: "14px", fontWeight: "600", color: "var(--ink-2)" },
  emptyHint: { fontSize: "13px", color: "var(--ink-3)" },
};

// Task overview cards
const oc = {
  card: {
    borderRadius: "var(--r-md)", padding: "12px 14px",
    display: "flex", flexDirection: "column", gap: "8px",
    transition: "opacity .15s",
  },
  cardTop: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", gap: "8px",
  },
  cardLeft: {
    display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0,
  },
  taskTitle: {
    fontSize: "13px", fontWeight: "600", color: "var(--ink)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  taskTitleDone: { textDecoration: "line-through", color: "var(--ink-3)" },
  cardActions: { display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 },
  subtaskToggleBtn: {
    background: "transparent", border: "none", cursor: "pointer", padding: "2px",
    display: "flex", alignItems: "center", color: "var(--ink-3)",
  },
  checkBtn: {
    background: "transparent", border: "none",
    cursor: "pointer", padding: 0, flexShrink: 0,
    display: "flex", alignItems: "center",
  },
  subtasksList: {
    display: "flex", flexDirection: "column", gap: "5px",
    paddingTop: "8px", borderTop: "1px solid var(--border)",
  },
  subtaskItem: { display: "flex", alignItems: "center", gap: "7px" },
  subtaskDot: { width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0 },
  subtaskText: {
    fontSize: "12px", color: "var(--ink-2)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  subtaskDone: { textDecoration: "line-through", color: "var(--ink-3)" },
  subtasksHint: { fontSize: "12px", color: "var(--ink-3)", fontFamily: "'DM Sans', system-ui, sans-serif" },
  examBadge: {
    fontSize: "10px", fontWeight: "700",
    padding: "2px 7px", borderRadius: "99px",
    background: "var(--rose-50)", color: "var(--rose-500)",
    letterSpacing: "0.04em", textTransform: "uppercase",
    alignSelf: "flex-start",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  cardMeta: { display: "flex", flexWrap: "wrap", gap: "5px", alignItems: "center" },
  subjectChip: {
    fontSize: "11px", fontWeight: "600", padding: "2px 8px",
    borderRadius: "99px", fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  pointsChip: {
    fontSize: "11px", fontWeight: "500", padding: "2px 8px",
    borderRadius: "99px", background: "var(--surface-3)", color: "var(--ink-3)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  periodChip: {
    fontSize: "11px", fontWeight: "500", padding: "2px 8px", borderRadius: "99px",
    background: "var(--color-due-soon-bg)", color: "var(--color-due-soon)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
};

// Month task row
