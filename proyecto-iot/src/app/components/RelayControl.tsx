import { Power } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface RelayControlProps {
  nodeId: string;
  nodeName: string;
  state: boolean;
  onToggle: (nodeId: string, state: boolean) => void;
}

export function RelayControl({ nodeId, nodeName, state, onToggle }: RelayControlProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${state ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'}`}>
          <Power className="h-5 w-5" />
        </div>
        <div>
          <Label className="text-sm font-medium">Relevador {nodeName}</Label>
          <p className="text-xs text-muted-foreground">
            Estado: {state ? 'Activado' : 'Desactivado'}
          </p>
        </div>
      </div>
      <Switch
        checked={state}
        onCheckedChange={(checked) => onToggle(nodeId, checked)}
      />
    </div>
  );
}
