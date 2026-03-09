import { useState, useEffect } from "react";
import { Download, Bell, BellOff, Filter } from "lucide-react";
import { Button } from "../components/ui/button";
import { NodeCard } from "../components/NodeCard";
import { ThemeToggle } from "../components/ThemeToggle";
import { NodesState, EventLog } from "../types";
import { exportToCSV } from "../utils/csvExport";
import {
  requestNotificationPermission,
  sendBrowserNotification,
} from "../utils/notifications";
import { toast } from "sonner";
import { Link } from "react-router";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { controlRelay, getEventLogs, getNodesState } from "../../api";

const MAX_HISTORY = 50;

export default function Dashboard() {
  const [nodes, setNodes] = useState<NodesState>({});
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [nextNodes, logs] = await Promise.all([
          getNodesState(MAX_HISTORY),
          getEventLogs(100),
        ]);
        setNodes(nextNodes);
        setEventLogs((prev) => {
          const commandLogs = prev.filter((log) => log.type === "command");
          return [...commandLogs, ...logs].slice(0, 100);
        });

        if (notificationsEnabled) {
          logs
            .filter((log) => log.type === "alert")
            .slice(0, 2)
            .forEach((log) => {
              sendBrowserNotification(`Alerta - ${log.nodeId}`, log.message);
            });
        }
      } catch {
        toast.error("No se pudo obtener datos del API");
      }
    };

    load();
    const interval = setInterval(load, 5000);

    return () => clearInterval(interval);
  }, [notificationsEnabled]);

  const addEventLog = (
    nodeId: string,
    type: EventLog["type"],
    message: string,
  ) => {
    setEventLogs((prev) =>
      [
        {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          type,
          nodeId,
          message,
        },
        ...prev,
      ].slice(0, 100),
    );
  };

  const handleRelayToggle = (nodeId: string, state: boolean) => {
    const updateRelay = async () => {
      const nodeName = nodes[nodeId]?.name ?? nodeId;
      try {
        await controlRelay(nodeId, state);
        setNodes((prev) => ({
          ...prev,
          [nodeId]: {
            ...prev[nodeId],
            relayState: state,
          },
        }));
        addEventLog(
          nodeId,
          "command",
          `Relevador ${nodeName} ${state ? "activado" : "desactivado"}`,
        );
        toast.success(
          `Relevador ${nodeName} ${state ? "activado" : "desactivado"}`,
        );
      } catch {
        toast.error(`No se pudo cambiar el relevador de ${nodeName}`);
      }
    };

    updateRelay();
  };

  const handleExportCSV = () => {
    const nodesToExport = Object.values(nodes);
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    exportToCSV(nodesToExport, start, end);
    toast.success("Datos exportados correctamente");
    addEventLog("system", "command", "Datos exportados a CSV");
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      await requestNotificationPermission();
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
        toast.success("Notificaciones habilitadas");
      } else {
        toast.error("Permiso de notificaciones denegado");
      }
    } else {
      setNotificationsEnabled(false);
      toast.info("Notificaciones deshabilitadas");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Sistema de Monitoreo Ambiental IoT
              </h1>
              <p className="text-sm text-muted-foreground">
                Monitoreo en tiempo real con protocolo MQTT
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleNotifications}
                title={
                  notificationsEnabled
                    ? "Desactivar notificaciones"
                    : "Activar notificaciones"
                }
              >
                {notificationsEnabled ? (
                  <Bell className="h-5 w-5 text-green-500" />
                ) : (
                  <BellOff className="h-5 w-5" />
                )}
              </Button>
              <ThemeToggle />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-4 mt-4">
            <Link to="/">
              <Button variant="default">Dashboard Principal</Button>
            </Link>
            <Link to="/comparative">
              <Button variant="outline">Vista Comparativa</Button>
            </Link>
            <Link to="/logs">
              <Button variant="outline">Logs de Eventos</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Controles de exportación y filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Exportación y Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="start-date">Fecha Inicio</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="end-date">Fecha Fin</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button onClick={handleExportCSV} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar a CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Nodos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.values(nodes).map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              onRelayToggle={handleRelayToggle}
            />
          ))}
        </div>

        {/* Eventos recientes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Eventos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {eventLogs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 bg-secondary/20 rounded text-sm"
                >
                  <span className="text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString("es-ES")}
                  </span>
                  <span>{log.message}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      log.type === "alert"
                        ? "bg-yellow-500/20 text-yellow-600"
                        : log.type === "error"
                          ? "bg-red-500/20 text-red-600"
                          : log.type === "connection"
                            ? "bg-blue-500/20 text-blue-600"
                            : "bg-green-500/20 text-green-600"
                    }`}
                  >
                    {log.type}
                  </span>
                </div>
              ))}
              {eventLogs.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No hay eventos registrados
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
