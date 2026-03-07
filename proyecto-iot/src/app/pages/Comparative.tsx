import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ThemeToggle } from '../components/ThemeToggle';
import { ComparativeChart } from '../components/ComparativeChart';
import { NodesState } from '../types';
import { generateSensorData } from '../utils/mqttSimulator';
import { Link } from 'react-router';

const INITIAL_NODES: NodesState = {
  'node-1': {
    id: 'node-1',
    name: 'Nodo 1',
    connected: true,
    lastUpdate: Date.now(),
    relayState: false,
    currentData: generateSensorData('node-1'),
    history: []
  },
  'node-2': {
    id: 'node-2',
    name: 'Nodo 2',
    connected: true,
    lastUpdate: Date.now(),
    relayState: false,
    currentData: generateSensorData('node-2'),
    history: []
  },
  'node-3': {
    id: 'node-3',
    name: 'Nodo 3',
    connected: true,
    lastUpdate: Date.now(),
    relayState: false,
    currentData: generateSensorData('node-3'),
    history: []
  }
};

const MAX_HISTORY = 50;

export default function Comparative() {
  const [nodes, setNodes] = useState<NodesState>(INITIAL_NODES);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prevNodes => {
        const newNodes = { ...prevNodes };
        
        Object.keys(newNodes).forEach(nodeId => {
          const node = newNodes[nodeId];
          const newData = generateSensorData(nodeId, node.currentData);
          node.currentData = newData;
          node.history = [...node.history, newData].slice(-MAX_HISTORY);
        });
        
        return newNodes;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nodesArray = Object.values(nodes);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Vista Comparativa</h1>
                <p className="text-sm text-muted-foreground">
                  Comparación de datos entre múltiples nodos
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Comparativa de Temperatura */}
          <Card>
            <CardHeader>
              <CardTitle>Comparativa de Temperatura</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparativeChart
                nodes={nodesArray}
                dataKey="temperature"
                title="Temperatura (°C)"
                unit="°C"
              />
            </CardContent>
          </Card>

          {/* Comparativa de Humedad */}
          <Card>
            <CardHeader>
              <CardTitle>Comparativa de Humedad</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparativeChart
                nodes={nodesArray}
                dataKey="humidity"
                title="Humedad (%)"
                unit="%"
              />
            </CardContent>
          </Card>

          {/* Comparativa de Luminosidad */}
          <Card>
            <CardHeader>
              <CardTitle>Comparativa de Luminosidad</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparativeChart
                nodes={nodesArray}
                dataKey="light"
                title="Luminosidad (lux)"
                unit=" lux"
              />
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas Actuales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {nodesArray.map(node => (
                  <div key={node.id} className="p-4 border rounded-lg space-y-2">
                    <h3 className="font-semibold">{node.name}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temperatura:</span>
                        <span className="font-medium">{node.currentData.temperature.toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Humedad:</span>
                        <span className="font-medium">{node.currentData.humidity.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Luminosidad:</span>
                        <span className="font-medium">{node.currentData.light.toFixed(0)} lux</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
