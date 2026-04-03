import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { SUBJECT_COLORS } from "../../utils/subjectColors";
import { parseDateLocal } from "../../utils/dateUtils";

const useIsDark = () => {
  const [dark, setDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark"
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute("data-theme") === "dark");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return dark;
};

const formatNextDue = (dueDate) => {
  const due = parseDateLocal(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due - today) / 86400000);
  if (diff < 0) return { text: `Overdue by ${Math.abs(diff)}d`, color: "var(--color-overdue)", bg: "var(--color-overdue-bg)" };
  if (diff === 0) return { text: "Due today", color: "var(--color-due-soon)", bg: "var(--color-due-soon-bg)" };
  if (diff <= 3) return { text: `${diff}d left`, color: "var(--color-due-soon)", bg: "var(--color-due-soon-bg)" };
  return {
    text: due.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    color: "var(--ink-3)",
    bg: "var(--surface-2)",
  };
};

const statusConfig = {
  PASSED:      { label: "Passed",      bg: "var(--color-done-bg)",     color: "var(--color-done)",     border: "var(--color-done)" },
  FAILED:      { label: "Failed",      bg: "var(--color-overdue-bg)",  color: "var(--color-overdue)",  border: "var(--color-overdue)" },
  IN_PROGRESS: { label: "In Progress", bg: "var(--color-future-bg)",   color: "var(--color-future)",   border: "var(--color-future)" },
};

export default function SubjectCard({ subject, nextDeadlineTask, completionPct, onFinalize }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const isDark = useIsDark();
  const accentColor = subject.color ?? SUBJECT_COLORS[(subject.id || 0) % SUBJECT_COLORS.length];

  const cardStyle = {
    ...s.card,
    border: `1.5px solid ${accentColor}`,
    background: isDark ? `${accentColor}18` : `${accentColor}12`,
    ...(hovered ? s.cardHover : {}),
  };

  const taskCount = subject.totalTasks || 0;
  const completedCount = subject.completedTasks || 0;
  const rawPct = completionPct ?? (taskCount > 0 ? completedCount / taskCount : 0);
  const pct = Math.round(rawPct * 100);

  const subjectStatus = subject.status || "IN_PROGRESS";
  const statusCfg = statusConfig[subjectStatus] || statusConfig.IN_PROGRESS;
  const isFinalized = subjectStatus === "PASSED" || subjectStatus === "FAILED";

  let barColor;
  if (subjectStatus === "PASSED") barColor = "var(--color-done)";
  else if (pct > 60) barColor = "var(--color-done)";
  else if (pct > 30) barColor = "var(--color-due-soon)";
  else barColor = "var(--rose-400)";

  return (
    <div
      style={cardStyle}
      onClick={() => navigate(`/subjects/${subject.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.content}>

        {/* ROW 1: name + status badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
          <h3 style={s.title}>{subject.name}</h3>
          {isFinalized && (
            <span style={{ ...s.statusBadge, background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
              {statusCfg.label}
            </span>
          )}
        </div>

        {/* ROW 2: task meta */}
        <div style={s.taskMeta}>{completedCount}/{taskCount} tasks completed</div>

        {/* ROW 3: progress bar + percentage */}
        <div style={s.progressRow}>
          <div style={s.progressBar}>
            <div style={{ ...s.progressFill, width: `${pct}%`, background: barColor }} />
          </div>
          <span style={s.progressPct}>{pct}%</span>
        </div>

        {/* ROW 4: deadline */}
        {nextDeadlineTask && (() => {
          const dl = formatNextDue(nextDeadlineTask.dueDate);
          const title = nextDeadlineTask.title.length > 22
            ? nextDeadlineTask.title.slice(0, 22) + "…"
            : nextDeadlineTask.title;
          return (
            <div style={{ ...s.deadlineRow, background: dl.bg, marginTop: "10px" }}>
              <Calendar size={12} style={{ color: dl.color, flexShrink: 0 }} />
              <span style={s.deadlineTitle}>{title}</span>
              <span style={{ ...s.deadlineDue, color: dl.color }}>{dl.text}</span>
            </div>
          );
        })()}

        {/* ROW 5: grade pill */}
        {subjectStatus === "PASSED" && subject.finalGrade != null && (
          <div style={{ ...s.gradeDisplay, background: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}>
            <span style={{ ...s.gradeNumber, color: statusCfg.color }}>
              {subject.finalGrade}
            </span>
            <span style={{ ...s.gradeCaption, color: statusCfg.color }}>Final Grade</span>
          </div>
        )}

      </div>
    </div>
  );
}

const s = {
  card: {
    borderRadius: "var(--r-lg)",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    position: "relative",
  },
  cardHover: {
    transform: "translateY(-2px)",
  },
  content: {
    padding: "14px 16px 16px 16px",
  },
  title: {
    fontSize: "16px",
    fontWeight: "400",
    color: "var(--ink)",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: "'Instrument Serif', serif",
  },
  statusBadge: {
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
    borderRadius: "99px",
    padding: "3px 8px",
    flexShrink: 0,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
  },
  taskMeta: {
    fontSize: "11px",
    color: "var(--ink-3)",
    fontWeight: "500",
    marginBottom: "8px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  progressBar: {
    flex: 1,
    height: "3px",
    background: "var(--border)",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.3s ease",
  },
  progressPct: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--ink-3)",
    minWidth: "28px",
    textAlign: "right",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  deadlineRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "var(--r-sm)",
  },
  deadlineTitle: {
    fontSize: "12px",
    color: "var(--ink-2)",
    fontWeight: "500",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  deadlineDue: {
    fontSize: "11px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    flexShrink: 0,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  gradeDisplay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 10px 8px",
    borderRadius: "var(--r-md)",
    marginTop: "10px",
    gap: "2px",
  },
  gradeNumber: {
    fontSize: "30px",
    fontWeight: "400",
    lineHeight: 1,
    fontFamily: "'Instrument Serif', serif",
  },
  gradeCaption: {
    fontSize: "10px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    opacity: 0.7,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
};
