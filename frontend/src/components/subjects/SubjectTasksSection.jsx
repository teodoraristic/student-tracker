import { useState } from "react";
import TaskRow from "../tasks/TaskRow";
import { ListTodo, ChevronDown } from "lucide-react";

const FILTERS = [
  { key: "ALL",     label: "All" },
  { key: "TODO",    label: "To Do" },
  { key: "OVERDUE", label: "Overdue" },
  { key: "DONE",    label: "Done" },
];

const SORTS = [
  { key: "dueDate", label: "Due Date" },
  { key: "status",  label: "Status" },
  { key: "points",  label: "Points" },
];

const parseDateLocal = (raw) => {
  if (!raw) return null;
  if (Array.isArray(raw)) return new Date(raw[0], raw[1] - 1, raw[2]);
  const [y, m, d] = String(raw).split("-").map(Number);
  return new Date(y, m - 1, d);
};

const STATUS_ORDER = { TODO: 0, DONE: 1 };

export default function SubjectTasksSection({ tasks, filterStatus, setFilterStatus, onTaskUpdate, onTaskDelete }) {
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOpen, setSortOpen] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isOverdue = (t) => t.status === "TODO" && t.dueDate && parseDateLocal(t.dueDate) < today;

  const filtered =
    filterStatus === "ALL"     ? tasks :
    filterStatus === "OVERDUE" ? tasks.filter(isOverdue) :
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
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <span style={styles.sectionTitle}>Assignments</span>
      </div>

      <div style={styles.controls}>
        {/* Segmented filter */}
        <div style={styles.segmented}>
          {FILTERS.map(({ key, label }) => {
            const active = filterStatus === key;
            const isOverdueTab = key === "OVERDUE";
            return (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                style={{
                  ...styles.tab,
                  ...(active ? (isOverdueTab ? styles.tabOverdueActive : styles.tabActive) : {}),
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Sort dropdown */}
        <div style={styles.sortWrapper}>
          <button style={styles.sortBtn} onClick={() => setSortOpen((v) => !v)}>
            Sort: {activeSort.label}
            <ChevronDown size={13} />
          </button>
          {sortOpen && (
            <div style={styles.dropdown}>
              {SORTS.map(({ key, label }) => (
                <button
                  key={key}
                  style={{ ...styles.dropdownItem, ...(sortBy === key ? styles.dropdownItemActive : {}) }}
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
          <div style={styles.inlineEmpty}>
            No {filterStatus.toLowerCase()} assignments.
          </div>
        ) : (
          <div style={styles.fullEmpty}>
            <ListTodo size={40} color="#d4d4d4" />
            <p style={styles.emptyTitle}>No assignments yet</p>
            <p style={styles.emptySub}>Add your first assignment to start tracking progress</p>
          </div>
        )
      ) : (
        <div style={styles.list}>
          {sorted.map((t) => (
            <TaskRow key={t.id} task={t} onTaskUpdate={onTaskUpdate} onTaskDelete={onTaskDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  section: {
    display: "flex",
    flexDirection: "column",
  },
  sectionHeader: {
    marginBottom: "14px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#171717",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  segmented: {
    display: "flex",
    background: "#f5f5f5",
    borderRadius: "8px",
    padding: "3px",
    gap: "2px",
  },
  tab: {
    padding: "7px 16px",
    background: "transparent",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#737373",
    cursor: "pointer",
  },
  tabActive: {
    background: "#ffffff",
    color: "#171717",
    fontWeight: "600",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  tabOverdueActive: {
    background: "#dc2626",
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
    padding: "8px 14px",
    background: "#fafafa",
    border: "1px solid #f0f0f0",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#525252",
    cursor: "pointer",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    right: 0,
    background: "#ffffff",
    border: "1px solid #f0f0f0",
    borderRadius: "10px",
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
    color: "#525252",
    cursor: "pointer",
    textAlign: "left",
  },
  dropdownItemActive: {
    background: "#f8fafc",
    color: "#171717",
    fontWeight: "600",
  },
  list: {
    display: "flex",
    flexDirection: "column",
  },
  inlineEmpty: {
    padding: "24px 0",
    textAlign: "center",
    fontSize: "14px",
    color: "#a3a3a3",
  },
  fullEmpty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "56px 20px",
    gap: "10px",
    background: "#fafafa",
    borderRadius: "12px",
    border: "1px solid #f0f0f0",
  },
  emptyTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#525252",
    margin: 0,
  },
  emptySub: {
    fontSize: "13px",
    color: "#a3a3a3",
    margin: 0,
    textAlign: "center",
  },
};
