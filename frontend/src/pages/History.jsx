import { useEffect, useState } from "react";
import { getHistory } from "../services/api";
import ClaimsTable from "../components/ClaimsTable";

export default function History() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [model, setModel] = useState("all");

  function load() {
    setLoading(true);
    setError("");
    getHistory()
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  const models = [...new Set(rows.map((r) => r.model))];
  const shown = rows.filter(
    (r) =>
      (status === "all" || (status === "fraud") === (r.label !== "Genuine")) &&
      (model === "all" || r.model === model)
  );

  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h2>Claim history</h2>
          <p className="muted">Every claim analyzed through this system. Click a row to see the claim details.</p>
        </div>
        <button className="btn ghost" onClick={load} disabled={loading}>Refresh</button>
      </div>

      <div className="filters">
        <label className="field">
          <span>Result</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="fraud">Potentially Fraudulent</option>
            <option value="genuine">Genuine</option>
          </select>
        </label>
        <label className="field">
          <span>Model</span>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="all">All</option>
            {models.map((m) => <option key={m}>{m}</option>)}
          </select>
        </label>
      </div>

      {error && <div className="alert error">{error}</div>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && !error && rows.length === 0 && (
        <p className="empty">No claims analyzed yet. Go to Fraud Detection and analyze one.</p>
      )}
      {!loading && rows.length > 0 && shown.length === 0 && <p className="empty">No claims match these filters.</p>}
      {shown.length > 0 && <ClaimsTable rows={shown} />}
    </section>
  );
}
