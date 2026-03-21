import { useState } from "react";

export default function FinalizeModal({ subject, onClose, onSave }) {
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

  const manualGradeNum = parseInt(manualGrade);
  const manualGradeEntered = useManual && !isNaN(manualGradeNum);
  const displayGrade = manualGradeEntered ? manualGradeNum : autoGrade;
  const isPassing = !manualGradeEntered || displayGrade >= 6;
  const gradeColor = isPassing ? "var(--color-done)" : "var(--color-overdue)";
  const gradeLabel = displayGrade >= 6 ? "PASSED" : "FAILED";

  return (
    <form onSubmit={handleSubmit} style={mStyles.form}>
      {/* Points summary */}
      <div style={mStyles.pointsBox}>
        <span style={mStyles.pointsLabel}>Points earned from completed tasks</span>
        <span style={mStyles.pointsValue}>{subject.totalPoints ?? 0} pts</span>
      </div>

      {/* Auto-calculated grade preview */}
      <div style={{
        ...mStyles.gradePreview,
        borderColor: gradeColor + "50",
        borderWidth: "2px",
        borderStyle: "solid",
      }}>
        <div>
          <div style={mStyles.gradePreviewLabel}>
            {useManual ? "Manual grade" : "Calculated grade"}
          </div>
          <div style={{ ...mStyles.gradePreviewNum, color: gradeColor }}>
            {manualGradeEntered ? manualGrade : autoGrade}
          </div>
        </div>
        <div style={{ ...mStyles.gradeBadge, background: gradeColor + "18", color: gradeColor, border: `1px solid ${gradeColor}40` }}>
          {gradeLabel}
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
          style={{ accentColor: "var(--rose-400)" }}
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
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  pointsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: "var(--surface-2)",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
  },
  pointsLabel: {
    fontSize: "13px", color: "var(--ink-3)", fontWeight: "500",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  pointsValue: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "18px", color: "var(--ink)", fontWeight: "400",
  },
  gradePreview: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    background: "var(--surface-2)",
    borderRadius: "var(--r-md)",
    borderWidth: "2px",
    borderStyle: "solid",
  },
  gradePreviewLabel: {
    fontSize: "12px", color: "var(--ink-3)", marginBottom: "2px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  gradePreviewNum: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: "32px", fontWeight: "400",
  },
  gradeBadge: {
    padding: "5px 12px",
    borderRadius: "99px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  toggleLabel: {
    fontSize: "13px", color: "var(--ink-2)", fontWeight: "500",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: {
    fontSize: "13px", fontWeight: "600", color: "var(--ink)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  input: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    outline: "none",
    color: "var(--ink)",
    background: "var(--surface)",
  },
  error: {
    fontSize: "13px",
    color: "var(--color-overdue)",
    background: "var(--color-overdue-bg)",
    border: "1px solid var(--color-overdue)30",
    borderRadius: "var(--r-sm)",
    padding: "8px 12px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  buttons: { display: "flex", gap: "10px", justifyContent: "flex-end" },
  cancelBtn: {
    padding: "8px 18px",
    background: "var(--surface-3)",
    color: "var(--ink)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  submitBtn: {
    padding: "8px 18px",
    background: "var(--ink)",
    color: "var(--surface)",
    border: "none",
    borderRadius: "var(--r-md)",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
};
