import { useState } from "react";
import { SECTIONS, MODELS, validate, buildClaim } from "../data/fields";
import { predictClaim } from "../services/api";
import ResultCard from "../components/ResultCard";

// Only for quick testing: a realistic example so you don't have to fill 31 fields by hand.
const EXAMPLE = {
  Month: "Dec", WeekOfMonth: 5, DayOfWeek: "Wednesday", AccidentArea: "Urban", Fault: "Policy Holder",
  PoliceReportFiled: "No", WitnessPresent: "No", MonthClaimed: "Jan", WeekOfMonthClaimed: 1,
  DayOfWeekClaimed: "Tuesday", Year: 1994, RepNumber: 12, AgentType: "External", NumberOfSuppliments: "none",
  Sex: "Female", MaritalStatus: "Single", Age: 21, AgeOfPolicyHolder: "26 to 30", DriverRating: 1,
  PastNumberOfClaims: "none", AddressChange_Claim: "1 year", NumberOfCars: "3 to 4", Make: "Honda",
  VehicleCategory: "Sport", VehiclePrice: "more than 69000", AgeOfVehicle: "3 years",
  PolicyType: "Sport - Liability", BasePolicy: "Liability", Deductible: 300,
  Days_Policy_Accident: "more than 30", Days_Policy_Claim: "more than 30",
};

export default function Detect() {
  const [modelName, setModelName] = useState(MODELS[0]);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [result, setResult] = useState(null);

  function change(name, value) {
    setValues({ ...values, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: undefined });
  }

  async function submit(e) {
    e.preventDefault();
    setApiError("");
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setResult(null);
      setApiError("Please fix the highlighted fields.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      setResult(await predictClaim(modelName, buildClaim(values)));
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setValues({});
    setErrors({});
    setApiError("");
    setResult(null);
  }

  return (
    <form onSubmit={submit} noValidate>
      <section className="card">
        <div className="card-head">
          <div>
            <h2>Analyze a claim</h2>
            <p className="muted">Enter the claim details below. The selected model will estimate the chance it is fraudulent.</p>
          </div>
          <button type="button" className="btn ghost" onClick={() => { setValues(EXAMPLE); setErrors({}); setApiError(""); }}>
            Fill example claim
          </button>
        </div>
        <label className="field model-field">
          <span>Model</span>
          <select value={modelName} onChange={(e) => setModelName(e.target.value)}>
            {MODELS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </label>
      </section>

      {SECTIONS.map((section) => (
        <section className="card" key={section.title}>
          <h3>{section.title}</h3>
          <p className="muted small">{section.hint}</p>
          <div className="form-grid">
            {section.fields.map((f) => (
              <label className={"field" + (errors[f.name] ? " invalid" : "")} key={f.name}>
                <span>{f.label}</span>
                {f.type === "select" ? (
                  <select value={values[f.name] ?? ""} onChange={(e) => change(f.name, e.target.value)}>
                    <option value="">Select…</option>
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type="number" min={f.min} max={f.max} step="1" placeholder={`${f.min} – ${f.max}`}
                    value={values[f.name] ?? ""} onChange={(e) => change(f.name, e.target.value)} />
                )}
                {errors[f.name] && <em>{errors[f.name]}</em>}
              </label>
            ))}
          </div>
        </section>
      ))}

      {apiError && <div className="alert error" role="alert">{apiError}</div>}
      {result && <ResultCard result={result} />}

      <div className="actions">
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? <><span className="spinner" /> Analyzing…</> : "Analyze Transaction"}
        </button>
        <button type="button" className="btn ghost" onClick={reset} disabled={loading}>Reset</button>
      </div>
    </form>
  );
}
