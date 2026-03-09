import { EventLog, NodesState, SensorData } from "./app/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

type ApiReading = {
  nodo: string;
  temperatura: number;
  humedad: number;
  luz: number;
  timestamp: string;
  relay_state?: boolean | number | string;
};

function toTimestamp(value: string | number | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return Date.now();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

function toSensorData(reading: ApiReading): SensorData {
  return {
    timestamp: toTimestamp(reading.timestamp),
    temperature: Number(reading.temperatura ?? 0),
    humidity: Number(reading.humedad ?? 0),
    light: Number(reading.luz ?? 0),
  };
}

function relayToBool(value: ApiReading["relay_state"]): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    return normalized === "on" || normalized === "true" || normalized === "1";
  }
  return false;
}

function getNodeName(nodeId: string): string {
  const match = nodeId.match(/node-(\d+)/i);
  if (match) return `Nodo ${match[1]}`;
  return nodeId;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function getLatest() {
  return fetchJson<Record<string, ApiReading>>(`${API_URL}/api/latest`);
}

export async function getHistory(limit = 50) {
  return fetchJson<ApiReading[]>(`${API_URL}/api/history?limit=${limit}`);
}

export async function controlRelay(node: string, state: boolean) {
  const response = await fetch(`${API_URL}/api/control`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ node, state: state ? "on" : "off" }),
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export async function getNodesState(limit = 50): Promise<NodesState> {
  const [latestByNode, history] = await Promise.all([
    getLatest(),
    getHistory(limit),
  ]);
  const result: NodesState = {};
  const historyByNode = history.reduce<Record<string, SensorData[]>>(
    (acc, item) => {
      if (!acc[item.nodo]) acc[item.nodo] = [];
      acc[item.nodo].push(toSensorData(item));
      return acc;
    },
    {},
  );

  Object.entries(latestByNode).forEach(([nodeKey, reading]) => {
    const nodeId = reading.nodo || nodeKey;
    const currentData = toSensorData(reading);
    const lastUpdate = currentData.timestamp;

    result[nodeId] = {
      id: nodeId,
      name: getNodeName(nodeId),
      connected: Date.now() - lastUpdate < 60_000,
      lastUpdate,
      relayState: relayToBool(reading.relay_state),
      currentData,
      history: historyByNode[nodeId] ?? [currentData],
    };
  });

  return result;
}

export async function getEventLogs(limit = 100): Promise<EventLog[]> {
  const history = await getHistory(limit);

  return history
    .slice()
    .reverse()
    .map((reading, index) => {
      const temperature = Number(reading.temperatura ?? 0);
      const humidity = Number(reading.humedad ?? 0);
      const light = Number(reading.luz ?? 0);
      const isAlert = temperature >= 35 || humidity <= 30;
      const nodeId = reading.nodo;
      const name = getNodeName(nodeId);

      return {
        id: `${nodeId}-${toTimestamp(reading.timestamp)}-${index}`,
        timestamp: toTimestamp(reading.timestamp),
        type: isAlert ? "alert" : "connection",
        nodeId,
        message: `${name}: T ${temperature.toFixed(1)}°C, H ${humidity.toFixed(1)}%, L ${light.toFixed(0)} lux`,
      };
    });
}
