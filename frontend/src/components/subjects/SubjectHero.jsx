import { ExternalLink, Trash2, Plus } from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import ProgressRing from "../ui/ProgressRing";

const difficultyTint = {
  EASY:   "#f0fdf4",
  MEDIUM: "#fffbeb",
  HARD:   "#fff5f5",
};

const difficultyColors = {
  EASY:   { bg: "#d1fae5", text: "#059669", border: "#6ee7b7" },
  MEDIUM: { bg: "#fef3c7", text: "#d97706", border: "#fcd34d" },
  HARD:   { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
};

const statusConfig = {
  PASSED:      { label: "Passed",      bg: "#d1fae5", color: "#059669", border: "#6ee7b7" },
  FAILED:      { label: "Failed",      bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
  IN_PROGRESS: { label: "In Progress", bg: "#eff6ff", color: "#3b82f6", border: "#93c5fd" },
};

const calcGrade = (pts) => {
  if (pts >= 91) return 10;
  if (pts >= 81) return 9;
  if (pts >= 71) return 8;
  if (pts >= 61) return 7;
  if (pts >= 51) return 6;
  return 5;
};

export default function SubjectHero({
  subject,
  onAddTask,
  onDeleteSubject,
  completionPct,
  todoTasks,
  overdueTasks,
  completedTasks,
  earnedPoints,
  totalPoints,
}) {
  const tint = difficultyTint[subject.difficulty] || "#fafafa";
  const dc = difficultyColors[subject.difficulty] || difficultyColors.MEDIUM;
  const sc = statusConfig[subject.status] || statusConfig.IN_PROGRESS;
  const pointsPct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const isPassed = subject.status === "PASSED";
  const isAllDone = todoTasks === 0 && overdueTasks === 0 && completedTasks > 0;

  return (
    <div style={{ ...styles.hero, background: tint }}>
      <div style={styles.columns}>

        {/* Col 1 — Subject info */}
        <div style={styles.colInfo}>
          <div style={styles.badgeRow}>
            <Badge style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}>
              {subject.difficulty}
            </Badge>
            <span style={{ ...styles.statusBadge, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
              {subject.status === "PASSED" && subject.finalGrade
                ? `Passed · ${subject.finalGrade}`
                : sc.label}
            </span>
          </div>
          <h1 style={styles.title}>{subject.name}</h1>
          {subject.website && (
            <a href={subject.website} target="_blank" rel="noopener noreferrer" style={styles.websiteLink}>
              <ExternalLink size={12} />
              Course Website
            </a>
          )}
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Col 2 — Progress */}
        <div style={styles.colStat}>
          <span style={styles.colLabel}>Progress</span>
          <span style={styles.statBig}>{completionPct}%</span>
          <span style={styles.statSub}>completion</span>
          <div style={styles.breakdown}>
            <div style={styles.bItem}>
              <span style={{ ...styles.bCount, color: todoTasks > 0 ? "#525252" : "#d4d4d4" }}>{todoTasks}</span>
              <span style={styles.bLabel}>To Do</span>
            </div>
            <span style={styles.bDot}>·</span>
            <div style={styles.bItem}>
              <span style={{ ...styles.bCount, color: overdueTasks > 0 ? "#dc2626" : "#d4d4d4" }}>{overdueTasks}</span>
              <span style={styles.bLabel}>Overdue</span>
            </div>
            <span style={styles.bDot}>·</span>
            <div style={styles.bItem}>
              <span style={{ ...styles.bCount, color: completedTasks > 0 ? "#059669" : "#d4d4d4" }}>{completedTasks}</span>
              <span style={styles.bLabel}>Done</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Col 3 — Points */}
        <div style={styles.colStat}>
          <span style={styles.colLabel}>Points</span>

          {isPassed ? (
            <>
              <span style={styles.gradePassed}>{subject.finalGrade}</span>
              <span style={styles.gradeCaption}>Final Grade</span>
              <div style={styles.pointsSubtle}>
                {earnedPoints}/{totalPoints} pts
              </div>
            </>
          ) : (
            <>
              <ProgressRing percentage={pointsPct} size={72} strokeWidth={6} color="#f43f5e">
                <span style={styles.ringNum}>{earnedPoints}</span>
                <span style={styles.ringLabel}>pts</span>
              </ProgressRing>
              <div style={styles.pointsLine}>
                <span style={styles.pointsEarned}>{earnedPoints}</span>
                <span style={styles.pointsSep}>/</span>
                <span style={styles.pointsTotal}>{totalPoints} pts</span>
              </div>
              {isAllDone && totalPoints > 0 && (
                <span style={styles.gradeHint}>
                  ~{calcGrade(earnedPoints)}
                </span>
              )}
            </>
          )}
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Col 4 — Actions */}
        <div style={styles.colActions}>
          <Button variant="primary" size="md" onClick={onAddTask}>
            <Plus size={17} />
            Add Assignment
          </Button>
          <button onClick={onDeleteSubject} style={styles.deleteBtn} title="Delete subject">
            <Trash2 size={15} />
          </button>
        </div>

      </div>
    </div>
  );
}

const styles = {
  hero: {
    borderRadius: "16px",
    border: "1px solid #f0f0f0",
    padding: "24px 28px",
    marginBottom: "24px",
  },
  columns: {
    display: "flex",
    alignItems: "stretch",
    gap: "0",
  },
  divider: {
    width: "1px",
    background: "rgba(0,0,0,0.06)",
    margin: "0 24px",
    flexShrink: 0,
  },
  colInfo: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "8px",
    flex: 2,
    minWidth: 0,
  },
  colStat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    flex: 1,
  },
  colActions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    flexShrink: 0,
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  statusBadge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#171717",
    margin: 0,
    letterSpacing: "-0.5px",
    lineHeight: 1.15,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  websiteLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    color: "#737373",
    fontSize: "12px",
    fontWeight: "500",
    textDecoration: "none",
  },
  colLabel: {
    fontSize: "10px",
    fontWeight: "600",
    color: "#a3a3a3",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  statBig: {
    fontSize: "34px",
    fontWeight: "700",
    color: "#171717",
    lineHeight: 1,
  },
  statSub: {
    fontSize: "11px",
    color: "#a3a3a3",
    fontWeight: "500",
  },
  breakdown: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "8px",
  },
  bItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1px",
  },
  bCount: {
    fontSize: "15px",
    fontWeight: "700",
  },
  bLabel: {
    fontSize: "9px",
    color: "#a3a3a3",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  bDot: {
    color: "#e5e5e5",
    fontSize: "14px",
    alignSelf: "flex-start",
    marginTop: "2px",
  },
  ringNum: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#171717",
    lineHeight: 1,
  },
  ringLabel: {
    fontSize: "9px",
    color: "#a3a3a3",
    fontWeight: "500",
    marginTop: "1px",
  },
  pointsLine: {
    display: "flex",
    alignItems: "baseline",
    gap: "2px",
    marginTop: "4px",
  },
  pointsEarned: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#171717",
  },
  pointsSep: {
    fontSize: "11px",
    color: "#d4d4d4",
  },
  pointsTotal: {
    fontSize: "11px",
    fontWeight: "500",
    color: "#a3a3a3",
  },
  gradePassed: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#059669",
    lineHeight: 1,
  },
  gradeCaption: {
    fontSize: "11px",
    color: "#059669",
    fontWeight: "500",
    opacity: 0.8,
  },
  pointsSubtle: {
    fontSize: "12px",
    color: "#a3a3a3",
    fontWeight: "500",
    marginTop: "4px",
  },
  gradeHint: {
    fontSize: "11px",
    color: "#a3a3a3",
    fontWeight: "600",
    marginTop: "2px",
    background: "#f5f5f5",
    padding: "2px 8px",
    borderRadius: "5px",
  },
  deleteBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    background: "transparent",
    border: "1px solid #fde8e8",
    borderRadius: "8px",
    color: "#f87171",
    cursor: "pointer",
  },
};
