import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  LineChart, Line,
} from "recharts";
import MetricsGate from "../components/MetricsGate";
import MetricsBarChart from "../components/MetricsBarChart";
import { MODEL_COLORS, pct } from "../data/metrics";

const nice = (name) => name.replaceAll("_", " ");

function Chart({ height = 300, children }) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>{children}</ResponsiveContainer>
    </div>
  );
}

// ---- Confusion matrix: a 2x2 grid of real counts ----
function ConfusionMatrix({ model }) {
  const c = model.confusion_matrix;
  const cells = [
    { k: "tn", name: "True Negative", note: "genuine, passed", cls: "ok" },
    { k: "fp", name: "False Positive", note: "genuine, flagged", cls: "miss" },
    { k: "fn", name: "False Negative", note: "fraud, missed", cls: "miss" },
    { k: "tp", name: "True Positive", note: "fraud, caught", cls: "ok" },
  ];
  return (
    <div className="cm">
      <h4>{model.name}</h4>
      <div className="cm-grid">
        <span className="cm-axis" />
        <span className="cm-axis">Predicted Genuine</span>
        <span className="cm-axis">Predicted Fraud</span>
        <span className="cm-axis side">Actual Genuine</span>
        {cells.slice(0, 2).map((x) => <div key={x.k} className={"cm-cell " + x.cls}><strong>{c[x.k].toLocaleString()}</strong><small>{x.name}</small></div>)}
        <span className="cm-axis side">Actual Fraud</span>
        {cells.slice(2).map((x) => <div key={x.k} className={"cm-cell " + x.cls}><strong>{c[x.k].toLocaleString()}</strong><small>{x.name}</small></div>)}
      </div>
      <p className="muted small">Caught {c.tp} of {c.tp + c.fn} frauds · {c.fp.toLocaleString()} genuine claims wrongly flagged</p>
    </div>
  );
}

function FraudDistribution({ rows }) {
  return (
    <Chart height={300}>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f2" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => v.toLocaleString()} />
        <Legend />
        <Bar isAnimationActive={false} dataKey="genuine" name="Genuine" fill="#12935a" radius={[4, 4, 0, 0]} />
        <Bar isAnimationActive={false} dataKey="fraud" name="Fraud" fill="#d92d3f" radius={[4, 4, 0, 0]} />
      </BarChart>
    </Chart>
  );
}

function RocSection({ data }) {
  const curves = data.roc_curves;
  if (curves) {
    return (
      <Chart height={360}>
        <LineChart margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f2" />
          <XAxis type="number" dataKey="fpr" domain={[0, 1]} tick={{ fontSize: 12 }} label={{ value: "False positive rate", position: "insideBottom", offset: -8, fontSize: 12 }} />
          <YAxis type="number" dataKey="tpr" domain={[0, 1]} tick={{ fontSize: 12 }} label={{ value: "True positive rate", angle: -90, position: "insideLeft", fontSize: 12 }} />
          <Tooltip formatter={(v) => v.toFixed(3)} />
          <Legend verticalAlign="top" />
          <Line isAnimationActive={false} data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]} dataKey="tpr" name="Random guess" stroke="#9aa6c0" strokeDasharray="5 5" dot={false} />
          {data.models.map((m) => (
            <Line isAnimationActive={false} key={m.name} data={curves[m.name]} dataKey="tpr" name={`${m.name} (AUC ${m.roc_auc.toFixed(3)})`}
              stroke={MODEL_COLORS[m.name]} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </Chart>
    );
  }
  // No curve points are stored, but the AUC value of each model is known.
  const rows = data.models.map((m) => ({ name: m.name, auc: +(m.roc_auc * 100).toFixed(2) }));
  return (
    <>
      <div className="alert info">
        <strong>ROC curves are not available yet.</strong> Drawing a curve needs each model's probabilities on the test set, and the dataset
        is not part of this project. The ROC-AUC value of every model is available and shown below. To add the real curves, follow the steps at
        the top of <code>backend/export_roc.py</code>.
      </div>
      <Chart height={260}>
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f2" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
          <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => v.toFixed(2) + "%"} />
          <Bar isAnimationActive={false} dataKey="auc" name="ROC-AUC" radius={[4, 4, 0, 0]}>
            {rows.map((r) => <Cell key={r.name} fill={MODEL_COLORS[r.name]} />)}
          </Bar>
        </BarChart>
      </Chart>
    </>
  );
}

function ImportanceChart({ rows, signed }) {
  const data = rows.map((r) => ({ feature: nice(r.feature), value: +r.value.toFixed(4) }));
  return (
    <Chart height={340}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f2" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="feature" width={150} tick={{ fontSize: 11 }} interval={0} />
        <Tooltip />
        <Bar isAnimationActive={false} dataKey="value" name={signed ? "Coefficient" : "Importance"} radius={[0, 4, 4, 0]}>
          {data.map((d) => <Cell key={d.feature} fill={signed ? (d.value > 0 ? "#d92d3f" : "#12935a") : "#2f6bff"} />)}
        </Bar>
      </BarChart>
    </Chart>
  );
}

export default function Visualizations() {
  return (
    <MetricsGate>
      {(data) => (
        <>
          <section className="card">
            <h3>Fraud distribution</h3>
            <p className="muted small">Only about 6% of claims are fraud. SMOTE balances the <em>training</em> data; the test set stays realistic.</p>
            <FraudDistribution rows={data.fraud_distribution} />
          </section>

          <section className="card">
            <h3>Confusion matrices</h3>
            <p className="muted small">Measured on the test set ({data.test_set.rows.toLocaleString()} claims). Fraud is the "positive" class. Green cells are correct decisions, red cells are mistakes.</p>
            <div className="cm-wrap">
              {data.models.map((m) => <ConfusionMatrix key={m.name} model={m} />)}
            </div>
          </section>

          <section className="card">
            <h3>Performance metrics</h3>
            <p className="muted small">Accuracy can look excellent while frauds are missed, so compare recall, precision and F1 too.</p>
            <MetricsBarChart models={data.models} />
          </section>

          <section className="card">
            <h3>ROC curve and AUC</h3>
            <RocSection data={data} />
          </section>

          <div className="two-col">
            <section className="card">
              <h3>Feature importance: Random Forest</h3>
              <p className="muted small">Top 10 features by importance (read from the saved model).</p>
              <ImportanceChart rows={data.feature_importance.random_forest} />
            </section>
            <section className="card">
              <h3>Feature influence: Logistic Regression</h3>
              <p className="muted small">Top 10 coefficients on scaled inputs. Red pushes toward fraud, green toward genuine.</p>
              <ImportanceChart rows={data.feature_importance.logistic_regression} signed />
            </section>
          </div>
          <p className="note">
            KNN and SVM (with the default RBF kernel) do not provide feature importances, so none are shown for them.
            Largest Random Forest importance: {pct(data.feature_importance.random_forest[0].value)} ({nice(data.feature_importance.random_forest[0].feature)}).
          </p>
        </>
      )}
    </MetricsGate>
  );
}
