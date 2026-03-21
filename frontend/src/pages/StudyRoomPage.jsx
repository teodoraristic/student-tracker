import { useState, useEffect, useRef } from "react";
import { getAllSubjects } from "../services/subjectService";
import { getAllTasks } from "../services/taskService";
import { getSubtasksByTaskId } from "../services/subtaskService";
import { logStudySession, getTodaySessions } from "../services/studySessionService";
import {
  Play, Pause, RotateCcw, BookOpen, Clock,
  CheckSquare, ChevronDown, FlameKindling,
} from "lucide-react";

// ── constants ─────────────────────────────────────────────────────────────────
const MODES = {
  work:  { label: "Focus",  minutes: 25, color: "var(--rose-400)", bg: "var(--rose-50)" },
  break: { label: "Break",  minutes: 5,  color: "var(--color-done)", bg: "var(--color-done-bg)" },
};

const difficultyColors = {
  EASY:   { bg: "var(--color-done-bg)", text: "var(--color-done)" },
  MEDIUM: { bg: "var(--color-due-soon-bg)", text: "var(--color-due-soon)" },
  HARD:   { bg: "var(--color-overdue-bg)", text: "var(--color-overdue)" },
};

const fmtDuration = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
};

const fmtTime = (dt) => {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
};

// ── component ─────────────────────────────────────────────────────────────────
export default function StudyRoomPage() {
  // ── selector state ──────────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [loadingSubtasks, setLoadingSubtasks] = useState(false);

  // ── timer state ─────────────────────────────────────────────────────────────
  const [mode, setMode] = useState("work");
  const [secondsLeft, setSecondsLeft] = useState(MODES.work.minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);          // completed focus sessions
  const elapsedRef = useRef(0);                          // seconds elapsed in current run

  // ── session history ─────────────────────────────────────────────────────────
  const [todaySessions, setTodaySessions] = useState([]);
  const [logging, setLogging] = useState(false);
  const [lastLogged, setLastLogged] = useState(null);   // brief success message

  // ── initial data load ───────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [subs, tsks, hist] = await Promise.all([
          getAllSubjects(),
          getAllTasks(),
          getTodaySessions(),
        ]);
        setSubjects(subs.filter((s) => s.status !== "PASSED" && s.status !== "FAILED"));
        setTasks(tsks);
        setTodaySessions(hist);
      } catch (err) {
        console.error("Failed to load study room data:", err);
      }
    };
    load();
  }, []);

  // ── subtask loading when task changes ───────────────────────────────────────
  useEffect(() => {
    if (!selectedTask) { setSubtasks([]); setSelectedSubtask(null); return; }
    setLoadingSubtasks(true);
    getSubtasksByTaskId(selectedTask.id)
      .then((data) => {
        setSubtasks(data.filter((s) => !s.done));
        setSelectedSubtask(null);
      })
      .catch(console.error)
      .finally(() => setLoadingSubtasks(false));
  }, [selectedTask]);

  // ── timer tick ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      elapsedRef.current += 1;
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          handleTimerEnd();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  // ── handlers ─────────────────────────────────────────────────────────────────
  const handleTimerEnd = () => {
    setRunning(false);
    if (mode === "work") {
      setSessions((n) => n + 1);
      doLog(elapsedRef.current);
      elapsedRef.current = 0;
    }
    setSecondsLeft(MODES[mode].minutes * 60);
  };

  const switchMode = (m) => {
    setMode(m);
    setRunning(false);
    setSecondsLeft(MODES[m].minutes * 60);
    elapsedRef.current = 0;
  };

  const reset = () => {
    setRunning(false);
    setSecondsLeft(MODES[mode].minutes * 60);
    elapsedRef.current = 0;
  };

  const handleManualEnd = () => {
    if (elapsedRef.current < 10) { reset(); return; } // ignore accidental clicks < 10s
    setRunning(false);
    setSessions((n) => n + 1);
    doLog(elapsedRef.current);
    elapsedRef.current = 0;
    setSecondsLeft(MODES[mode].minutes * 60);
  };

  const doLog = async (durationSeconds) => {
    if (durationSeconds < 10) return;
    setLogging(true);
    try {
      const payload = { durationSeconds };
      if (selectedSubtask) payload.subtaskId = selectedSubtask.id;
      const saved = await logStudySession(payload);
      setTodaySessions((prev) => [saved, ...prev]);
      setLastLogged(saved);
      setTimeout(() => setLastLogged(null), 3000);
    } catch (err) {
      console.error("Failed to log session:", err);
    } finally {
      setLogging(false);
    }
  };

  // ── derived ──────────────────────────────────────────────────────────────────
  const cfg = MODES[mode];
  const total = cfg.minutes * 60;
  const pct = ((total - secondsLeft) / total) * 100;
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  const filteredTasks = tasks.filter(
    (t) => selectedSubject && t.subjectId === selectedSubject.id && t.status !== "DONE"
  );

  const todayTotalSec = todaySessions.reduce((sum, s) => sum + s.durationSeconds, 0);

  const dc = selectedSubject
    ? difficultyColors[selectedSubject.difficulty] || difficultyColors.MEDIUM
    : null;

  return (
    <div style={styles.container}>

      {/* ── header ────────────────────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <FlameKindling size={26} color="var(--rose-400)" />
          <div>
            <h1 style={styles.title}>Study Room</h1>
            <p style={styles.subtitle}>
              {sessions > 0
                ? `${sessions} session${sessions !== 1 ? "s" : ""} completed today`
                : "Start a focus session to begin tracking"}
            </p>
          </div>
        </div>
        {todaySessions.length > 0 && (
          <div style={styles.totalBadge}>
            <Clock size={14} color="var(--rose-400)" />
            <span>{fmtDuration(todayTotalSec)} studied today</span>
          </div>
        )}
      </div>

      <div style={styles.columns}>

        {/* ── LEFT — Timer ─────────────────────────────────────────────────── */}
        <div style={styles.timerCard}>

          {/* mode tabs */}
          <div style={styles.tabs}>
            {Object.entries(MODES).map(([key, m]) => (
              <button
                key={key}
                style={{
                  ...styles.tab,
                  ...(mode === key
                    ? { background: m.bg, color: m.color, borderColor: m.color + "50" }
                    : {}),
                }}
                onClick={() => switchMode(key)}
              >
                {m.label} · {m.minutes}m
              </button>
            ))}
          </div>

          {/* ring */}
          <div style={styles.ringWrap}>
            <svg width="200" height="200" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="100" cy="100" r="88" fill="none" stroke="var(--border)" strokeWidth="10" />
              <circle
                cx="100" cy="100" r="88" fill="none"
                stroke={cfg.color} strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - pct / 100)}`}
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>
            <div style={styles.timeOverlay}>
              <span style={{ ...styles.timeText, color: cfg.color }}>{mins}:{secs}</span>
              {running && (
                <span style={{ ...styles.modeLabel, color: cfg.color }}>
                  {mode === "work" ? "Focusing…" : "On break"}
                </span>
              )}
            </div>
          </div>

          {/* controls */}
          <div style={styles.controls}>
            <button style={styles.resetBtn} onClick={reset} title="Reset">
              <RotateCcw size={16} />
            </button>
            <button
              style={{ ...styles.playBtn, background: cfg.color }}
              onClick={() => setRunning((r) => !r)}
            >
              {running ? <Pause size={20} /> : <Play size={20} />}
              {running ? "Pause" : secondsLeft === total ? "Start" : "Resume"}
            </button>
            {running && mode === "work" && (
              <button style={styles.endBtn} onClick={handleManualEnd} title="End session now">
                End
              </button>
            )}
          </div>

          {/* logged toast */}
          {(lastLogged || logging) && (
            <div style={styles.toast}>
              {logging
                ? "Saving session…"
                : `Session logged · ${fmtDuration(lastLogged.durationSeconds)}`}
            </div>
          )}
        </div>

        {/* ── RIGHT — Selector + History ────────────────────────────────────── */}
        <div style={styles.rightCol}>

          {/* What to study */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <BookOpen size={17} color="var(--rose-400)" />
              What are you studying?
            </h2>

            {/* Subject selector */}
            <div style={styles.selectorRow}>
              <label style={styles.selectorLabel}>Subject</label>
              <div style={styles.selectWrap}>
                <select
                  style={{
                    ...styles.select,
                    ...(dc ? { borderColor: dc.text + "50", color: dc.text } : {}),
                  }}
                  value={selectedSubject?.id ?? ""}
                  onChange={(e) => {
                    const s = subjects.find((s) => s.id === Number(e.target.value)) || null;
                    setSelectedSubject(s);
                    setSelectedTask(null);
                    setSelectedSubtask(null);
                    setSubtasks([]);
                  }}
                >
                  <option value="">— pick a subject —</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={styles.selectArrow} />
              </div>
            </div>

            {/* Task selector */}
            {selectedSubject && (
              <div style={styles.selectorRow}>
                <label style={styles.selectorLabel}>Task</label>
                <div style={styles.selectWrap}>
                  <select
                    style={styles.select}
                    value={selectedTask?.id ?? ""}
                    onChange={(e) => {
                      const t = filteredTasks.find((t) => t.id === Number(e.target.value)) || null;
                      setSelectedTask(t);
                      setSelectedSubtask(null);
                    }}
                  >
                    <option value="">— pick a task —</option>
                    {filteredTasks.map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={styles.selectArrow} />
                </div>
              </div>
            )}

            {/* Subtask selector */}
            {selectedTask && (
              <div style={styles.selectorRow}>
                <label style={styles.selectorLabel}>Subtask</label>
                <div style={styles.selectWrap}>
                  <select
                    style={styles.select}
                    value={selectedSubtask?.id ?? ""}
                    onChange={(e) => {
                      const s = subtasks.find((s) => s.id === Number(e.target.value)) || null;
                      setSelectedSubtask(s);
                    }}
                    disabled={loadingSubtasks}
                  >
                    <option value="">— pick a subtask (optional) —</option>
                    {subtasks.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={styles.selectArrow} />
                </div>
              </div>
            )}

            {/* Currently studying summary */}
            {selectedSubject && (
              <div style={{
                ...styles.studyingBadge,
                background: dc?.bg || "var(--surface-2)",
                borderColor: dc?.text || "var(--border)",
              }}>
                <div style={{ ...styles.studyingDot, background: dc?.text || "var(--ink-3)" }} />
                <span style={{ ...styles.studyingText, color: dc?.text || "var(--ink-3)" }}>
                  {selectedSubtask
                    ? selectedSubtask.title
                    : selectedTask
                    ? selectedTask.title
                    : selectedSubject.name}
                </span>
              </div>
            )}
          </div>

          {/* Today's sessions history */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <CheckSquare size={17} color="var(--rose-400)" />
              Today's Sessions
              {todaySessions.length > 0 && (
                <span style={styles.sessionCount}>{todaySessions.length}</span>
              )}
            </h2>

            {todaySessions.length === 0 ? (
              <div style={styles.emptyHistory}>
                <Clock size={32} color="var(--ink-4)" />
                <p style={styles.emptyText}>No sessions yet today.</p>
              </div>
            ) : (
              <div style={styles.historyList}>
                {todaySessions.map((s) => (
                  <div key={s.id} style={styles.historyItem}>
                    <div style={styles.historyDuration}>
                      {fmtDuration(s.durationSeconds)}
                    </div>
                    <div style={styles.historyMeta}>
                      {s.subtaskTitle
                        ? <span style={styles.historyPrimary}>{s.subtaskTitle}</span>
                        : <span style={styles.historyPrimary}>Free session</span>
                      }
                      {s.subjectName && (
                        <span style={styles.historySecondary}>{s.subjectName}</span>
                      )}
                    </div>
                    <span style={styles.historyTime}>{fmtTime(s.completedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────
const styles = {
  container: { width: "100%", maxWidth: "1200px", margin: "0 auto" },

  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "28px",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  title: { fontSize: "32px", fontWeight: "400", color: "var(--ink)", margin: 0, fontFamily: "'Instrument Serif', serif" },
  subtitle: { fontSize: "14px", color: "var(--ink-3)", margin: "4px 0 0", fontFamily: "'DM Sans', system-ui, sans-serif" },
  totalBadge: {
    display: "flex", alignItems: "center", gap: "7px",
    background: "var(--rose-50)", border: "1px solid var(--rose-200)",
    borderRadius: "var(--r-md)", padding: "8px 14px",
    fontSize: "13px", fontWeight: "600", color: "var(--rose-400)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  columns: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" },

  // Timer card
  timerCard: {
    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)",
    padding: "28px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px",
  },
  tabs: { display: "flex", gap: "10px", width: "100%" },
  tab: {
    flex: 1, padding: "9px 0", fontSize: "13px", fontWeight: "500",
    background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-md)",
    color: "var(--ink-3)", cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  ringWrap: { position: "relative", width: "200px", height: "200px" },
  timeOverlay: {
    position: "absolute", inset: 0,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: "6px",
  },
  timeText: { fontSize: "44px", fontWeight: "400", letterSpacing: "2px", fontVariantNumeric: "tabular-nums", fontFamily: "'Instrument Serif', serif" },
  modeLabel: { fontSize: "13px", fontWeight: "500", fontFamily: "'DM Sans', system-ui, sans-serif" },

  controls: { display: "flex", alignItems: "center", gap: "10px" },
  resetBtn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "40px", height: "40px", background: "transparent",
    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
    color: "var(--ink-3)", cursor: "pointer",
  },
  playBtn: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "11px 28px", border: "none", borderRadius: "var(--r-md)",
    color: "#fff", fontSize: "14px", fontWeight: "500", cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  endBtn: {
    display: "flex", alignItems: "center",
    padding: "11px 18px", border: "1px solid var(--border)", borderRadius: "var(--r-md)",
    background: "var(--surface-2)", color: "var(--ink-2)", fontSize: "13px", fontWeight: "500", cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  toast: {
    padding: "10px 18px", background: "var(--color-done-bg)", border: "1px solid var(--color-done)",
    borderRadius: "var(--r-md)", fontSize: "13px", fontWeight: "600", color: "var(--color-done)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  // Right column
  rightCol: { display: "flex", flexDirection: "column", gap: "16px" },
  card: {
    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "20px",
  },
  cardTitle: {
    display: "flex", alignItems: "center", gap: "8px",
    fontSize: "15px", fontWeight: "600", color: "var(--ink)", margin: "0 0 18px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  sessionCount: {
    marginLeft: "auto",
    fontSize: "12px", fontWeight: "600",
    background: "var(--rose-50)", color: "var(--rose-400)",
    padding: "2px 8px", borderRadius: "99px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  selectorRow: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" },
  selectorLabel: { fontSize: "11px", fontWeight: "600", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'DM Sans', system-ui, sans-serif" },
  selectWrap: { position: "relative" },
  select: {
    width: "100%", appearance: "none",
    padding: "9px 32px 9px 12px",
    fontSize: "13px", fontWeight: "500", color: "var(--ink)",
    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)",
    outline: "none", cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  selectArrow: {
    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
    color: "var(--ink-3)", pointerEvents: "none",
  },

  studyingBadge: {
    display: "flex", alignItems: "center", gap: "10px",
    marginTop: "8px", padding: "10px 14px",
    border: "1px solid", borderRadius: "var(--r-md)",
  },
  studyingDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  studyingText: { fontSize: "13px", fontWeight: "600", fontFamily: "'DM Sans', system-ui, sans-serif" },

  emptyHistory: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "10px", padding: "24px 0", textAlign: "center",
  },
  emptyText: { fontSize: "14px", color: "var(--ink-3)", margin: 0, fontFamily: "'DM Sans', system-ui, sans-serif" },

  historyList: { display: "flex", flexDirection: "column", gap: "8px" },
  historyItem: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "10px 12px", background: "var(--surface-2)",
    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
  },
  historyDuration: {
    fontSize: "13px", fontWeight: "600", color: "var(--rose-400)",
    minWidth: "44px", flexShrink: 0, fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  historyMeta: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" },
  historyPrimary: { fontSize: "13px", fontWeight: "500", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'DM Sans', system-ui, sans-serif" },
  historySecondary: { fontSize: "11px", color: "var(--ink-3)", fontWeight: "500", fontFamily: "'DM Sans', system-ui, sans-serif" },
  historyTime: { fontSize: "11px", color: "var(--ink-4)", fontWeight: "500", flexShrink: 0, fontFamily: "'DM Sans', system-ui, sans-serif" },
};
