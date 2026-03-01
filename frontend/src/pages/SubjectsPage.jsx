import { useState, useEffect } from "react";
import { getAllSubjects, createSubject, finalizeSubject, resetSubjectStatus } from "../services/subjectService";
import { getAllTasks } from "../services/taskService";
import SubjectCard from "../components/subjects/SubjectCard";
import SubjectForm from "../components/subjects/SubjectForm";
import Modal from "../components/common/Modal";
import Button from "../components/ui/Button";
import { Plus, BookOpen, Award, AlertTriangle, ChevronDown, X, Sparkles } from "lucide-react";
import { getRiskAssessment } from "../services/aiService";

const parseDateLocal = (raw) => {
  if (!raw) return null;
  if (Array.isArray(raw)) return new Date(raw[0], raw[1] - 1, raw[2]);
  const [y, m, d] = String(raw).split("-").map(Number);
  return new Date(y, m - 1, d);
};

function FinalizeModal({ subject, onClose, onSave }) {
  const autoGrade = (() => {
    const pts = subject.totalPoints ?? 0;
    if (pts >= 91) return 10;
    if (pts >= 81) return 9;
    if (pts >= 71) return 8;
    if (pts >= 61) return 7;
    if (pts >= 51) return 6;
    return 5;
  })();

  const [useManual, setUseManual] = useState(false);
  const [manualGrade, setManualGrade] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const effectiveGrade = useManual ? parseInt(manualGrade) : autoGrade;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (useManual) {
      const g = parseInt(manualGrade);
      if (!manualGrade || isNaN(g) || g < 5 || g > 10) {
        setError("Grade must be between 5 and 10.");
        return;
      }
    }
    setSaving(true);
    try {
      const payload = useManual ? { manualGradeOverride: parseInt(manualGrade) } : {};
      await onSave(subject.id, payload);
      onClose();
    } catch {
      setError("Failed to finalize subject. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const gradeColor = effectiveGrade >= 6 ? "#059669" : "#dc2626";
  const gradeLabel = effectiveGrade >= 6 ? "PASSED" : "FAILED";

  return (
    <form onSubmit={handleSubmit} style={mStyles.form}>
      {/* Points summary */}
      <div style={mStyles.pointsBox}>
        <span style={mStyles.pointsLabel}>Points earned from completed tasks</span>
        <span style={mStyles.pointsValue}>{subject.totalPoints ?? 0} pts</span>
      </div>

      {/* Auto-calculated grade preview */}
      <div style={{ ...mStyles.gradePreview, borderColor: gradeColor + "66", borderWidth: "2px", borderStyle: "solid" }}>
        <div>
          <div style={mStyles.gradePreviewLabel}>
            {useManual ? "Manual grade" : "Calculated grade"}
          </div>
          <div style={{ ...mStyles.gradePreviewNum, color: gradeColor }}>
            {useManual && manualGrade ? manualGrade : autoGrade}
          </div>
        </div>
        <div style={{ ...mStyles.gradeBadge, background: gradeColor + "15", color: gradeColor, border: `1px solid ${gradeColor}40` }}>
          {useManual && manualGrade
            ? (parseInt(manualGrade) >= 6 ? "PASSED" : "FAILED")
            : gradeLabel}
        </div>
      </div>

      {/* Manual override toggle */}
      <label style={mStyles.toggleRow}>
        <input
          type="checkbox"
          checked={useManual}
          onChange={(e) => {
            setUseManual(e.target.checked);
            setError("");
            setManualGrade("");
          }}
          style={{ accentColor: "#f43f5e" }}
        />
        <span style={mStyles.toggleLabel}>Override with manual grade</span>
      </label>

      {useManual && (
        <div style={mStyles.field}>
          <label style={mStyles.label}>Grade (5–10)</label>
          <input
            type="number"
            min={5}
            max={10}
            value={manualGrade}
            onChange={(e) => { setManualGrade(e.target.value); setError(""); }}
            style={mStyles.input}
            placeholder="e.g. 8"
            autoFocus
          />
        </div>
      )}

      {error && <div style={mStyles.error}>{error}</div>}

      <div style={mStyles.buttons}>
        <button type="button" onClick={onClose} style={mStyles.cancelBtn}>Cancel</button>
        <button type="submit" disabled={saving} style={mStyles.submitBtn}>
          {saving ? "Saving…" : "Confirm & Finalize"}
        </button>
      </div>
    </form>
  );
}

const mStyles = {
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  pointsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "#f8fafc",
    borderRadius: "10px",
    border: "1px solid #e5e5e5",
  },
  pointsLabel: { fontSize: "13px", color: "#737373", fontWeight: "500" },
  pointsValue: { fontSize: "16px", color: "#171717", fontWeight: "700" },
  gradePreview: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    background: "#fafafa",
    borderRadius: "10px",
    borderWidth: "2px",
    borderStyle: "solid",
  },
  gradePreviewLabel: { fontSize: "12px", color: "#737373", marginBottom: "2px" },
  gradePreviewNum: { fontSize: "32px", fontWeight: "700" },
  gradeBadge: {
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  toggleLabel: { fontSize: "14px", color: "#525252", fontWeight: "500" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#171717" },
  input: {
    padding: "10px 14px",
    fontSize: "15px",
    border: "1px solid #e5e5e5",
    borderRadius: "10px",
    fontFamily: "inherit",
    outline: "none",
  },
  error: {
    fontSize: "13px",
    color: "#dc2626",
    background: "#fff5f5",
    border: "1px solid #fca5a5",
    borderRadius: "8px",
    padding: "8px 12px",
  },
  buttons: { display: "flex", gap: "10px", justifyContent: "flex-end" },
  cancelBtn: {
    padding: "10px 20px",
    background: "#f5f5f5",
    color: "#171717",
    border: "1px solid #e5e5e5",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  submitBtn: {
    padding: "10px 20px",
    background: "#171717",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finalizeTarget, setFinalizeTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [riskItems, setRiskItems] = useState([]);
  const [riskExpanded, setRiskExpanded] = useState(false);
  const [riskDismissed, setRiskDismissed] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    getRiskAssessment()
      .then(setRiskItems)
      .catch(() => {});
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectsData, tasksData] = await Promise.all([
        getAllSubjects(),
        getAllTasks(),
      ]);
      setSubjects(subjectsData);
      setTasks(tasksData);
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
    // Enrich with totalPoints from tasks
    const sTasks = tasks.filter((t) => t.subjectId === subject.id);
    const totalPoints = sTasks
      .filter((t) => t.status === "DONE" && t.points != null)
      .reduce((sum, t) => sum + t.points, 0);
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
      .reduce((sum, t) => sum + t.points, 0);
    return {
      ...s,
      totalPoints,
      _overdueCount: overdueCount,
      _upcomingCount: upcomingCount,
      _completionPct: completionPct,
      _nextDeadlineTask: nextDeadlineTask,
    };
  });

  const difficultyOrder = { HARD: 0, MEDIUM: 1, EASY: 2 };

  const sortedSubjects = [...enrichedSubjects].sort((a, b) => {
    const aActive = (a.status || "IN_PROGRESS") === "IN_PROGRESS";
    const bActive = (b.status || "IN_PROGRESS") === "IN_PROGRESS";

    // IN_PROGRESS always before finalized
    if (aActive !== bActive) return aActive ? -1 : 1;

    // Within IN_PROGRESS: harder difficulty first
    if (aActive && bActive) {
      const dA = difficultyOrder[a.difficulty] ?? 1;
      const dB = difficultyOrder[b.difficulty] ?? 1;
      if (dA !== dB) return dA - dB;
    }

    // Tiebreaker: overdue → upcoming → completion → name
    if (b._overdueCount !== a._overdueCount) return b._overdueCount - a._overdueCount;
    if (b._upcomingCount !== a._upcomingCount) return b._upcomingCount - a._upcomingCount;
    if (a._completionPct !== b._completionPct) return a._completionPct - b._completionPct;
    return a.name.localeCompare(b.name);
  });

  const totalOverdue = tasks.filter(
    (t) => t.status !== "DONE" && t.dueDate && parseDateLocal(t.dueDate) < today
  ).length;
  const totalThisWeek = tasks.filter((t) => {
    if (t.status === "DONE" || !t.dueDate) return false;
    const d = parseDateLocal(t.dueDate);
    return d >= today && d <= in7Days;
  }).length;
  const passedCount = subjects.filter((s) => s.status === "PASSED").length;

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
          <span style={styles.statDivider}>|</span>
          <div style={styles.statItem}>
            <span style={{ ...styles.statNum, color: totalOverdue > 0 ? "#dc2626" : "#171717" }}>
              {totalOverdue}
            </span>
            <span style={styles.statLabel}>Overdue</span>
          </div>
          <span style={styles.statDivider}>|</span>
          <div style={styles.statItem}>
            <span style={{ ...styles.statNum, color: totalThisWeek > 0 ? "#d97706" : "#171717" }}>
              {totalThisWeek}
            </span>
            <span style={styles.statLabel}>Due This Week</span>
          </div>
          {passedCount > 0 && (
            <>
              <span style={styles.statDivider}>|</span>
              <div style={styles.statItem}>
                <Award size={16} color="#059669" />
                <span style={{ ...styles.statNum, color: "#059669" }}>{passedCount}</span>
                <span style={styles.statLabel}>Passed</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* AI Risk Banner */}
      {!riskDismissed && riskItems.length > 0 && (
        <div style={styles.riskBanner}>
          <div style={styles.riskBannerRow}>
            <div style={styles.riskBannerLeft}>
              <Sparkles size={15} color="#d97706" style={{ flexShrink: 0 }} />
              <span style={styles.riskBannerText}>
                AI detected <strong>{riskItems.length}</strong> assignment{riskItems.length !== 1 ? "s" : ""} at risk this week
              </span>
            </div>
            <div style={styles.riskBannerActions}>
              <button style={styles.riskToggleBtn} onClick={() => setRiskExpanded((v) => !v)}>
                {riskExpanded ? "Hide" : "View"}
                <ChevronDown size={13} style={{ transform: riskExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>
              <button style={styles.riskDismissBtn} onClick={() => setRiskDismissed(true)}>
                <X size={13} />
              </button>
            </div>
          </div>

          {riskExpanded && (
            <div style={styles.riskList}>
              {riskItems.map((item) => {
                const isHigh = item.riskLevel === "HIGH";
                return (
                  <div key={item.taskId} style={styles.riskItem}>
                    <span style={{
                      ...styles.riskLevelBadge,
                      background: isHigh ? "#fee2e2" : "#fef3c7",
                      color: isHigh ? "#dc2626" : "#d97706",
                      border: `1px solid ${isHigh ? "#fca5a5" : "#fcd34d"}`,
                    }}>
                      {item.riskLevel}
                    </span>
                    <div style={styles.riskItemBody}>
                      <span style={styles.riskItemTitle}>{item.title}</span>
                      {item.subjectName && (
                        <span style={styles.riskItemSubject}>{item.subjectName}</span>
                      )}
                      <span style={styles.riskItemReason}>{item.reason}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Subject"
      >
        <SubjectForm
          onSubmit={handleAddSubject}
          onCancel={() => setIsModalOpen(false)}
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
  loadingText: { fontSize: "16px", color: "#737373" },
  errorContainer: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "400px", gap: "16px" },
  errorText: { fontSize: "16px", color: "#dc2626" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    gap: "20px",
  },
  title: { fontSize: "32px", fontWeight: "600", color: "#171717", margin: "0 0 8px 0" },
  subtitle: { fontSize: "16px", color: "#737373", margin: 0 },
  statsRow: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
    padding: "14px 20px",
    background: "#fafafa",
    border: "1px solid #f0f0f0",
    borderRadius: "12px",
  },
  statItem: { display: "flex", alignItems: "baseline", gap: "7px" },
  statNum: { fontSize: "20px", fontWeight: "700", color: "#171717" },
  statLabel: { fontSize: "13px", color: "#737373", fontWeight: "500" },
  statDivider: { color: "#d4d4d4", fontSize: "16px", userSelect: "none" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
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
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "#fafafa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
  },
  emptyTitle: { fontSize: "24px", fontWeight: "600", color: "#171717", margin: "0 0 12px 0" },
  emptyText: { fontSize: "16px", color: "#737373", margin: 0, maxWidth: "400px" },

  riskBanner: {
    background: "#fffbeb", border: "1px solid #fde68a",
    borderRadius: "12px", padding: "12px 16px", marginBottom: "20px",
  },
  riskBannerRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px",
  },
  riskBannerLeft: { display: "flex", alignItems: "center", gap: "8px" },
  riskBannerText: { fontSize: "13px", fontWeight: "500", color: "#92400e" },
  riskBannerActions: { display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 },
  riskToggleBtn: {
    display: "flex", alignItems: "center", gap: "4px",
    fontSize: "12px", fontWeight: "600", color: "#d97706",
    background: "transparent", border: "none", cursor: "pointer", padding: 0,
  },
  riskDismissBtn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: "none", cursor: "pointer",
    color: "#a3a3a3", padding: 0,
  },
  riskList: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" },
  riskItem: { display: "flex", alignItems: "flex-start", gap: "10px" },
  riskLevelBadge: {
    fontSize: "10px", fontWeight: "700", padding: "2px 8px",
    borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px",
    flexShrink: 0, marginTop: "1px",
  },
  riskItemBody: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", flex: 1 },
  riskItemTitle: { fontSize: "13px", fontWeight: "600", color: "#171717" },
  riskItemSubject: {
    fontSize: "11px", fontWeight: "500", padding: "1px 7px",
    borderRadius: "4px", background: "#fff1f2", color: "#f43f5e",
  },
  riskItemReason: { fontSize: "12px", color: "#737373", fontStyle: "italic", width: "100%" },
};
