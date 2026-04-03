import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../services/authService";
import { BookOpen } from "lucide-react";
import useIsMobile from "../hooks/useIsMobile";
import { SALMON, WHITE, DARK } from "../utils/colors";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { FormField } from "../components/ui/FormField";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const isMobile = useIsMobile(860);
    const { handleError } = useErrorHandler();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await loginService(email, password);
            await login(data);
            navigate("/home");
        } catch (err) {
            const userMessage = handleError(err, 'LoginPage');
            setError(userMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ ...styles.root, flexDirection: isMobile ? "column" : "row" }}>

            {/* ── LEFT: illustration panel ── */}
            {!isMobile && (
                <div style={styles.left} />
            )}

            {/* ── RIGHT: dark form panel ── */}
            <div style={styles.right}>
                <div style={styles.inner}>

                    {/* Logo */}
                    <div style={styles.logoWrap} onClick={() => navigate("/")}>
                        <div style={styles.logoMark}>
                            <BookOpen size={18} color={SALMON} strokeWidth={2.2} />
                        </div>
                    </div>

                    {/* Heading */}
                    <div style={styles.headWrap}>
                        <p style={styles.welcomeText}>Welcome to</p>
                        <h1 style={styles.appName}>SemesterOS</h1>
                        <p style={styles.sub}>Sign in to continue planning</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} style={styles.form}>
                        <FormField
                            label="Email"
                            type="email"
                            placeholder="student@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            labelStyle={styles.fieldLabel}
                            inputStyle={styles.fieldInput}
                            errorStyle={styles.fieldError}
                            required
                        />

                        <FormField
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            labelStyle={styles.fieldLabel}
                            inputStyle={styles.fieldInput}
                            errorStyle={styles.fieldError}
                            required
                        />

                        {error && <p style={styles.errorMsg}>{error}</p>}

                        <button
                            type="submit"
                            style={{ ...styles.cta, opacity: loading ? 0.6 : 1 }}
                            disabled={loading}
                        >
                            {loading ? "Signing in…" : "Get Started"}
                        </button>
                    </form>

                    <p style={styles.hint}>
                        Don't have an account?{" "}
                        <button onClick={() => navigate("/register")} style={styles.hintLink}>
                            Create one free
                        </button>
                    </p>
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

    /* ── LEFT ── */
    left: {
        flex: "0 0 50%",
        minHeight: "100vh",
        backgroundImage: "url('/5.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
    },

    /* ── RIGHT ── */
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

    /* logo */
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

    /* heading */
    headWrap: {
        textAlign: "center",
        marginBottom: 32,
    },
    welcomeText: {
        fontSize: 16,
        color: "rgba(255,255,255,0.55)",
        margin: "0 0 4px",
        fontWeight: 400,
    },
    appName: {
        fontFamily: "'Instrument Serif', serif",
        fontSize: 36,
        fontWeight: 400,
        color: SALMON,
        margin: "0 0 10px",
    },
    sub: {
        fontSize: 13,
        color: "rgba(255,255,255,0.35)",
        margin: 0,
    },

    /* form */
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: 600,
        color: "rgba(255,255,255,0.5)",
        letterSpacing: "0.03em",
    },
    fieldInput: {
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
        transition: "border-color 0.15s",
    },
    fieldError: {
        fontSize: 11,
        color: "#ff6b6b",
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
