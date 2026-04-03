export function FormField({ label, error, labelStyle, inputStyle, errorStyle, ...props }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ ...defaultFormFieldStyles.label, ...labelStyle }}>{label}</label>
            <input style={{ ...defaultFormFieldStyles.input, ...(error ? { borderColor: "#ff6b6b" } : {}), ...inputStyle }} {...props} />
            {error && <span style={{ ...defaultFormFieldStyles.error, ...errorStyle }}>{error}</span>}
        </div>
    );
}

const defaultFormFieldStyles = {
    label: {
        fontSize: 13,
        fontWeight: 600,
        color: "rgba(255, 255, 255, 0.7)",
        marginBottom: 4,
    },
    input: {
        width: "100%",
        padding: "10px 12px",
        fontSize: 14,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 8,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        color: "white",
        fontFamily: "inherit",
        transition: "border-color 0.15s ease",
        boxSizing: "border-box",
    },
    error: {
        fontSize: 12,
        color: "#ff6b6b",
        marginTop: 2,
    },
};
