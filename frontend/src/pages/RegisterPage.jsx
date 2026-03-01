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
    success: {
        color: "#10b981",
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
    },
};