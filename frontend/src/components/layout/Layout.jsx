import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      
      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          padding: "24px",
          background: "var(--surface-3)",
          overflowY: "auto"
        }}
      >
        <Outlet />
      </main>

    </div>
  );
}
