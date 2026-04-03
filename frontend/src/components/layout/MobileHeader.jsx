import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { SALMON } from "../../utils/colors";

export default function MobileHeader() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => { logout(); navigate("/login"); };

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : (user?.email?.[0] || "S").toUpperCase();

  return (
    <header style={s.header}>
      <Link to="/home" style={{ display: "flex", alignItems: "center" }}>
        <img src="/logo.png" alt="SemesterOS" style={s.logo} />
      </Link>
      <div style={s.actions}>
        <button onClick={handleLogout} style={s.iconBtn} title="Logout">
          <LogOut size={17} color="rgba(255,255,255,0.4)" />
        </button>
        <Link to="/profile" style={s.avatar}>
          <span style={s.initials}>{initials}</span>
        </Link>
      </div>
    </header>
  );
}

const s = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 99,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    background: "#151515",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  logo: {
    height: 30,
    width: "auto",
    objectFit: "contain",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 8,
    cursor: "pointer",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(244,149,133,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
  },
  initials: {
    fontSize: 11,
    fontWeight: 700,
    color: SALMON,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
};
