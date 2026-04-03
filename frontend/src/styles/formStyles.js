// Shared form styles for consistent styling across all form components

export const baseFormStyles = {
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "14px",
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
