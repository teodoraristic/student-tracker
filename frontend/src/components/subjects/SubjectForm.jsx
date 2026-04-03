import { useState } from "react";

export default function SubjectForm({ onSubmit, onCancel, initialData = null, semesters = [] }) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        website: initialData?.website || "",
        semesterId: initialData?.semesterId || "",
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
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
                <label style={s.label}>Subject Name *</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={s.input}
                    placeholder="e.g. Mathematics 1"
                    required
                />
            </div>

            <div style={s.field}>
                <label style={s.label}>Website (optional)</label>
                <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    style={s.input}
                    placeholder="https://..."
                />
            </div>

            <div style={s.field}>
                <label style={s.label}>Semester (optional)</label>
                <select
                    name="semesterId"
                    value={formData.semesterId || ""}
                    onChange={handleChange}
                    style={s.select}
                >
                    <option value="">No semester</option>
                    {semesters.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
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
