import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register as registerService } from "../services/authService";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccess("");

        const newErrors = {};
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await registerService(formData.email, formData.password, formData.firstName, formData.lastName);
            setSuccess("Registration successful! Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setErrors({ general: "Registration failed. Email might be taken." });
            console.error(err);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                {/* Logo */}
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

                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.title}>Create Account</h1>
                    <p style={styles.subtitle}>
                        Get started with your assignment management journey
                    </p>
                </div>

                {/* Register Card */}
                <div style={styles.card}>
                    <form onSubmit={handleRegister} style={styles.form}>
                        <Input
                            label="First Name"
                            type="text"
                            name="firstName"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Last Name"
                            type="text"
                            name="lastName"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            placeholder="student@university.edu"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            required
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            required
                        />

                        {errors.general && (
                            <p style={styles.error}>{errors.general}</p>
                        )}

                        {success && (
                            <p style={styles.success}>{success}</p>
                        )}

                        <div style={{ paddingTop: '8px' }}>
                            <Button
                                type="submit"
                                variant="primary"
                                style={{ width: '100%' }}
                            >
                                Create Account
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Login Link */}
                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Already have an account?{" "}
                        <button
                            onClick={() => navigate("/login")}
                            style={styles.link}
                        >
                            Login
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
        flex: 1,
        background: "var(--surface-3)",
        padding: "24px",
    },
    content: {
        width: "100%",
        maxWidth: "400px",
    },
    logoContainer: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "28px",
    },
    logo: {
        width: "64px",
        height: "64px",
        borderRadius: "var(--r-lg)",
        background: "linear-gradient(135deg, var(--rose-300) 0%, var(--rose-400) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 14px rgba(244, 96, 126, 0.3)",
    },
    header: {
        textAlign: "center",
        marginBottom: "32px",
    },
    title: {
        fontFamily: "'Instrument Serif', serif",
        fontSize: "28px",
        fontWeight: "400",
        color: "var(--ink)",
        marginBottom: "6px",
    },
    subtitle: {
        fontSize: "13px",
        color: "var(--ink-3)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
    },
    card: {
        background: "var(--surface)",
        padding: "28px",
        borderRadius: "var(--r-xl)",
        boxShadow: "0 2px 12px rgba(26,21,35,0.06)",
        border: "1px solid var(--border)",
        marginBottom: "20px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    error: {
        color: "var(--color-overdue)",
        fontSize: "13px",
        textAlign: "center",
        margin: "0",
        fontFamily: "'DM Sans', system-ui, sans-serif",
    },
    success: {
        color: "var(--color-done)",
        fontSize: "13px",
        textAlign: "center",
        margin: "0",
        fontFamily: "'DM Sans', system-ui, sans-serif",
    },
    footer: {
        textAlign: "center",
    },
    footerText: {
        fontSize: "13px",
        color: "var(--ink-3)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
    },
    link: {
        color: "var(--rose-400)",
        fontWeight: "500",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: "13px",
        padding: "0",
    },
};