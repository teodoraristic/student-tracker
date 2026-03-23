import useIsMobile from "../../hooks/useIsMobile";

export default function Modal({ isOpen, onClose, title, children }) {
    const isMobile = useIsMobile();
    if (!isOpen) return null;

    return (
        <div
            style={{ ...styles.overlay, alignItems: isMobile ? "flex-end" : "center" }}
            onClick={onClose}
        >
            <div
                style={isMobile ? styles.sheet : styles.modal}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={styles.header}>
                    <h2 style={styles.title}>{title}</h2>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
                <div style={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(26, 21, 35, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        zIndex: 1000,
    },
    modal: {
        backgroundColor: "var(--surface)",
        borderRadius: "var(--r-xl)",
        width: "90%",
        maxWidth: "540px",
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 20px 60px rgba(26, 21, 35, 0.25)",
        border: "1px solid var(--border)",
    },
    sheet: {
        backgroundColor: "var(--surface)",
        borderRadius: "var(--r-xl) var(--r-xl) 0 0",
        width: "100%",
        maxHeight: "88vh",
        overflowY: "auto",
        boxShadow: "0 -8px 40px rgba(26, 21, 35, 0.2)",
        border: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom)",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "22px 24px 18px 24px",
        borderBottom: "1px solid var(--border)",
    },
    title: {
        margin: 0,
        fontFamily: "'Instrument Serif', serif",
        fontSize: "22px",
        fontWeight: "400",
        color: "var(--ink)",
    },
    closeBtn: {
        backgroundColor: "transparent",
        border: "1px solid var(--border)",
        fontSize: "16px",
        cursor: "pointer",
        color: "var(--ink-3)",
        padding: "4px",
        width: "30px",
        height: "30px",
        borderRadius: "var(--r-sm)",
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        padding: "24px",
    },
};
