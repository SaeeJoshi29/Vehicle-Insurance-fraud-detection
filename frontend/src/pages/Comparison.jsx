import MetricsGate from "../components/MetricsGate";
import MetricsBarChart from "../components/MetricsBarChart";
import { METRICS, MODEL_COLORS, bestModels, pct } from "../data/metrics";

function ScoreCards({ models, best }) {
  return (
    <div className="score-grid">
      {models.map((m) => (
        <section className="card score-card" key={m.name} style={{ borderTopColor: MODEL_COLORS[m.name] }}>
          <h3>{m.name}</h3>
          <ul>
            {METRICS.map((metric) => {
              const leads = best[metric.key].includes(m.name);
              return (
                <li key={metric.key} className={leads ? "leader" : ""}>
                  <span>{metric.label}</span>
                  <strong>
                    {pct(m[metric.key])}
                    {leads && <em className="crown" title={"Best " + metric.label}>★ Best</em>}
                  </strong>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ComparisonTable({ models, best }) {
  return (
    <div className="table-wrap">
      <table className="compare-table">
        <thead>
          <tr>
            <th>Metric</th>
            {models.map((m) => <th key={m.name}>{m.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {METRICS.map((metric) => (
            <tr key={metric.key}>
              <td><strong>{metric.label}</strong></td>
              {models.map((m) => (
                <td key={m.name} className={best[metric.key].includes(m.name) ? "best-cell" : ""}>
                  {pct(m[metric.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Comparison() {
  return (
    <MetricsGate>
      {(data) => {
        const models = data.models;
        const best = bestModels(models);
        const byName = (n) => models.find((m) => m.name === n);
        const rf = byName("Random Forest");
        const lr = byName("Logistic Regression");
        return (
          <>
            <section className="card">
              <h2>Model scores</h2>
              <p className="muted">
                All four models were evaluated on the same untouched test set of {data.test_set.rows.toLocaleString()} claims
                ({data.test_set.fraud} fraudulent, {data.test_set.genuine.toLocaleString()} genuine). The <span className="best-cell inline">★ highlighted</span> score is the best in each metric.
              </p>
            </section>

            <ScoreCards models={models} best={best} />

            <section className="card">
              <h3>Side-by-side comparison</h3>
              <ComparisonTable models={models} best={best} />
            </section>

            <section className="card">
              <h3>Metrics by model</h3>
              <MetricsBarChart models={models} />
            </section>

            <section className="card insight">
              <h3>Which model is best?</h3>
              <p>
                It depends on the metric and on what matters for your project. Fraud is rare (about 6% of claims), so accuracy alone is misleading:
                {" "}<strong>Random Forest</strong> has the highest accuracy ({pct(rf.accuracy)}) and perfect precision, but its recall is only {pct(rf.recall)}.
                It caught {rf.confusion_matrix.tp} of {rf.confusion_matrix.tp + rf.confusion_matrix.fn} frauds, so it is almost the same as always answering "Genuine".
              </p>
              <p>
                If the priority is <strong>catching as many frauds as possible</strong>, <strong>{best.recall.join(", ")}</strong> leads on recall ({pct(lr.recall)})
                and F1-score ({pct(lr.f1)}), but with low precision ({pct(lr.precision)}) it also flags many honest claims for review.
                For ranking claims by risk, <strong>{best.roc_auc.join(", ")}</strong> has the best ROC-AUC.
              </p>
              <p className="muted small">
                Notes: models were trained on SMOTE-balanced data, scores use the default 0.5 threshold, and precision/recall refer to the fraud class.
              </p>
            </section>
          </>
        );
      }}
    </MetricsGate>
  );
}
