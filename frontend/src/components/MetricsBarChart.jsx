import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MODEL_COLORS, groupedData } from "../data/metrics";

// Grouped bar chart: one group per metric, one bar per model.
export default function MetricsBarChart({ models, height = 340 }) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={groupedData(models)} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f2" />
          <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => (v == null ? "Not available" : v.toFixed(2) + "%")} />
          <Legend />
          {models.map((m) => (
            <Bar isAnimationActive={false} key={m.name} dataKey={m.name} fill={MODEL_COLORS[m.name]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
