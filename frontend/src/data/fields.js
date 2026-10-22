// Every field the ML model needs. Names MUST match the backend (31 fields).
// type "select"  -> dropdown with the exact values the model was trained on
// type "number"  -> number input with min / max

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const YES_NO = ["Yes", "No"];

export const SECTIONS = [
  {
    title: "Accident Details",
    hint: "When and where the accident happened",
    fields: [
      { name: "Month", label: "Accident Month", type: "select", options: MONTHS },
      { name: "WeekOfMonth", label: "Week of Month (accident)", type: "number", min: 1, max: 5 },
      { name: "DayOfWeek", label: "Accident Day", type: "select", options: DAYS },
      { name: "AccidentArea", label: "Accident Area", type: "select", options: ["Urban", "Rural"] },
      { name: "Fault", label: "Who Was At Fault", type: "select", options: ["Policy Holder", "Third Party"] },
      { name: "PoliceReportFiled", label: "Police Report Filed", type: "select", options: YES_NO },
      { name: "WitnessPresent", label: "Witness Present", type: "select", options: YES_NO },
    ],
  },
  {
    title: "Claim Details",
    hint: "When the claim was filed and who handled it",
    fields: [
      { name: "MonthClaimed", label: "Claim Month", type: "select", options: MONTHS },
      { name: "WeekOfMonthClaimed", label: "Week of Month (claim)", type: "number", min: 1, max: 5 },
      { name: "DayOfWeekClaimed", label: "Claim Day", type: "select", options: DAYS },
      { name: "Year", label: "Year", type: "select", options: [1994, 1995, 1996], numeric: true },
      { name: "RepNumber", label: "Representative Number", type: "number", min: 1, max: 16 },
      { name: "AgentType", label: "Agent Type", type: "select", options: ["External", "Internal"] },
      { name: "NumberOfSuppliments", label: "Number of Supplements", type: "select", options: ["none", "1 to 2", "3 to 5", "more than 5"] },
    ],
  },
  {
    title: "Policy Holder",
    hint: "Who owns the policy",
    fields: [
      { name: "Sex", label: "Sex", type: "select", options: ["Female", "Male"] },
      { name: "MaritalStatus", label: "Marital Status", type: "select", options: ["Single", "Married", "Widow", "Divorced"] },
      { name: "Age", label: "Age (years)", type: "number", min: 16, max: 80 },
      { name: "AgeOfPolicyHolder", label: "Age Group of Policy Holder", type: "select", options: ["16 to 17", "18 to 20", "21 to 25", "26 to 30", "31 to 35", "36 to 40", "41 to 50", "51 to 65", "over 65"] },
      { name: "DriverRating", label: "Driver Rating (1 to 4)", type: "number", min: 1, max: 4 },
      { name: "PastNumberOfClaims", label: "Past Number of Claims", type: "select", options: ["none", "1", "2 to 4", "more than 4"] },
      { name: "AddressChange_Claim", label: "Address Change Before Claim", type: "select", options: ["no change", "under 6 months", "1 year", "2 to 3 years", "4 to 8 years"] },
      { name: "NumberOfCars", label: "Number of Cars Owned", type: "select", options: ["1 vehicle", "2 vehicles", "3 to 4", "5 to 8", "more than 8"] },
    ],
  },
  {
    title: "Vehicle & Policy",
    hint: "The car and the insurance policy",
    fields: [
      {
        name: "Make", label: "Vehicle Make", type: "select",
        options: ["Accura", "BMW", "Chevrolet", "Dodge", "Ferrari", "Ford", "Honda", "Jaguar", "Lexus", "Mazda", "Mecedes", "Mercury", "Nisson", "Pontiac", "Porche", "Saab", "Saturn", "Toyota", "VW"],
      },
      { name: "VehicleCategory", label: "Vehicle Category", type: "select", options: ["Sedan", "Sport", "Utility"] },
      { name: "VehiclePrice", label: "Vehicle Price", type: "select", options: ["less than 20000", "20000 to 29000", "30000 to 39000", "40000 to 59000", "60000 to 69000", "more than 69000"] },
      { name: "AgeOfVehicle", label: "Age of Vehicle", type: "select", options: ["new", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years", "more than 7"] },
      {
        name: "PolicyType", label: "Policy Type", type: "select",
        options: ["Sedan - All Perils", "Sedan - Collision", "Sedan - Liability", "Sport - All Perils", "Sport - Collision", "Sport - Liability", "Utility - All Perils", "Utility - Collision", "Utility - Liability"],
      },
      { name: "BasePolicy", label: "Base Policy", type: "select", options: ["All Perils", "Collision", "Liability"] },
      { name: "Deductible", label: "Deductible", type: "select", options: [300, 400, 500, 700], numeric: true },
      { name: "Days_Policy_Accident", label: "Days: Policy Start to Accident", type: "select", options: ["none", "1 to 7", "8 to 15", "15 to 30", "more than 30"] },
      { name: "Days_Policy_Claim", label: "Days: Policy Start to Claim", type: "select", options: ["8 to 15", "15 to 30", "more than 30"] },
    ],
  },
];

export const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);

export const MODELS = ["Random Forest", "Logistic Regression", "KNN", "SVM"];

// Returns an object with an error message for each invalid field.
export function validate(values) {
  const errors = {};
  for (const f of ALL_FIELDS) {
    const v = values[f.name];
    if (v === undefined || v === "") {
      errors[f.name] = "Required";
    } else if (f.type === "number") {
      const n = Number(v);
      if (!Number.isInteger(n) || n < f.min || n > f.max) {
        errors[f.name] = `Enter a whole number from ${f.min} to ${f.max}`;
      }
    }
  }
  return errors;
}

// Turns the form values into the JSON the backend wants (numbers as numbers).
export function buildClaim(values) {
  const claim = {};
  for (const f of ALL_FIELDS) {
    claim[f.name] = f.type === "number" || f.numeric ? Number(values[f.name]) : values[f.name];
  }
  return claim;
}
