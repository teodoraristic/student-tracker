import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, Calendar, LayoutGrid, LogOut, User, FlameKindling } from "lucide-react";
import { useAuth } from "../../auth/useAuth";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/subjects", label: "Subjects", icon: BookOpen },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/planner", label: "Planner", icon: LayoutGrid },
    { path: "/study", label: "Study Room", icon: FlameKindling },
  ];

  return (
    <div style={styles.sidebar}>
      {/* Logo/Brand */}
      <div style={styles.brand}>
        <div style={styles.logo}>
          <BookOpen size={24} color="#f43f5e" />
        </div>
        <h2 style={styles.brandText}>StudentTracker</h2>
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
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div style={styles.bottomSection}>
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            <User size={18} />
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : "Student"}
            </div>
            <div style={styles.userEmail}>{user?.email || ""}</div>
          </div>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    background: "#fafafa",
    borderRight: "1px solid #e5e5e5",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    padding: "20px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "32px",
    paddingBottom: "20px",
    borderBottom: "1px solid #e5e5e5",
  },
  logo: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #fff5f7 0%, #ffe4e9 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#171717",
    margin: 0,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    borderRadius: "10px",
    color: "#737373",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  navItemActive: {
    background: "#ffffff",
    color: "#f43f5e",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  bottomSection: {
    marginTop: "auto",
    paddingTop: "20px",
    borderTop: "1px solid #e5e5e5",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    borderRadius: "10px",
    background: "#ffffff",
  },
  userAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#171717",
  },
  userEmail: {
    fontSize: "12px",
    color: "#737373",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    borderRadius: "10px",
    background: "transparent",
    border: "1px solid #e5e5e5",
    color: "#737373",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};
