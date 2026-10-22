// Fill in the three blank strings. Use a fictional alias and a broad city.
// This registry is PUBLIC. Do not include private details.
export async function sendMission(url) {
  const body = {
    displayName: "",
    location: "",
    reason: ""
  };

  return await fetch(url, {
    method: "", // Which HTTP method asks to create a record?
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000)
  });
}
