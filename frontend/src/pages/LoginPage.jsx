import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../services/authService";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const data = await loginService(email, password);

            await login(data.token);
            console.log("Navigating to /home");

            navigate("/home");
        } catch (err) {
            console.error("Login error:", err);
            setError("Login failed. Check your credentials.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                {/* Logo/Icon */}
                <div style={styles.logoContainer}>
                    <div style={styles.logo}>
                        <svg 
                            width="40" 
                            height="40" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="white" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                </div>

                {/* App Title */}
                <div style={styles.header}>
                    <h1 style={styles.title}>Welcome Back</h1>
                    <p style={styles.subtitle}>
                        Sign in to continue managing your tasks
                    </p>
                </div>

                {/* Login Card */}
                <div style={styles.card}>
                    <form onSubmit={handleLogin} style={styles.form}>
                        <Input
                            label="Email"
                            type="email"
                            placeholder="student@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {error && <p style={styles.error}>{error}</p>}

                        <div style={{ paddingTop: '8px' }}>
                            <Button
                                type="submit"
                                variant="primary"
                                style={{ width: '100%' }}
                            >
                                Login
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Register Link */}
                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Don't have an account?{" "}
                        <button
                            onClick={() => navigate("/register")}
                            style={styles.link}
                        >
                            Register
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        padding: "24px",
    },
    content: {
        width: "100%",
        maxWidth: "448px",
    },
    logoContainer: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "32px",
    },
    logo: {
        width: "80px",
        height: "80px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(244, 63, 94, 0.2)",
    },
    header: {
        textAlign: "center",
        marginBottom: "48px",
    },
    title: {
        fontSize: "28px",
        fontWeight: "600",
        color: "#171717",
        marginBottom: "8px",
        fontFamily: "-apple-system, 'SF Pro Display', Inter, system-ui, sans-serif",
    },
    subtitle: {
        fontSize: "14px",
        color: "#737373",
        fontFamily: "-apple-system, 'SF Pro Display', Inter, system-ui, sans-serif",
    },
    card: {
        backgroundColor: "#fafafa",
        padding: "32px",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        border: "1px solid #f5f5f5",
        marginBottom: "24px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    error: {
        color: "#ef4444",
        fontSize: "14px",
        textAlign: "center",
        margin: "0",
        fontFamily: "-apple-system, 'SF Pro Display', Inter, system-ui, sans-serif",
    },
    footer: {
        textAlign: "center",
    },
    footerText: {
        fontSize: "14px",
        color: "#737373",
        fontFamily: "-apple-system, 'SF Pro Display', Inter, system-ui, sans-serif",
    },
    link: {
        color: "#f43f5e",
        textDecoration: "none",
        fontWeight: "500",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontFamily: "-apple-system, 'SF Pro Display', Inter, system-ui, sans-serif",
        padding: "0",
    },
};