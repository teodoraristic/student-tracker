import { useState } from "react";
import { Priority, PriorityLabels } from "../../utils/enums";

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
        priority: initialData?.priority || "MEDIUM",
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

            <div style={styles.field}>
                <label style={styles.label}>Priority *</label>
                <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    style={styles.select}
                    required
                >
                    {Object.values(Priority).map(p => (
                        <option key={p} value={p}>
                            {PriorityLabels[p]}
                        </option>
                    ))}
                </select>
            </div>

            <div style={styles.row}>
                <div style={styles.field}>
                    <label style={styles.label}>Due Date *</label>
                    <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        style={styles.input}
                        required
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
        gap: "24px",
    },
    field: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        flex: 1,
    },
    row: {
        display: "flex",
        gap: "16px",
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
    textarea: {
        padding: "12px 14px",
        fontSize: "15px",
        border: "1px solid #e5e5e5",
        borderRadius: "10px",
        fontFamily: "inherit",
        resize: "vertical",
        minHeight: "80px",
        transition: "all 0.2s ease",
        outline: "none",
    },
    select: {
        padding: "12px 14px",
        fontSize: "15px",
        border: "1px solid #e5e5e5",
        borderRadius: "10px",
        fontFamily: "inherit",
        transition: "all 0.2s ease",
        outline: "none",
        background: "#ffffff",
        cursor: "pointer",
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