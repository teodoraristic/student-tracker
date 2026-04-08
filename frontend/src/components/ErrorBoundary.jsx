import { Component } from "react";
import { SALMON, DARK } from "../utils/colors";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("ErrorBoundary caught:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={styles.root}>
                    <h1 style={styles.title}>Something went wrong</h1>
                    <p style={styles.sub}>An unexpected error occurred. Try refreshing the page.</p>
                    <button style={styles.btn} onClick={() => window.location.reload()}>
                        Refresh
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
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
    title: {
        fontFamily: "'Instrument Serif', serif",
        fontSize: 32,
        fontWeight: 400,
        color: SALMON,
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
    },
};
