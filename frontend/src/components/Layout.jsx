// Sidebar + top bar. The sidebar buttons change which page is shown.
export const PAGES = [
  { id: "dashboard", label: "Dashboard", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
  { id: "detect", label: "Fraud Detection", icon: "M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3zm-1 14-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6z" },
  { id: "visuals", label: "Model Visualizations", icon: "M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z" },
  { id: "compare", label: "Model Comparison", icon: "M10 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h6V3zm10 0h-6v18h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z" },
  { id: "history", label: "Claim History", icon: "M13 3a9 9 0 0 0-9 9H1l4 4 4-4H6a7 7 0 1 1 2.1 5l-1.4 1.4A9 9 0 1 0 13 3zm-1 5v5l4.3 2.5.8-1.3-3.5-2V8H12z" },
];

function Icon({ path }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark">
        <Icon path={PAGES[1].icon} />
      </span>
      <span className="logo-text">FraudGuard</span>
    </div>
  );
}

export function Sidebar({ page, onNavigate, open, onClose }) {
  return (
    <>
      <aside className={"sidebar" + (open ? " open" : "")}>
        <Logo />
        <nav>
          {PAGES.map((p) => (
            <button
              key={p.id}
              className={"nav-item" + (page === p.id ? " active" : "")}
              onClick={() => {
                onNavigate(p.id);
                onClose();
              }}
            >
              <Icon path={p.icon} />
              {p.label}
            </button>
          ))}
        </nav>
        <p className="sidebar-foot">Insurance claim fraud detection · ML powered</p>
      </aside>
      {open && <div className="backdrop" onClick={onClose} />}
    </>
  );
}

export function Topbar({ title, onMenu }) {
  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onMenu} aria-label="Open menu">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
        </svg>
      </button>
      <div>
        <div className="topbar-app">FraudGuard</div>
        <h1 className="topbar-title">{title}</h1>
      </div>
    </header>
  );
}
