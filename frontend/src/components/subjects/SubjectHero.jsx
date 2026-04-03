import { ExternalLink, Pencil } from "lucide-react";
import ProgressRing from "../ui/ProgressRing";
import { SUBJECT_COLORS } from "../../utils/subjectColors";
import useIsMobile from "../../hooks/useIsMobile";

const statusConfig = {
  PASSED:      { label: "Passed",      bg: "var(--color-done-bg)", color: "var(--color-done)", border: "var(--color-done)40" },
  FAILED:      { label: "Failed",      bg: "var(--color-overdue-bg)", color: "var(--color-overdue)", border: "var(--color-overdue)40" },
  IN_PROGRESS: { label: "In Progress", bg: "var(--color-future-bg)", color: "var(--color-future)", border: "var(--color-future)40" },
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
  onEditSubject,
  onFinalize,
  onReset,
  completionPct,
  todoTasks,
  overdueTasks,
  completedTasks,
  earnedPoints,
  totalPoints,
}) {
  const isMobile = useIsMobile();
  const sc = statusConfig[subject.status] || statusConfig.IN_PROGRESS;
  const pointsPct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const isPassed = subject.status === "PASSED";
  const isFinalized = subject.status === "PASSED" || subject.status === "FAILED";
  const isAllDone = todoTasks === 0 && overdueTasks === 0 && completedTasks > 0;
  const accentColor = subject.color || SUBJECT_COLORS[(subject.id || 0) % SUBJECT_COLORS.length];

  const statsSection = (
    <>
      {/* Progress stat */}
      <div style={isMobile ? s.colStatMobile : s.colStat}>
        <span style={s.colLabel}>Progress</span>
        <span style={s.statBig}>{completionPct}%</span>
        <span style={s.statSub}>completion</span>
        <div style={s.breakdown}>
          <div style={s.bItem}>
            <span style={{ ...s.bCount, color: todoTasks > 0 ? "var(--ink-2)" : "var(--ink-4)" }}>{todoTasks}</span>
            <span style={s.bLabel}>To Do</span>
          </div>
          <span style={s.bDot}>·</span>
          <div style={s.bItem}>
            <span style={{ ...s.bCount, color: overdueTasks > 0 ? "var(--color-overdue)" : "var(--ink-4)" }}>{overdueTasks}</span>
            <span style={s.bLabel}>Overdue</span>
          </div>
          <span style={s.bDot}>·</span>
          <div style={s.bItem}>
            <span style={{ ...s.bCount, color: completedTasks > 0 ? "var(--color-done)" : "var(--ink-4)" }}>{completedTasks}</span>
            <span style={s.bLabel}>Done</span>
          </div>
        </div>
      </div>

      {isMobile ? <div style={s.dividerV} /> : <div style={s.divider} />}

      {/* Points stat */}
      <div style={isMobile ? s.colStatMobile : s.colStat}>
        <span style={s.colLabel}>Points</span>
        {isPassed ? (
          <>
            <span style={s.gradePassed}>{subject.finalGrade}</span>
            <span style={s.gradeCaption}>Final Grade</span>
            <div style={s.pointsSubtle}>{earnedPoints}/{totalPoints} pts</div>
          </>
        ) : (
          <>
            <ProgressRing percentage={pointsPct} size={72} strokeWidth={6} color="var(--rose-400)">
              <span style={s.ringNum}>{earnedPoints}</span>
              <span style={s.ringLabel}>pts</span>
            </ProgressRing>
            <div style={s.pointsLine}>
              <span style={s.pointsEarned}>{earnedPoints}</span>
              <span style={s.pointsSep}>/</span>
              <span style={s.pointsTotal}>{totalPoints} pts</span>
            </div>
            {isAllDone && totalPoints > 0 && (
              <span style={s.gradeHint}>~{calcGrade(earnedPoints)}</span>
            )}
          </>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div style={{ ...s.hero, padding: "16px 16px 16px 20px" }}>
        <div style={{ ...s.accentBar, background: accentColor }} />

        {/* Subject info */}
        <div style={s.colInfo}>
          <div style={s.badgeRow}>
            <span style={{ ...s.statusBadge, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
              {subject.status === "PASSED" && subject.finalGrade ? `Passed · ${subject.finalGrade}` : sc.label}
            </span>
          </div>
          <div style={s.titleRow}>
            <h1 style={{ ...s.title, fontSize: "24px" }}>{subject.name}</h1>
            {onEditSubject && (
              <button onClick={onEditSubject} style={s.editInlineBtn} title="Edit subject">
                <Pencil size={14} />
              </button>
            )}
          </div>
          {subject.website && (
            <a href={subject.website} target="_blank" rel="noopener noreferrer" style={s.websiteLink}>
              <ExternalLink size={12} />
              Course Website
            </a>
          )}
        </div>

        <div style={s.dividerH} />

        {/* Stats row */}
        <div style={s.mobileStatsRow}>
          {statsSection}
        </div>

        {/* Actions */}
        {(onFinalize && !isFinalized) || (onReset && isFinalized) ? (
          <>
            <div style={s.dividerH} />
            <div style={{ paddingTop: "4px" }}>
              {onFinalize && !isFinalized && (
                <button onClick={onFinalize} style={s.finalizeBtn}>Finalize Subject</button>
              )}
              {onReset && isFinalized && (
                <button onClick={onReset} style={s.resetBtn}>Reset to In Progress</button>
              )}
            </div>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div style={{ ...s.hero }}>
      <div style={{ ...s.accentBar, background: accentColor }} />
      <div style={s.columns}>

        {/* Col 1 — Subject info */}
        <div style={s.colInfo}>
          <div style={s.badgeRow}>
            <span style={{ ...s.statusBadge, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
              {subject.status === "PASSED" && subject.finalGrade
                ? `Passed · ${subject.finalGrade}`
                : sc.label}
            </span>
          </div>
          <div style={s.titleRow}>
            <h1 style={s.title}>{subject.name}</h1>
            {onEditSubject && (
              <button onClick={onEditSubject} style={s.editInlineBtn} title="Edit subject">
                <Pencil size={14} />
              </button>
            )}
          </div>
          {subject.website && (
            <a href={subject.website} target="_blank" rel="noopener noreferrer" style={s.websiteLink}>
              <ExternalLink size={12} />
              Course Website
            </a>
          )}
        </div>

        {/* Divider */}
        <div style={s.divider} />

        {statsSection}

        {/* Divider */}
        <div style={s.divider} />

        {/* Col 4 — Actions */}
        <div style={s.colActions}>
          {onFinalize && !isFinalized && (
            <button onClick={onFinalize} style={s.finalizeBtn}>
              Finalize Subject
            </button>
          )}
          {onReset && isFinalized && (
            <button onClick={onReset} style={s.resetBtn}>
              Reset to In Progress
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

const s = {
  hero: {
    borderRadius: "var(--r-lg)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    padding: "24px 28px",
    marginBottom: "24px",
    position: "relative",
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "4px",
    height: "100%",
    borderRadius: "4px 0 0 4px",
  },
  columns: {
    display: "flex",
    alignItems: "stretch",
    gap: "0",
    paddingLeft: "12px",
  },
  divider: {
    width: "1px",
    background: "var(--border)",
    margin: "0 24px",
    flexShrink: 0,
  },
  dividerH: {
    height: "1px",
    background: "var(--border)",
    margin: "14px 0",
  },
  mobileStatsRow: {
    display: "flex",
    alignItems: "stretch",
  },
  dividerV: {
    width: "1px",
    background: "var(--border)",
    margin: "0 16px",
    flexShrink: 0,
  },
  colStatMobile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    flex: 1,
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
    borderRadius: "99px",
    fontSize: "11px",
    fontWeight: "600",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
  },
  title: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "32px",
    fontWeight: "400",
    color: "var(--ink)",
    margin: 0,
    lineHeight: 1.15,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  editInlineBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "28px",
    height: "28px",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    color: "var(--ink-3)",
    cursor: "pointer",
  },
  websiteLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    color: "var(--ink-3)",
    fontSize: "12px",
    fontWeight: "500",
    textDecoration: "none",
  },
  colLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--ink-3)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "4px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  statBig: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "34px",
    fontWeight: "400",
    color: "var(--ink)",
    lineHeight: 1,
  },
  statSub: {
    fontSize: "11px",
    color: "var(--ink-3)",
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
    color: "var(--ink-3)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  bDot: {
    color: "var(--border-2)",
    fontSize: "14px",
    alignSelf: "flex-start",
    marginTop: "2px",
  },
  ringNum: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--ink)",
    lineHeight: 1,
  },
  ringLabel: {
    fontSize: "9px",
    color: "var(--ink-3)",
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
    color: "var(--ink)",
  },
  pointsSep: {
    fontSize: "11px",
    color: "var(--ink-4)",
  },
  pointsTotal: {
    fontSize: "11px",
    fontWeight: "500",
    color: "var(--ink-3)",
  },
  gradePassed: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "36px",
    fontWeight: "400",
    color: "var(--color-done)",
    lineHeight: 1,
  },
  gradeCaption: {
    fontSize: "11px",
    color: "var(--color-done)",
    fontWeight: "500",
    opacity: 0.8,
  },
  pointsSubtle: {
    fontSize: "12px",
    color: "var(--ink-3)",
    fontWeight: "500",
    marginTop: "4px",
  },
  gradeHint: {
    fontSize: "11px",
    color: "var(--ink-3)",
    fontWeight: "600",
    marginTop: "2px",
    background: "var(--surface-3)",
    padding: "2px 8px",
    borderRadius: "var(--r-sm)",
  },
  deleteBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    background: "transparent",
    border: "1px solid var(--color-overdue)30",
    borderRadius: "var(--r-sm)",
    color: "var(--color-overdue)",
    cursor: "pointer",
  },
  finalizeBtn: {
    padding: "7px 16px",
    background: "var(--rose-400)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--r-md)",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    width: "100%",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  resetBtn: {
    padding: "7px 16px",
    background: "transparent",
    color: "var(--ink-3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    width: "100%",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
};
