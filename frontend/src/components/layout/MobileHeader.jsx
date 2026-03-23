import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun, LogOut } from "lucide-react";
import { useAuth } from "../../auth/useAuth";

export default function MobileHeader() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);
    return saved === "dark";
  });

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    const theme = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : (user?.email?.[0] || "S").toUpperCase();

  return (
    <header style={styles.header}>
      <img src="/logo.png" alt="SemesterOS" style={styles.logo} />
      <div style={styles.actions}>
        <button onClick={toggleDark} style={styles.iconBtn} title="Toggle dark mode">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button onClick={handleLogout} style={styles.iconBtn} title="Logout">
          <LogOut size={18} />
        </button>
        <Link to="/profile" style={styles.avatar}>
          <span style={styles.initials}>{initials}</span>
        </Link>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 99,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    background: "var(--surface-2)",
    borderBottom: "1px solid var(--border)",
  },
  logo: {
    height: "32px",
    width: "auto",
    objectFit: "contain",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  iconBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    color: "var(--ink-3)",
    cursor: "pointer",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "var(--rose-50)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
  },
  initials: {
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--rose-500)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
};
