import { useState } from "react";

export default function SubtaskForm({ onSubmit, onCancel, initialData = null }) {
    const [title, setTitle] = useState(initialData?.title || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ title, done: initialData?.done || false });
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
                <label style={styles.label}>Subtask Title *</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. Study chapters 1-3"
                    required
                    autoFocus
                />
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
        gap: "24px",
    },
    field: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    label: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#171717",
    },
    input: {
        padding: "12px 14px",
        fontSize: "15px",
        border: "1px solid #e5e5e5",
        borderRadius: "10px",
        fontFamily: "inherit",
        transition: "all 0.2s ease",
        outline: "none",
    },
    buttons: {
        display: "flex",
        gap: "12px",
        justifyContent: "flex-end",
        marginTop: "10px",
    },
    cancelBtn: {
        padding: "10px 20px",
        backgroundColor: "#f5f5f5",
        color: "#171717",
        border: "1px solid #e5e5e5",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: "500",
        transition: "all 0.2s ease",
    },
    submitBtn: {
        padding: "10px 20px",
        backgroundColor: "#f43f5e",
        color: "white",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: "600",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 8px rgba(244, 63, 94, 0.2)",
    },
};