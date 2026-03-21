import { useState, useEffect } from "react";
import { getAllSubjects, createSubject, finalizeSubject, resetSubjectStatus } from "../services/subjectService";
import { getAllTasks } from "../services/taskService";
import { getAllSemesters } from "../services/semesterService";
import SubjectCard from "../components/subjects/SubjectCard";
import SubjectForm from "../components/subjects/SubjectForm";
import FinalizeModal from "../components/subjects/FinalizeModal";
import Modal from "../components/common/Modal";
import Button from "../components/ui/Button";
import { Plus, BookOpen, Award } from "lucide-react";
import { parseDateLocal } from "../utils/dateUtils";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [activeSemesterId, setActiveSemesterId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finalizeTarget, setFinalizeTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("status");
  const [filterBy, setFilterBy] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectsData, tasksData, semestersData] = await Promise.all([
        getAllSubjects(),
        getAllTasks(),
        getAllSemesters(),
      ]);
      setSubjects(subjectsData);
      setTasks(tasksData);
      setSemesters(semestersData);

      // Auto-select the active semester by date range
      if (semestersData.length > 0) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const active = semestersData.find((s) => {
          const start = s.startDate ? parseDateLocal(s.startDate) : null;
          const end = s.endDate ? parseDateLocal(s.endDate) : null;
          return start && end && now >= start && now <= end;
        }) || semestersData.reduce((best, s) => (s.id > best.id ? s : best));
        setActiveSemesterId(active.id);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (formData) => {
    try {
      const newSubject = await createSubject(formData);
      setSubjects([...subjects, newSubject]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create subject:", err);
      alert("Failed to create subject. Please try again.");
    }
  };

  const handleFinalizeClick = (subject, isReset = false) => {
    if (isReset) {
      handleReset(subject.id);
      return;
    }
    const sTasks = tasks.filter((t) => t.subjectId === subject.id);
    const totalPoints = sTasks
      .filter((t) => t.status === "DONE" && t.points != null)
      .reduce((sum, t) => sum + (t.earnedPoints != null ? t.earnedPoints : t.points), 0);
    setFinalizeTarget({ ...subject, totalPoints });
  };

  const handleFinalizeSave = async (subjectId, payload) => {
    const updated = await finalizeSubject(subjectId, payload);
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleReset = async (subjectId) => {
    try {
      const updated = await resetSubjectStatus(subjectId);
      setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch {
      alert("Failed to reset subject. Please try again.");
    }
  };

  // ── derived data ──────────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today);
  in7Days.setDate(in7Days.getDate() + 7);

  const enrichedSubjects = subjects.map((s) => {
    const sTasks = tasks.filter((t) => t.subjectId === s.id);
    const overdueCount = sTasks.filter(
      (t) => t.status !== "DONE" && t.dueDate && parseDateLocal(t.dueDate) < today
    ).length;
    const upcomingCount = sTasks.filter((t) => {
      if (t.status === "DONE" || !t.dueDate) return false;
      const d = parseDateLocal(t.dueDate);
      return d >= today && d <= in7Days;
    }).length;
    const total = sTasks.length;
    const done = sTasks.filter((t) => t.status === "DONE").length;
    const completionPct = total > 0 ? done / total : 0;
    const nextDeadlineTask = sTasks
      .filter((t) => t.status !== "DONE" && t.dueDate)
      .sort((a, b) => parseDateLocal(a.dueDate) - parseDateLocal(b.dueDate))[0] || null;
    const totalPoints = sTasks
      .filter((t) => t.status === "DONE" && t.points != null)
      .reduce((sum, t) => sum + (t.earnedPoints != null ? t.earnedPoints : t.points), 0);
    return {
      ...s,
      totalPoints,
      _overdueCount: overdueCount,
      _upcomingCount: upcomingCount,
      _completionPct: completionPct,
      _nextDeadlineTask: nextDeadlineTask,
    };
  });

  const filteredBySemester = activeSemesterId == null
    ? enrichedSubjects
    : enrichedSubjects.filter((s) => s.semesterId === activeSemesterId);

  const filteredSubjects = filteredBySemester.filter((s) => {
    if (filterBy === "in_progress") return (s.status || "IN_PROGRESS") === "IN_PROGRESS";
    if (filterBy === "passed") return s.status === "PASSED";
    return true;
  });

  const sortFn = (a, b) => {
    if (sortBy === "status") {
      const aActive = (a.status || "IN_PROGRESS") === "IN_PROGRESS";
      const bActive = (b.status || "IN_PROGRESS") === "IN_PROGRESS";
      if (aActive !== bActive) return aActive ? -1 : 1;
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "passed_first") {
      const aPassed = a.status === "PASSED";
      const bPassed = b.status === "PASSED";
      if (aPassed !== bPassed) return aPassed ? -1 : 1;
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "progress") return b._completionPct - a._completionPct;
    return a.name.localeCompare(b.name);
  };

  const sortedSubjects = [...filteredSubjects].sort(sortFn);

  const passedCount = subjects.filter((s) => s.status === "PASSED").length;

  const gradedSubjects = subjects.filter((s) => s.status === "PASSED" && s.finalGrade != null);
  const avgGrade = gradedSubjects.length > 0
    ? (gradedSubjects.reduce((sum, s) => sum + s.finalGrade, 0) / gradedSubjects.length).toFixed(2)
    : null;

  const hasInProgress = sortedSubjects.some((s) => (s.status || "IN_PROGRESS") === "IN_PROGRESS");
  const hasFinalized = sortedSubjects.some((s) => s.status === "PASSED" || s.status === "FAILED");
  const showGroups = filterBy === "all" && hasInProgress && hasFinalized;

  const inProgressGroup = sortedSubjects.filter((s) => (s.status || "IN_PROGRESS") === "IN_PROGRESS");
  const finalizedGroup = sortedSubjects.filter((s) => s.status === "PASSED" || s.status === "FAILED");

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading subjects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorText}>{error}</div>
        <Button onClick={fetchData}>Retry</Button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Subjects</h1>
          <p style={styles.subtitle}>Manage your courses and track your academic progress</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Add Subject
        </Button>
      </div>

      {/* Overview stats */}
      {subjects.length > 0 && (
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={styles.statNum}>{subjects.length}</span>
            <span style={styles.statLabel}>Subjects</span>
          </div>
          {passedCount > 0 && (
            <>
              <span style={styles.statDivider}>|</span>
              <div style={styles.statItem}>
                <Award size={16} color="var(--color-done)" />
                <span style={{ ...styles.statNum, color: "var(--color-done)" }}>{passedCount}</span>
                <span style={styles.statLabel}>Passed</span>
              </div>
            </>
          )}
          {avgGrade !== null && (
            <>
              <span style={styles.statDivider}>|</span>
              <div style={styles.statItem}>
                <span style={styles.statNum}>{avgGrade}</span>
                <span style={styles.statLabel}>Avg grade</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Semester tabs */}
      {semesters.length > 0 && subjects.length > 0 && (
        <div style={styles.semesterTabs}>
          <button
            style={{ ...styles.semesterTab, ...(activeSemesterId == null ? styles.semesterTabActive : {}) }}
            onClick={() => setActiveSemesterId(null)}
          >
            All
          </button>
          {semesters.map((s) => (
            <button
              key={s.id}
              style={{ ...styles.semesterTab, ...(activeSemesterId === s.id ? styles.semesterTabActive : {}) }}
              onClick={() => setActiveSemesterId(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      {subjects.length > 0 && (
        <div style={styles.toolbar}>
          <div style={styles.toolbarGroup}>
            <span style={styles.toolbarLabel}>Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.toolbarSelect}
            >
              <option value="status">Status</option>
              <option value="passed_first">Passed first</option>
              <option value="progress">Progress</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div style={styles.toolbarGroup}>
            <span style={styles.toolbarLabel}>Show</span>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              style={styles.toolbarSelect}
            >
              <option value="all">All</option>
              <option value="in_progress">In Progress</option>
              <option value="passed">Passed</option>
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {subjects.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <BookOpen size={48} color="#d4d4d4" />
          </div>
          <h3 style={styles.emptyTitle}>No subjects yet</h3>
          <p style={styles.emptyText}>Get started by adding your first subject to track</p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsModalOpen(true)}
            style={{ marginTop: "20px" }}
          >
            <Plus size={20} />
            Add Your First Subject
          </Button>
        </div>
      ) : showGroups ? (
        <>
          <div style={styles.sectionLabel}>In Progress</div>
          <div style={styles.grid}>
            {inProgressGroup.map((s) => (
              <SubjectCard
                key={s.id}
                subject={s}
                nextDeadlineTask={s._nextDeadlineTask}
                overdueCount={s._overdueCount}
                upcomingCount={s._upcomingCount}
                completionPct={s._completionPct}
                onFinalize={handleFinalizeClick}
              />
            ))}
          </div>
          <div style={styles.sectionLabel}>Passed</div>
          <div style={styles.grid}>
            {finalizedGroup.map((s) => (
              <SubjectCard
                key={s.id}
                subject={s}
                nextDeadlineTask={s._nextDeadlineTask}
                overdueCount={s._overdueCount}
                upcomingCount={s._upcomingCount}
                completionPct={s._completionPct}
                onFinalize={handleFinalizeClick}
              />
            ))}
          </div>
        </>
      ) : (
        <div style={styles.grid}>
          {sortedSubjects.map((s) => (
            <SubjectCard
              key={s.id}
              subject={s}
              nextDeadlineTask={s._nextDeadlineTask}
              overdueCount={s._overdueCount}
              upcomingCount={s._upcomingCount}
              completionPct={s._completionPct}
              onFinalize={handleFinalizeClick}
            />
          ))}
        </div>
      )}

      {/* Add subject modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Subject">
        <SubjectForm
          onSubmit={handleAddSubject}
          onCancel={() => setIsModalOpen(false)}
          semesters={semesters}
        />
      </Modal>

      {/* Finalize subject modal */}
      <Modal
        isOpen={!!finalizeTarget}
        onClose={() => setFinalizeTarget(null)}
        title={`Finalize · ${finalizeTarget?.name ?? ""}`}
      >
        {finalizeTarget && (
          <FinalizeModal
            subject={finalizeTarget}
            onClose={() => setFinalizeTarget(null)}
            onSave={handleFinalizeSave}
          />
        )}
      </Modal>
    </div>
  );
}

const styles = {
  container: { width: "100%", maxWidth: "1400px", margin: "0 auto" },
  loadingContainer: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" },
  loadingText: { fontSize: "16px", color: "var(--ink-3)" },
  errorContainer: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "400px", gap: "16px" },
  errorText: { fontSize: "16px", color: "var(--color-overdue)" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    gap: "20px",
  },
  title: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "32px", fontWeight: "400", color: "var(--ink)", margin: "0 0 6px 0",
  },
  subtitle: { fontSize: "14px", color: "var(--ink-3)", margin: 0 },
  statsRow: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
    padding: "12px 20px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
  },
  statItem: { display: "flex", alignItems: "baseline", gap: "7px" },
  statNum: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "22px", fontWeight: "400", color: "var(--ink)",
  },
  statLabel: { fontSize: "12px", color: "var(--ink-3)", fontWeight: "500" },
  statDivider: { color: "var(--border-2)", fontSize: "16px", userSelect: "none" },
  semesterTabs: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  semesterTab: {
    padding: "6px 14px",
    borderRadius: "99px",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--ink-3)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  semesterTabActive: {
    background: "var(--rose-400)",
    border: "1px solid var(--rose-400)",
    color: "#ffffff",
    fontWeight: "600",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  },
  toolbarGroup: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  toolbarLabel: {
    fontSize: "12px",
    color: "var(--ink-3)",
    fontWeight: "500",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  toolbarSelect: {
    padding: "6px 10px",
    fontSize: "13px",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    background: "var(--surface)",
    color: "var(--ink)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    cursor: "pointer",
    outline: "none",
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "var(--ink-3)",
    margin: "1.25rem 0 0.6rem",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "16px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    textAlign: "center",
  },
  emptyIcon: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "var(--surface-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  emptyTitle: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "24px", fontWeight: "400", color: "var(--ink)", margin: "0 0 10px 0",
  },
  emptyText: { fontSize: "15px", color: "var(--ink-3)", margin: 0, maxWidth: "400px" },
};
