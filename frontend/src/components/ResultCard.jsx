// Shows the prediction that came back from the backend.
export function pct(x) {
  return (x * 100).toFixed(1) + "%";
}

export default function ResultCard({ result }) {
  const fraud = result.prediction === 1;
  return (
    <section className={"card result " + (fraud ? "result-fraud" : "result-genuine")} aria-live="polite">
      <div className="result-head">
        <div className="result-icon">{fraud ? "!" : "✓"}</div>
        <div>
          <p className="muted small">Prediction · {result.model}</p>
          <h2>{result.label}</h2>
        </div>
        <span className={"badge risk-" + result.risk_level.toLowerCase()}>{result.risk_level} risk</span>
      </div>

      <div className="meter-row">
        <span>Fraud probability</span>
        <strong>{pct(result.fraud_probability)}</strong>
      </div>
      <div className="meter">
        <div className="meter-fill fraud" style={{ width: pct(result.fraud_probability) }} />
      </div>

      <div className="meter-row">
        <span>Genuine probability</span>
        <strong>{pct(result.genuine_probability)}</strong>
      </div>
      <div className="meter">
        <div className="meter-fill genuine" style={{ width: pct(result.genuine_probability) }} />
      </div>

      <p className="muted small">Risk level: Low under 30%, Medium 30–60%, High 60% or more fraud probability.</p>
    </section>
  );
}
