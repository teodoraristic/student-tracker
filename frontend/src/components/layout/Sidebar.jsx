import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, Calendar, LayoutGrid, LogOut, User, FlameKindling, Moon, Sun } from "lucide-react";
import { useAuth } from "../../auth/useAuth";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);
    return saved === "dark";
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    const theme = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  const navItems = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/subjects", label: "Subjects", icon: BookOpen },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/planner", label: "Planner", icon: LayoutGrid },
    { path: "/study", label: "Study Room", icon: FlameKindling },
  ];

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : (user?.email?.[0] || "S").toUpperCase();

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : "Student";

  return (
    <div style={styles.sidebar}>
      {/* Logo/Brand */}
      <div style={styles.brand}>
        <img src="/logo.png" alt="SemesterOS" style={styles.logoImg} />
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div style={styles.bottomSection}>
        <Link
          to="/profile"
          style={{
            ...styles.userSection,
            textDecoration: "none",
            cursor: "pointer",
            ...(location.pathname === "/profile" ? styles.userSectionActive : {}),
          }}
        >
          <div style={styles.userAvatar}>
            <span style={styles.userInitials}>{initials}</span>
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{displayName}</div>
            <div style={styles.userEmail}>{user?.email || ""}</div>
          </div>
        </Link>

        <div style={styles.bottomActions}>
          <button onClick={toggleDark} style={styles.darkModeBtn} title="Toggle dark mode">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    background: "var(--surface-2)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    padding: "20px 12px",
    flexShrink: 0,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0",
    marginBottom: "28px",
    paddingLeft: "10px",
    paddingBottom: "20px",
    borderBottom: "1px solid var(--border)",
  },
  logoImg: {
    height: "28px",
    width: "auto",
    objectFit: "contain",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 14px",
    borderRadius: "var(--r-md)",
    color: "var(--ink-3)",
    textDecoration: "none",
    fontSize: "15px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: "400",
    transition: "all 0.15s ease",
    cursor: "pointer",
  },
  navItemActive: {
    background: "var(--rose-50)",
    color: "var(--rose-500)",
    fontWeight: "500",
  },
  bottomSection: {
    marginTop: "auto",
    paddingTop: "16px",
    borderTop: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 10px",
    borderRadius: "var(--r-md)",
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  userSectionActive: {
    background: "var(--rose-50)",
  },
  userAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "var(--rose-50)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userInitials: {
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--rose-500)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    minWidth: 0,
  },
  userName: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--ink)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userEmail: {
    fontSize: "11px",
    color: "var(--ink-3)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  bottomActions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  darkModeBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-sm)",
    color: "var(--ink-3)",
    cursor: "pointer",
    flexShrink: 0,
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    flex: 1,
    borderRadius: "var(--r-sm)",
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--ink-3)",
    fontSize: "13px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
};
