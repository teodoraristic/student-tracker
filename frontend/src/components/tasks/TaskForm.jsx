import { useState } from "react";

const toDateInputStr = (date) => {
    if (!date) return "";
    if (Array.isArray(date)) {
        const [y, m, d] = date;
        return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    return date;
};

export default function TaskForm({ onSubmit, onCancel, initialData = null, defaultDate = "" }) {
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        dueDate: toDateInputStr(initialData?.dueDate) || defaultDate || "",
        points: initialData?.points || "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            points: formData.points ? parseInt(formData.points) : null,
        });
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
                <label style={styles.label}>Assignment Title *</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="e.g. Midterm Exam 1"
                    required
                />
            </div>

            <div style={styles.field}>
                <label style={styles.label}>Description (optional)</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    style={styles.textarea}
                    placeholder="Assignment details..."
                    rows="3"
                />
            </div>

            <div style={styles.row}>
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
                        placeholder="e.g. 30"
                        min="0"
                    />
                </div>
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
        flex: 1,
    },
    row: {
        display: "flex",
        gap: "14px",
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
        transition: "all 0.15s ease",
        outline: "none",
        color: "var(--ink)",
        background: "var(--surface)",
    },
    textarea: {
        padding: "10px 12px",
        fontSize: "13px",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        resize: "vertical",
        minHeight: "80px",
        transition: "all 0.15s ease",
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
        transition: "all 0.15s ease",
        outline: "none",
        background: "var(--surface)",
        cursor: "pointer",
        color: "var(--ink)",
    },
    examToggleRow: {
        display: "flex",
        alignItems: "center",
    },
    examToggleLabel: {
        display: "flex",
        alignItems: "center",
        fontSize: "13px",
        fontWeight: "500",
        color: "var(--ink-2)",
        cursor: "pointer",
        fontFamily: "'DM Sans', system-ui, sans-serif",
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
        transition: "all 0.15s ease",
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
        transition: "all 0.15s ease",
        fontFamily: "'DM Sans', system-ui, sans-serif",
    },
};
