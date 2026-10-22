// Helpers shared by the Model Visualizations and Model Comparison pages.

// One fixed color per model so every chart matches. (Red/green are kept for fraud/genuine.)
export const MODEL_COLORS = {
  "Logistic Regression": "#2f6bff",
  KNN: "#12a4b8",
  "Random Forest": "#e8a317",
  SVM: "#8b5cf6",
};

export const METRICS = [
  { key: "accuracy", label: "Accuracy" },
  { key: "precision", label: "Precision" },
  { key: "recall", label: "Recall" },
  { key: "f1", label: "F1-score" },
  { key: "roc_auc", label: "ROC-AUC" },
];

// 0.7946 -> "79.46%".  Missing value -> "Not available" (never invented).
export function pct(value) {
  if (value === null || value === undefined) return "Not available";
  return (value * 100).toFixed(2) + "%";
}

// For each metric, the names of the model(s) with the highest score.
export function bestModels(models) {
  const best = {};
  for (const m of METRICS) {
    const scores = models.filter((x) => x[m.key] != null).map((x) => x[m.key]);
    const top = Math.max(...scores);
    best[m.key] = models.filter((x) => x[m.key] === top).map((x) => x.name);
  }
  return best;
}

// Data in the shape Recharts wants for a grouped bar chart:
// [{ metric: "Accuracy", "Logistic Regression": 67.67, KNN: 66.02, ... }, ...]
export function groupedData(models) {
  return METRICS.map((m) => {
    const row = { metric: m.label };
    for (const model of models) row[model.name] = model[m.key] == null ? null : +(model[m.key] * 100).toFixed(2);
    return row;
  });
}
