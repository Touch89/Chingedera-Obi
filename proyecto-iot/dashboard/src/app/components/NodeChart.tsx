import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SensorData } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NodeChartProps {
  data: SensorData[];
  dataKey: 'temperature' | 'humidity' | 'light';
  title: string;
  color: string;
  unit: string;
}

export function NodeChart({ data, dataKey, title, color, unit }: NodeChartProps) {
  const chartData = data.map(d => ({
    ...d,
    time: format(new Date(d.timestamp), 'HH:mm:ss', { locale: es })
  }));

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{title}</h4>
      <ResponsiveContainer width="100%" height={200}>
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
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={2}
            dot={false}
            name={title}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
