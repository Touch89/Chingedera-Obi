import { Thermometer, Droplets, Sun, Wifi, WifiOff, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { NodeData } from '../types';
import { NodeChart } from './NodeChart';
import { RelayControl } from './RelayControl';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NodeCardProps {
  node: NodeData;
  onRelayToggle: (nodeId: string, state: boolean) => void;
}

export function NodeCard({ node, onRelayToggle }: NodeCardProps) {
  const { currentData, connected, lastUpdate, history } = node;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {node.name}
            {connected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </CardTitle>
          <Badge variant={connected ? 'default' : 'destructive'}>
            {connected ? 'Conectado' : 'Desconectado'}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Última actualización: {formatDistanceToNow(new Date(lastUpdate), { 
            addSuffix: true, 
            locale: es 
          })}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lecturas actuales */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <Thermometer className="h-8 w-8 text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{currentData.temperature.toFixed(1)}°C</p>
            <p className="text-xs text-muted-foreground">Temperatura</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Droplets className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{currentData.humidity.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Humedad</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <Sun className="h-8 w-8 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{currentData.light.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Luminosidad (lux)</p>
          </div>
        </div>

        {/* Gráficas */}
        <div className="space-y-4">
          <NodeChart 
            data={history}
            dataKey="temperature"
            title="Temperatura"
            color="#f97316"
            unit="°C"
          />
          <NodeChart 
            data={history}
            dataKey="humidity"
            title="Humedad"
            color="#3b82f6"
            unit="%"
          />
          <NodeChart 
            data={history}
            dataKey="light"
            title="Luminosidad"
            color="#eab308"
            unit=" lux"
          />
        </div>

        {/* Control de relevador */}
        <RelayControl
          nodeId={node.id}
          nodeName={node.name}
          state={node.relayState}
          onToggle={onRelayToggle}
        />
      </CardContent>
    </Card>
  );
}
