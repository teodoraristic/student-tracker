import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ExternalLink, BarChart3, Calendar, Award, AlertCircle } from "lucide-react";

const parseDateLocal = (raw) => {
  if (!raw) return null;
  if (Array.isArray(raw)) return new Date(raw[0], raw[1] - 1, raw[2]);
  const [y, m, d] = String(raw).split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatNextDue = (dueDate) => {
  const due = parseDateLocal(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due - today) / 86400000);
  if (diff < 0) return { text: `Overdue by ${Math.abs(diff)}d`, color: "#dc2626", bg: "#fff5f5" };
  if (diff === 0) return { text: "Due today", color: "#d97706", bg: "#fffbeb" };
  if (diff <= 3) return { text: `${diff}d left`, color: "#d97706", bg: "#fffbeb" };
  return {
    text: due.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    color: "#737373",
    bg: "#f8fafc",
  };
};

const statusConfig = {
  PASSED:      { label: "Passed",      bg: "#d1fae5", color: "#059669", border: "#6ee7b7", icon: Award },
  FAILED:      { label: "Failed",      bg: "#fee2e2", color: "#dc2626", border: "#fca5a5", icon: AlertCircle },
  IN_PROGRESS: { label: "In Progress", bg: "#eff6ff", color: "#3b82f6", border: "#93c5fd", icon: null },
};

export default function SubjectCard({ subject, nextDeadlineTask, overdueCount, upcomingCount, completionPct, onFinalize }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  const difficultyColors = {
    EASY:   { bg: "#d1fae5", text: "#059669", border: "#6ee7b7" },
    MEDIUM: { bg: "#fef3c7", text: "#d97706", border: "#fcd34d" },
    HARD:   { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
  };
  const colors = difficultyColors[subject.difficulty] || difficultyColors.MEDIUM;

  const headerBg = {
    EASY:   "#f0fdf4",
    MEDIUM: "#fffbeb",
    HARD:   "#fff5f5",
  };
  const headerColor = headerBg[subject.difficulty] || "#f8fafc";

  const taskCount = subject.totalTasks || 0;
  const completedCount = subject.completedTasks || 0;
  const pct = completionPct ?? (taskCount > 0 ? completedCount / taskCount : 0);

  const hasUrgency = (overdueCount ?? 0) > 0 || (upcomingCount ?? 0) > 0;
  let barColor;
  if (pct < 0.3 && hasUrgency) barColor = "#fca5a5";
  else if (pct > 0.7) barColor = "#34d399";
  else barColor = "#d4d4d4";

  const subjectStatus = subject.status || "IN_PROGRESS";
  const statusCfg = statusConfig[subjectStatus] || statusConfig.IN_PROGRESS;
  const StatusIcon = statusCfg.icon;

  const isFinalized = subjectStatus === "PASSED" || subjectStatus === "FAILED";

  return (
    <div
      style={{ ...styles.card, ...(hovered ? styles.cardHover : {}) }}
      onClick={() => navigate(`/subjects/${subject.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div style={{ ...styles.header, background: headerColor }}>
        <div style={{ ...styles.iconCircle, background: colors.bg, border: `1px solid ${colors.border}` }}>
          <BookOpen size={22} color={colors.text} />
        </div>

        {/* Status badge top-right — only for finalized */}
        {isFinalized && (
          <div style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "3px 8px",
            borderRadius: "20px",
            background: statusCfg.bg,
            border: `1px solid ${statusCfg.border}`,
            fontSize: "11px",
            fontWeight: "600",
            color: statusCfg.color,
          }}>
            {StatusIcon && <StatusIcon size={11} />}
            {statusCfg.label}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        <h3 style={styles.title}>{subject.name}</h3>

        {subject.website && (
          <div style={styles.meta}>
            <a
              href={subject.website}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.websiteLink}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={14} />
            </a>
          </div>
        )}

        {/* Next deadline */}
        {nextDeadlineTask && (() => {
          const dl = formatNextDue(nextDeadlineTask.dueDate);
          const title = nextDeadlineTask.title.length > 22
            ? nextDeadlineTask.title.slice(0, 22) + "…"
            : nextDeadlineTask.title;
          return (
            <div style={{ ...styles.deadlineRow, background: dl.bg }}>
              <Calendar size={12} style={{ color: dl.color, flexShrink: 0 }} />
              <span style={styles.deadlineTitle}>{title}</span>
              <span style={{ ...styles.deadlineDue, color: dl.color }}>{dl.text}</span>
            </div>
          );
        })()}

        {/* Grade display for passed subjects */}
        {subjectStatus === "PASSED" && (
          <div style={{ ...styles.gradeDisplay, background: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}>
            <span style={{ ...styles.gradeNumber, color: statusCfg.color }}>
              {subject.finalGrade ?? "—"}
            </span>
            <span style={{ ...styles.gradeCaption, color: statusCfg.color }}>Final Grade</span>
          </div>
        )}

        {/* Progress */}
        <div style={styles.progress}>
          <div style={styles.progressInfo}>
            <BarChart3 size={14} color="#737373" />
            <span style={styles.progressText}>{completedCount}/{taskCount} tasks</span>
          </div>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: taskCount > 0 ? `${(completedCount / taskCount) * 100}%` : "0%",
                background: barColor,
              }}
            />
          </div>
        </div>

        {/* Finalize / Reset button */}
        {!isFinalized ? (
          <button
            style={{
              ...styles.finalizeBtn,
              ...(btnHovered ? styles.finalizeBtnHover : {}),
            }}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              onFinalize(subject);
            }}
          >
            Finalize Subject
          </button>
        ) : (
          <button
            style={styles.resetBtn}
            onClick={(e) => {
              e.stopPropagation();
              onFinalize(subject, true);
            }}
          >
            Reset to In Progress
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "16px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    position: "relative",
  },
  cardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  header: {
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: "18px 20px 20px",
  },
  title: {
    fontSize: "17px",
    fontWeight: "600",
    color: "#171717",
    margin: "0 0 10px 0",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  websiteLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    background: "#f5f5f5",
    color: "#737373",
  },
  deadlineRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "7px",
    marginBottom: "12px",
  },
  deadlineTitle: {
    fontSize: "12px",
    color: "#525252",
    fontWeight: "500",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  deadlineDue: {
    fontSize: "11px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  gradeDisplay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 10px 8px",
    borderRadius: "10px",
    marginBottom: "12px",
    gap: "2px",
  },
  gradeNumber: {
    fontSize: "30px",
    fontWeight: "700",
    lineHeight: 1,
  },
  gradeCaption: {
    fontSize: "10px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    opacity: 0.7,
  },
  progress: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
  },
  progressInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  progressText: {
    fontSize: "13px",
    color: "#737373",
    fontWeight: "500",
  },
  progressBar: {
    height: "5px",
    background: "#f0f0f0",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.3s ease",
  },
  finalizeBtn: {
    width: "100%",
    padding: "8px 0",
    background: "#f8fafc",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#525252",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  finalizeBtnHover: {
    background: "#171717",
    color: "#ffffff",
    border: "1px solid #171717",
  },
  resetBtn: {
    width: "100%",
    padding: "8px 0",
    background: "transparent",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#a3a3a3",
    cursor: "pointer",
  },
};
