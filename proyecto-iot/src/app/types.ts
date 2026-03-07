export interface SensorData {
  timestamp: number;
  temperature: number;
  humidity: number;
  light: number;
}

export interface NodeData {
  id: string;
  name: string;
  connected: boolean;
  lastUpdate: number;
  relayState: boolean;
  currentData: SensorData;
  history: SensorData[];
}

export interface EventLog {
  id: string;
  timestamp: number;
  type: 'command' | 'alert' | 'connection' | 'error';
  nodeId: string;
  message: string;
}

export interface NodesState {
  [key: string]: NodeData;
}
