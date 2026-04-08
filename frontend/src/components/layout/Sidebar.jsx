import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, Calendar, LayoutGrid, LogOut, FlameKindling } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { SALMON, WHITE } from "../../utils/colors";

const navItems = [
  { path: "/home",     label: "Home",       icon: Home },
  { path: "/subjects", label: "Subjects",   icon: BookOpen },
  { path: "/calendar", label: "Calendar",   icon: Calendar },
  { path: "/planner",  label: "Planner",    icon: LayoutGrid },
  { path: "/study",    label: "Study Room", icon: FlameKindling },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => { logout(); navigate("/login"); };

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : (user?.email?.[0] || "S").toUpperCase();

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : "Student";

  return (
    <div style={styles.sidebar}>
      {/* Brand */}
      <div style={styles.brand}>
        <img src="/logo.png" alt="SemesterOS" style={styles.logoImg} />
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} style={{ ...(active ? styles.navActive : styles.navItem) }}>
              <Icon size={16} color={active ? SALMON : "rgba(255,255,255,0.38)"} strokeWidth={active ? 2.2 : 1.8} />
              <span style={{ color: active ? WHITE : "rgba(255,255,255,0.45)" }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={styles.bottom}>
        <Link
          to="/profile"
          style={{ ...(location.pathname === "/profile" ? styles.userRowActive : styles.userRow) }}
        >
          <div style={styles.avatar}>
            <span style={styles.initials}>{initials}</span>
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{displayName}</span>
            <span style={styles.userEmail}>{user?.email || ""}</span>
          </div>
        </Link>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={14} color="rgba(255,255,255,0.35)" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    background: "#151515",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    padding: "20px 10px",
    flexShrink: 0,
  },
  brand: {
    paddingLeft: 8,
    paddingBottom: 20,
    marginBottom: 16,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  logoImg: {
    height: 36,
    width: "auto",
    objectFit: "contain",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    fontSize: 14,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 400,
    transition: "background 0.15s",
  },
  navActive: {
    background: "rgba(244,149,133,0.1)",
    fontWeight: 500,
  },
  bottom: {
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: 14,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    borderRadius: 10,
    transition: "background 0.15s",
  },
  userRowActive: {
    background: "rgba(244,149,133,0.08)",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "rgba(244,149,133,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  initials: {
    fontSize: 11,
    fontWeight: 700,
    color: SALMON,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(255,255,255,0.85)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userEmail: {
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 10,
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "rgba(255,255,255,0.35)",
    fontSize: 13,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    cursor: "pointer",
    transition: "all 0.15s",
  },
};
