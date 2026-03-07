import { SensorData } from '../types';

// Simula la generación de datos de sensores similar a MQTT
export function generateSensorData(nodeId: string, previousData?: SensorData): SensorData {
  const baseTemp = 20 + parseInt(nodeId.slice(-1)) * 2;
  const baseHumidity = 50 + parseInt(nodeId.slice(-1)) * 5;
  const baseLight = 300 + parseInt(nodeId.slice(-1)) * 100;

  // Añade variación basada en datos anteriores para simular cambios graduales
  const tempVariation = previousData 
    ? (Math.random() - 0.5) * 2 
    : (Math.random() - 0.5) * 5;
  
  const humidityVariation = previousData 
    ? (Math.random() - 0.5) * 3 
    : (Math.random() - 0.5) * 10;
  
  const lightVariation = previousData 
    ? (Math.random() - 0.5) * 50 
    : (Math.random() - 0.5) * 100;

  return {
    timestamp: Date.now(),
    temperature: Math.max(0, Math.min(50, (previousData?.temperature || baseTemp) + tempVariation)),
    humidity: Math.max(0, Math.min(100, (previousData?.humidity || baseHumidity) + humidityVariation)),
    light: Math.max(0, Math.min(1000, (previousData?.light || baseLight) + lightVariation))
  };
}

// Detecta anomalías en los datos
export function detectAnomalies(data: SensorData): string[] {
  const anomalies: string[] = [];

  if (data.temperature > 35) {
    anomalies.push(`Temperatura alta: ${data.temperature.toFixed(1)}°C`);
  }
  if (data.temperature < 10) {
    anomalies.push(`Temperatura baja: ${data.temperature.toFixed(1)}°C`);
  }
  if (data.humidity > 80) {
    anomalies.push(`Humedad alta: ${data.humidity.toFixed(1)}%`);
  }
  if (data.humidity < 30) {
    anomalies.push(`Humedad baja: ${data.humidity.toFixed(1)}%`);
  }
  if (data.light < 100) {
    anomalies.push(`Luminosidad baja: ${data.light.toFixed(0)} lux`);
  }

  return anomalies;
}
