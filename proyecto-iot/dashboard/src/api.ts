const API_URL = "http://localhost:5000";

export async function getLatest() {
  const res = await fetch(`${API_URL}/api/latest`);
  return res.json();
}

export async function getHistory() {
  const res = await fetch(`${API_URL}/api/history?limit=50`);
  return res.json();
}

export async function controlRelay(node: string, state: string) {
  return fetch(`${API_URL}/api/control`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ node, state })
  });
}