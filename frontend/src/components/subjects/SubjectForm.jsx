import { useState } from "react";
import { Difficulty, DifficultyLabels } from "../../utils/enums";

export default function SubjectForm({ onSubmit, onCancel, initialData = null }) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        website: initialData?.website || "",
        difficulty: initialData?.difficulty || "MEDIUM",
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
        <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
                <label style={styles.label}>Subject Name *</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="e.g. Mathematics 1"
                    required
                />
            </div>

            <div style={styles.field}>
                <label style={styles.label}>Website (optional)</label>
                <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="https://..."
                />
            </div>

            <div style={styles.field}>
                <label style={styles.label}>Difficulty *</label>
                <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    style={styles.select}
                    required
                >
                    {Object.values(Difficulty).map(diff => (
                        <option key={diff} value={diff}>
                            {DifficultyLabels[diff]}
                        </option>
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