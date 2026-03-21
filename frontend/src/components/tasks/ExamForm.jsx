import { useState, useEffect } from "react";
import { getAllExamPeriods } from "../../services/examPeriodService";

const toDateInputStr = (date) => {
    if (!date) return "";
    if (Array.isArray(date)) {
        const [y, m, d] = date;
        return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    return date;
};

export default function ExamForm({ onSubmit, onCancel, initialData = null }) {
    const [examPeriods, setExamPeriods] = useState([]);
    const [formData, setFormData] = useState({
        dueDate: toDateInputStr(initialData?.dueDate) || "",
        points: initialData?.points || "",
        examPeriodId: initialData?.examPeriodId || "",
    });

    useEffect(() => {
        getAllExamPeriods().then(setExamPeriods).catch(() => {});
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            title: "Exam",
            description: "",
            priority: "HIGH",
            dueDate: formData.dueDate,
            points: formData.points ? parseInt(formData.points) : null,
            examPeriodId: formData.examPeriodId ? Number(formData.examPeriodId) : null,
        });
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
                <label style={styles.label}>Due Date (optional)</label>
                <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    style={styles.input}
                />
            </div>

            <div style={styles.field}>
                <label style={styles.label}>Points (optional)</label>
                <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="e.g. 100"
                    min="0"
                />
            </div>

            <div style={styles.field}>
                <label style={styles.label}>Exam Period *</label>
                <select
                    name="examPeriodId"
                    value={formData.examPeriodId}
                    onChange={handleChange}
                    style={styles.select}
                    required
                >
                    <option value="">— Select exam period —</option>
                    {examPeriods.map(ep => (
                        <option key={ep.id} value={ep.id}>{ep.name}</option>
                    ))}
                </select>
            </div>

            <div style={styles.buttons}>
                <button type="button" onClick={onCancel} style={styles.cancelBtn}>
                    Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                    {initialData ? "Update" : "Add"}
                </button>
            </div>
        </form>
    );
}

const styles = {
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    field: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    label: {
        fontSize: "13px",
        fontWeight: "600",
        color: "var(--ink)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
    },
    input: {
        padding: "10px 12px",
        fontSize: "13px",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        outline: "none",
        color: "var(--ink)",
        background: "var(--surface)",
    },
    select: {
        padding: "10px 12px",
        fontSize: "13px",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        outline: "none",
        background: "var(--surface)",
        cursor: "pointer",
        color: "var(--ink)",
    },
    buttons: {
        display: "flex",
        gap: "10px",
        justifyContent: "flex-end",
        marginTop: "6px",
    },
    cancelBtn: {
        padding: "8px 18px",
        backgroundColor: "var(--surface-3)",
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
        backgroundColor: "var(--rose-400)",
        color: "white",
        border: "none",
        borderRadius: "var(--r-md)",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "500",
        fontFamily: "'DM Sans', system-ui, sans-serif",
    },
};
