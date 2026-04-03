import { useState } from "react";

export default function SubtaskForm({ onSubmit, onCancel, initialData = null }) {
    const [title, setTitle] = useState(initialData?.title || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ title, done: initialData?.done || false });
    };

    return (
        <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
                <label style={s.label}>Subtask Title *</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={s.input}
                    placeholder="e.g. Study chapters 1–3"
                    required
                    autoFocus
                />
            </div>

            <div style={s.buttons}>
                <button type="button" onClick={onCancel} style={s.cancelBtn}>
                    Cancel
                </button>
                <button type="submit" style={s.submitBtn}>
                    {initialData ? "Update" : "Add"}
                </button>
            </div>
        </form>
    );
}

const s = {
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
        transition: "border-color 0.15s ease",
        outline: "none",
        color: "var(--ink)",
        background: "var(--surface)",
    },
    buttons: {
        display: "flex",
        gap: "10px",
        justifyContent: "flex-end",
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
