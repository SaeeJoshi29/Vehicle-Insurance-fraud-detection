import { useState } from "react";
import { Sidebar, Topbar, PAGES } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Detect from "./pages/Detect";
import History from "./pages/History";
import Visualizations from "./pages/Visualizations";
import Comparison from "./pages/Comparison";
import "./styles/app.css";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const title = PAGES.find((p) => p.id === page).label;

  return (
    <div className="app">
      <Sidebar page={page} onNavigate={setPage} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main">
        <Topbar title={title} onMenu={() => setMenuOpen(true)} />
        <main className="content">
          {/* key makes each page reload its data when you navigate back to it */}
          {page === "dashboard" && <Dashboard key="d" onNavigate={setPage} />}
          {page === "detect" && <Detect />}
          {page === "visuals" && <Visualizations />}
          {page === "compare" && <Comparison />}
          {page === "history" && <History key="h" />}
        </main>
      </div>
    </div>
  );
}
