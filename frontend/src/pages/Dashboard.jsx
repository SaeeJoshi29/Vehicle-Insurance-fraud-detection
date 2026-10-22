import { useEffect, useState } from "react";
import { getHistory } from "../services/api";
import ClaimsTable from "../components/ClaimsTable";

// The backend has no "stats" endpoint, so these numbers are counted here
// from the real /history data (claims analyzed through this app).
function Stat({ label, value, tone }) {
  return (
    <div className={"card stat " + (tone || "")}>
      <p className="muted small">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}

function BarChart({ title, data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <section className="card">
      <h3>{title}</h3>
      <div className="bars">
        {data.map((d) => (
          <div className="bar-row" key={d.label}>
            <span className="bar-label">{d.label}</span>
            <div className="bar-track">
              <div className={"bar-fill " + d.tone} style={{ width: (d.value / max) * 100 + "%" }} />
            </div>
            <strong>{d.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Dashboard({ onNavigate }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getHistory().then(setRows).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!rows) return <p className="muted">Loading…</p>;

  const total = rows.length;
  const frauds = rows.filter((r) => r.label !== "Genuine").length;
  const rate = total ? ((frauds / total) * 100).toFixed(1) + "%" : "–";
  const count = (fn) => rows.filter(fn).length;
  const models = [...new Set(rows.map((r) => r.model))];

  return (
    <>
      <div className="stats">
        <Stat label="Claims analyzed" value={total} />
        <Stat label="Potentially fraudulent" value={frauds} tone="bad" />
        <Stat label="Genuine" value={total - frauds} tone="good" />
        <Stat label="Fraud rate" value={rate} />
      </div>

      {total === 0 ? (
        <section className="card">
          <p className="empty">No claims analyzed yet, so there is nothing to chart.</p>
          <div className="center"><button className="btn primary" onClick={() => onNavigate("detect")}>Analyze your first claim</button></div>
        </section>
      ) : (
        <div className="two-col">
          <BarChart title="Predictions by risk level" data={[
            { label: "Low", value: count((r) => r.risk_level === "Low"), tone: "genuine" },
            { label: "Medium", value: count((r) => r.risk_level === "Medium"), tone: "warn" },
            { label: "High", value: count((r) => r.risk_level === "High"), tone: "fraud" },
          ]} />
          <BarChart title="Frauds flagged by model" data={models.map((m) => ({
            label: m, value: count((r) => r.model === m && r.label !== "Genuine"), tone: "accent",
          }))} />
        </div>
      )}

      {total > 0 && (
        <section className="card">
          <div className="card-head">
            <h3>Recent claims</h3>
            <button className="btn ghost" onClick={() => onNavigate("history")}>View all</button>
          </div>
          <ClaimsTable rows={rows.slice(0, 5)} showDetails={false} />
        </section>
      )}

      <p className="note">
        These figures count claims analyzed through this app (from the <code>/history</code> endpoint). Dataset-wide
        analytics would need an extra backend endpoint such as <code>/stats</code>.
      </p>
    </>
  );
}
