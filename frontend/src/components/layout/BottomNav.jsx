import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Calendar, LayoutGrid, FlameKindling } from "lucide-react";
import { SALMON } from "../../utils/colors";

const navItems = [
  { path: "/home",     label: "Home",     icon: Home },
  { path: "/subjects", label: "Subjects", icon: BookOpen },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/planner",  label: "Planner",  icon: LayoutGrid },
  { path: "/study",    label: "Study",    icon: FlameKindling },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav style={s.nav}>
      {navItems.map(({ path, label, icon: Icon }) => {
        const active = location.pathname === path;
        return (
          <Link key={path} to={path} style={{ ...s.item, ...(active ? s.itemActive : {}) }}>
            <Icon size={20} color={active ? SALMON : "rgba(255,255,255,0.35)"} strokeWidth={active ? 2.2 : 1.6} />
            <span style={{ ...s.label, color: active ? SALMON : "rgba(255,255,255,0.35)" }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

const s = {
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60px",
    background: "#151515",
    borderTop: "1px solid rgba(255,255,255,0.06)",
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
    gap: 3,
    flex: 1,
    padding: "6px 4px",
    textDecoration: "none",
  },
  itemActive: {},
  label: {
    fontSize: 10,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 500,
  },
};
