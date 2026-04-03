import { useState } from "react";
import TaskRow from "../tasks/TaskRow";
import { ListTodo, ChevronDown, Plus } from "lucide-react";
import { parseDateLocal } from "../../utils/dateUtils";

const FILTERS = [
  { key: "ALL",     label: "All" },
  { key: "TODO",    label: "To Do" },
  { key: "OVERDUE", label: "Overdue" },
  { key: "DONE",    label: "Done" },
  { key: "EXAM",    label: "Exams" },
];

const SORTS = [
  { key: "dueDate", label: "Due Date" },
  { key: "status",  label: "Status" },
  { key: "points",  label: "Points" },
];

const STATUS_ORDER = { TODO: 0, DONE: 1 };

export default function SubjectTasksSection({ tasks, filterStatus, setFilterStatus, onTaskUpdate, onTaskDelete, onAddTask, onAddExam }) {
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOpen, setSortOpen] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isOverdue = (t) => t.status === "TODO" && t.dueDate && parseDateLocal(t.dueDate) < today;

  const filtered =
    filterStatus === "ALL"     ? tasks :
    filterStatus === "OVERDUE" ? tasks.filter(isOverdue) :
    filterStatus === "EXAM"    ? tasks.filter((t) => !!t.examPeriodId) :
                                 tasks.filter((t) => t.status === filterStatus);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "dueDate") {
      const da = parseDateLocal(a.dueDate);
      const db = parseDateLocal(b.dueDate);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da - db;
    }
    if (sortBy === "status") return (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0);
    if (sortBy === "points")  return (b.points ?? 0) - (a.points ?? 0);
    return 0;
  });

  const activeSort = SORTS.find((s) => s.key === sortBy);
  const hasAnyTasks = tasks.length > 0;

  return (
    <div style={s.section}>
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>Assignments</span>
      </div>

      <div style={s.controls}>
        {/* Segmented filter */}
        <div style={s.segmented}>
          {FILTERS.map(({ key, label }) => {
            const active = filterStatus === key;
            const isOverdueTab = key === "OVERDUE";
            return (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                style={{
                  ...s.tab,
                  ...(active ? (isOverdueTab ? s.tabOverdueActive : s.tabActive) : {}),
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Sort dropdown */}
        <div style={s.sortWrapper}>
          <button style={s.sortBtn} onClick={() => setSortOpen((v) => !v)}>
            Sort: {activeSort.label}
            <ChevronDown size={13} />
          </button>
          {sortOpen && (
            <div style={s.dropdown}>
              {SORTS.map(({ key, label }) => (
                <button
                  key={key}
                  style={{ ...s.dropdownItem, ...(sortBy === key ? s.dropdownItemActive : {}) }}
                  onClick={() => { setSortBy(key); setSortOpen(false); }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {sorted.length === 0 ? (
        hasAnyTasks ? (
          <div style={s.inlineEmpty}>
            No {filterStatus.toLowerCase()} assignments.
          </div>
        ) : (
          <div style={s.fullEmpty}>
            <ListTodo size={40} color="var(--ink-4)" />
            <p style={s.emptyTitle}>No assignments yet</p>
            <p style={s.emptySub}>Add your first assignment to start tracking progress</p>
          </div>
        )
      ) : (
        <div style={s.list}>
          {sorted.map((t) => (
            <TaskRow key={t.id} task={t} onTaskUpdate={onTaskUpdate} onTaskDelete={onTaskDelete} />
          ))}
        </div>
      )}

      {/* Add row */}
      {(onAddTask || onAddExam) && (
        <div style={s.addRow}>
          {onAddTask && (
            <button style={s.inlineAddBtn} onClick={onAddTask}>
              <Plus size={14} color="var(--rose-400)" />
              <span style={s.inlineAddText}>Add task</span>
            </button>
          )}
          {onAddExam && (
            <button style={{ ...s.inlineAddBtn, borderRight: "none" }} onClick={onAddExam}>
              <Plus size={14} color="var(--rose-400)" />
              <span style={s.inlineAddText}>Add exam</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  section: {
    display: "flex",
    flexDirection: "column",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "14px",
  },
  sectionTitle: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "22px",
    fontWeight: "400",
    color: "var(--ink)",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  segmented: {
    display: "flex",
    background: "var(--surface-3)",
    borderRadius: "var(--r-sm)",
    padding: "3px",
    gap: "2px",
  },
  tab: {
    padding: "6px 14px",
    background: "transparent",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--ink-3)",
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  tabActive: {
    background: "var(--surface)",
    color: "var(--ink)",
    fontWeight: "600",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  tabOverdueActive: {
    background: "var(--color-overdue)",
    color: "#ffffff",
    fontWeight: "600",
  },
  sortWrapper: {
    position: "relative",
  },
  sortBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 12px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--ink-2)",
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    right: 0,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
    overflow: "hidden",
    zIndex: 100,
    minWidth: "140px",
  },
  dropdownItem: {
    display: "block",
    width: "100%",
    padding: "10px 16px",
    background: "transparent",
    border: "none",
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--ink-2)",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  dropdownItemActive: {
    background: "var(--surface-2)",
    color: "var(--ink)",
    fontWeight: "600",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    overflow: "hidden",
    marginTop: "12px",
  },
  inlineEmpty: {
    padding: "24px 0",
    textAlign: "center",
    fontSize: "14px",
    color: "var(--ink-3)",
  },
  fullEmpty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "56px 20px",
    gap: "10px",
    background: "var(--surface)",
    borderRadius: "var(--r-lg)",
    border: "1px solid var(--border)",
    marginTop: "12px",
  },
  emptyTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--ink-2)",
    margin: 0,
  },
  emptySub: {
    fontSize: "13px",
    color: "var(--ink-3)",
    margin: 0,
    textAlign: "center",
  },
  addRow: {
    display: "flex",
    gap: "0",
    borderTop: "1px solid var(--border)",
  },
  inlineAddBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    padding: "10px 16px",
    background: "transparent",
    border: "none",
    borderRight: "1px solid var(--border)",
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  inlineAddText: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--ink-3)",
  },
};
