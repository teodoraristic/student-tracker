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
                style={isMobile ? s.sheet : s.modal}
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
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "center",
        zIndex: 1000,
    },
    modal: {
        backgroundColor: "#1c1c1c",
        borderRadius: 20,
        width: "90%",
        maxWidth: "520px",
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.07)",
    },
    sheet: {
        backgroundColor: "#1c1c1c",
        borderRadius: "20px 20px 0 0",
        width: "100%",
        maxHeight: "88vh",
        overflowY: "auto",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderBottom: "none",
        paddingBottom: "env(safe-area-inset-bottom)",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 24px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
    },
    title: {
        margin: 0,
        fontFamily: "'Instrument Serif', serif",
        fontSize: 20,
        fontWeight: 400,
        color: "rgba(255,255,255,0.92)",
    },
    closeBtn: {
        backgroundColor: "transparent",
        border: "1px solid rgba(255,255,255,0.1)",
        fontSize: 14,
        cursor: "pointer",
        color: "rgba(255,255,255,0.4)",
        padding: 4,
        width: 28,
        height: 28,
        borderRadius: 8,
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        padding: "24px",
    },
};
