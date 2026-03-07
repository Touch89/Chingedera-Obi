import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { NodeData } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ComparativeChartProps {
  nodes: NodeData[];
  dataKey: 'temperature' | 'humidity' | 'light';
  title: string;
  unit: string;
}

const colors = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ec4899'];

export function ComparativeChart({ nodes, dataKey, title, unit }: ComparativeChartProps) {
  // Combinar datos de todos los nodos
  const maxLength = Math.max(...nodes.map(n => n.history.length));
  const chartData = Array.from({ length: maxLength }, (_, i) => {
    const dataPoint: any = { index: i };
    
    nodes.forEach((node, nodeIndex) => {
      const data = node.history[i];
      if (data) {
        dataPoint[node.id] = data[dataKey];
        dataPoint.time = format(new Date(data.timestamp), 'HH:mm:ss', { locale: es });
      }
    });
    
    return dataPoint;
  });

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{title}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="time" 
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 10 }}
            unit={unit}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend />
          {nodes.map((node, index) => (
            <Line
              key={node.id}
              type="monotone"
              dataKey={node.id}
              name={node.name}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
