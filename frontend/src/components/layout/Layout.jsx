import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          padding: "24px",
          backgroundColor: "#f8f8f8",
          overflowY: "auto"
        }}
      >
        <Outlet />
      </main>

    </div>
  );
}
