import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import MobileHeader from "./MobileHeader";
import useIsMobile from "../../hooks/useIsMobile";

export default function Layout() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%" }}>
        <MobileHeader />
        <main style={{
          flex: 1,
          padding: "16px",
          paddingBottom: "76px",
          background: "#0f0f0f",
          overflowY: "auto",
        }}>
          <Outlet />
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      <Sidebar />
      <main style={{
        flex: 1,
        padding: "28px 32px",
        background: "#0f0f0f",
        overflowY: "auto",
      }}>
        <Outlet />
      </main>
    </div>
  );
}
