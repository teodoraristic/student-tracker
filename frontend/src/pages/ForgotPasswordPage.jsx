import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { forgotPassword } from "../services/authService";
import useIsMobile from "../hooks/useIsMobile";
import { SALMON, WHITE, DARK } from "../utils/colors";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const isMobile = useIsMobile(860);
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await forgotPassword(email);
            setSubmitted(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ ...styles.root, flexDirection: isMobile ? "column" : "row" }}>
            {!isMobile && <div style={styles.left} />}

            <div style={styles.right}>
                <div style={styles.inner}>
                    <div style={styles.logoWrap} onClick={() => navigate("/")}>
                        <div style={styles.logoMark}>
                            <BookOpen size={18} color={SALMON} strokeWidth={2.2} />
                        </div>
                    </div>

                    {submitted ? (
                        <div style={styles.successBox}>
                            <div style={styles.headWrap}>
                                <h1 style={styles.appName}>Check your inbox</h1>
                                <p style={styles.sub}>
                                    If an account with <strong style={{ color: SALMON }}>{email}</strong> exists,
                                    we've sent a reset link. It expires in 15 minutes.
                                </p>
                            </div>
                            <button style={styles.cta} onClick={() => navigate("/login")}>
                                Back to Sign In
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={styles.headWrap}>
                                <h1 style={styles.appName}>Forgot password?</h1>
                                <p style={styles.sub}>Enter your email and we'll send a reset link</p>
                            </div>

                            <form onSubmit={handleSubmit} style={styles.form}>
                                <div style={styles.fieldWrap}>
                                    <label style={styles.label}>Email</label>
                                    <input
                                        type="email"
                                        placeholder="student@university.edu"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                {error && <p style={styles.errorMsg}>{error}</p>}

                                <button
                                    type="submit"
                                    style={{ ...styles.cta, opacity: loading ? 0.6 : 1 }}
                                    disabled={loading}
                                >
                                    {loading ? "Sending…" : "Send Reset Link"}
                                </button>
                            </form>

                            <p style={styles.hint}>
                                Remember it?{" "}
                                <button onClick={() => navigate("/login")} style={styles.hintLink}>
                                    Sign in
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    root: {
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        fontFamily: "'DM Sans', system-ui, sans-serif",
    },
    left: {
        flex: "0 0 50%",
        minHeight: "100vh",
        backgroundImage: "url('/5.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
    },
    right: {
        flex: 1,
        background: "#1e1a1a",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "100px 40px 48px",
        minHeight: "100vh",
    },
    inner: {
        width: "100%",
        maxWidth: 400,
    },
    logoWrap: {
        display: "flex",
        justifyContent: "center",
        marginBottom: 24,
        cursor: "pointer",
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
    },
    headWrap: {
        textAlign: "center",
        marginBottom: 32,
    },
    appName: {
        fontFamily: "'Instrument Serif', serif",
        fontSize: 32,
        fontWeight: 400,
        color: SALMON,
        margin: "0 0 10px",
    },
    sub: {
        fontSize: 13,
        color: "rgba(255,255,255,0.45)",
        margin: 0,
        lineHeight: 1.6,
    },
    successBox: {
        display: "flex",
        flexDirection: "column",
        gap: 24,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        marginBottom: 20,
    },
    fieldWrap: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: 600,
        color: "rgba(255,255,255,0.5)",
        letterSpacing: "0.03em",
    },
    input: {
        width: "100%",
        padding: "11px 14px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        fontSize: 14,
        color: WHITE,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        outline: "none",
        boxSizing: "border-box",
    },
    errorMsg: {
        fontSize: 13,
        color: "#ff6b6b",
        textAlign: "center",
        margin: 0,
    },
    cta: {
        width: "100%",
        padding: "13px",
        background: SALMON,
        color: DARK,
        border: "none",
        borderRadius: 99,
        fontSize: 15,
        fontWeight: 700,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        cursor: "pointer",
        marginTop: 6,
        letterSpacing: "-0.01em",
    },
    hint: {
        textAlign: "center",
        fontSize: 13,
        color: "rgba(255,255,255,0.35)",
        margin: 0,
    },
    hintLink: {
        color: SALMON,
        fontWeight: 600,
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: 13,
        padding: 0,
        fontFamily: "'DM Sans', system-ui, sans-serif",
    },
};
