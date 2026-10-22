import { useEffect, useState } from "react";
import { getMetrics } from "../services/api";

// Loads the evaluation scores from the backend and hands them to the page.
export default function MetricsGate({ children }) {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMetrics().then(setMetrics).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!metrics) return <p className="muted">Loading model results…</p>;
  return children(metrics);
}
