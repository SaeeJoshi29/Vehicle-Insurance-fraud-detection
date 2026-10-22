// All talking to the backend happens in this one file.
// The backend address comes from the .env file (VITE_API_URL).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options) {
  let response;
  try {
    response = await fetch(API_URL + path, options);
  } catch {
    // fetch only throws when the server cannot be reached at all
    throw new Error(`Cannot reach the backend at ${API_URL}. Is it running?`);
  }

  if (!response.ok) {
    let message = `Server error (${response.status})`;
    try {
      const data = await response.json();
      if (typeof data.detail === "string") message = data.detail;
      else if (data.detail) message = "The server rejected the claim data.";
    } catch {
      /* response was not JSON, keep the default message */
    }
    throw new Error(message);
  }
  return response.json();
}

export function predictClaim(modelName, claim) {
  return request("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model_name: modelName, claim }),
  });
}

export function getHistory() {
  return request("/history");
}

export function getMetrics() {
  return request("/metrics");
}
