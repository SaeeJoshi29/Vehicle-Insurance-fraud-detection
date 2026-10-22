import { useState } from "react";
import { pct } from "./ResultCard";

// A table of past predictions. Clicking a row shows the claim that was analysed.
export default function ClaimsTable({ rows, showDetails = true }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Time</th>
            <th>Model</th>
            <th>Result</th>
            <th>Fraud prob.</th>
            <th>Risk</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <FragmentRow key={r.id} r={r} open={openId === r.id} showDetails={showDetails}
              toggle={() => setOpenId(openId === r.id ? null : r.id)} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FragmentRow({ r, open, toggle, showDetails }) {
  const fraud = r.label !== "Genuine";
  return (
    <>
      <tr className={showDetails ? "clickable" : ""} onClick={showDetails ? toggle : undefined}>
        <td>#{r.id}</td>
        <td>{new Date(r.timestamp).toLocaleString()}</td>
        <td>{r.model}</td>
        <td><span className={"badge " + (fraud ? "bad" : "good")}>{r.label}</span></td>
        <td>{pct(r.fraud_probability)}</td>
        <td><span className={"badge risk-" + r.risk_level.toLowerCase()}>{r.risk_level}</span></td>
      </tr>
      {open && (
        <tr className="details-row">
          <td colSpan={6}>
            <div className="details-grid">
              {Object.entries(r.claim).map(([k, v]) => (
                <div key={k}><span>{k}</span><strong>{String(v)}</strong></div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
