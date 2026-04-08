import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { SALMON, DARK } from "../utils/colors";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div style={styles.root}>
            <div style={styles.logoMark} onClick={() => navigate("/")}>
                <BookOpen size={20} color={SALMON} strokeWidth={2.2} />
            </div>
            <h1 style={styles.code}>404</h1>
            <h2 style={styles.title}>Page not found</h2>
            <p style={styles.sub}>The page you're looking for doesn't exist or was moved.</p>
            <button style={styles.btn} onClick={() => navigate("/home")}>
                Go to Dashboard
            </button>
        </div>
    );
}

const styles = {
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#1e1a1a",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        textAlign: "center",
        padding: "40px 24px",
    },
    logoMark: {
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: "rgba(244,149,133,0.12)",
        border: "1.5px solid rgba(244,149,133,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 32,
        cursor: "pointer",
    },
    code: {
        fontFamily: "'Instrument Serif', serif",
        fontSize: 96,
        fontWeight: 400,
        color: SALMON,
        margin: "0 0 8px",
        lineHeight: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 600,
        color: "#ffffff",
        margin: "0 0 12px",
    },
    sub: {
        fontSize: 14,
        color: "rgba(255,255,255,0.4)",
        margin: "0 0 32px",
        lineHeight: 1.6,
    },
    btn: {
        padding: "12px 28px",
        background: SALMON,
        color: DARK,
        border: "none",
        borderRadius: 99,
        fontSize: 15,
        fontWeight: 700,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        cursor: "pointer",
        letterSpacing: "-0.01em",
    },
};
