import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, Calendar, LayoutGrid, FlameKindling } from "lucide-react";

const navItems = [
  { path: "/home", label: "Home", icon: Home },
  { path: "/subjects", label: "Subjects", icon: BookOpen },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/planner", label: "Planner", icon: LayoutGrid },
  { path: "/study", label: "Study", icon: FlameKindling },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav style={styles.nav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.item,
              ...(isActive ? styles.itemActive : {}),
            }}
          >
            <Icon size={20} />
            <span style={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

const styles = {
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60px",
    background: "var(--surface-2)",
    borderTop: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    zIndex: 100,
    paddingBottom: "env(safe-area-inset-bottom)",
  },
  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
    flex: 1,
    padding: "6px 4px",
    textDecoration: "none",
    color: "var(--ink-3)",
  },
  itemActive: {
    color: "var(--rose-500)",
  },
  label: {
    fontSize: "10px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: "500",
  },
};
