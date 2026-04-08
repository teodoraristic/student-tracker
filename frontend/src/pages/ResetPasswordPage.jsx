import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { resetPassword } from "../services/authService";
import useIsMobile from "../hooks/useIsMobile";
import { SALMON, WHITE, DARK } from "../utils/colors";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const isMobile = useIsMobile(860);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    if (!token) {
        return (
            <div style={styles.center}>
                <p style={{ color: "#ff6b6b", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                    Invalid reset link. Please request a new one.
                </p>
                <button style={styles.cta} onClick={() => navigate("/forgot-password")}>
                    Request new link
                </button>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        setLoading(true);
        try {
            await resetPassword(token, newPassword, confirmPassword);
            setDone(true);
        } catch (err) {
            const msg = err?.response?.data?.message;
            setError(msg || "Invalid or expired link. Please request a new one.");
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

                    {done ? (
                        <div>
                            <div style={styles.headWrap}>
                                <h1 style={styles.appName}>Password updated</h1>
                                <p style={styles.sub}>You can now sign in with your new password.</p>
                            </div>
                            <button style={styles.cta} onClick={() => navigate("/login")}>
                                Sign In
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={styles.headWrap}>
                                <h1 style={styles.appName}>New password</h1>
                                <p style={styles.sub}>Choose a strong password for your account</p>
                            </div>

                            <form onSubmit={handleSubmit} style={styles.form}>
                                <div style={styles.fieldWrap}>
                                    <label style={styles.label}>New password</label>
                                    <input
                                        type="password"
                                        placeholder="At least 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        style={styles.input}
                                        required
                                    />
                                </div>
                                <div style={styles.fieldWrap}>
                                    <label style={styles.label}>Confirm password</label>
                                    <input
                                        type="password"
                                        placeholder="Repeat your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    {loading ? "Saving…" : "Set New Password"}
                                </button>
                            </form>
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
    center: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 16,
        background: "#1e1a1a",
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
};
