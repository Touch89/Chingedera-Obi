import { useState, useEffect } from "react";
import { ArrowLeft, Filter, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ThemeToggle } from "../components/ThemeToggle";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { EventLog } from "../types";
import { Link } from "react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getEventLogs } from "../../api";

export default function EventLogs() {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [filter, setFilter] = useState<
    "all" | "command" | "alert" | "connection" | "error"
  >("all");

  useEffect(() => {
    const load = async () => {
      const apiLogs = await getEventLogs(100);
      setLogs(apiLogs);
    };

    load();
    const interval = setInterval(load, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredLogs =
    filter === "all" ? logs : logs.filter((log) => log.type === filter);

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogTypeBadge = (type: EventLog["type"]) => {
    switch (type) {
      case "alert":
        return (
          <Badge variant="default" className="bg-yellow-500">
            Alerta
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "connection":
        return (
          <Badge variant="default" className="bg-blue-500">
            Conexión
          </Badge>
        );
      case "command":
        return (
          <Badge variant="default" className="bg-green-500">
            Comando
          </Badge>
        );
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

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
                <h1 className="text-3xl font-bold">Logs de Eventos</h1>
                <p className="text-sm text-muted-foreground">
                  Historial de comandos, alertas y eventos del sistema
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Registro de Eventos</CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={filter}
                  onValueChange={(value: any) => setFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="command">Comandos</SelectItem>
                    <SelectItem value="alert">Alertas</SelectItem>
                    <SelectItem value="connection">Conexiones</SelectItem>
                    <SelectItem value="error">Errores</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={clearLogs}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay eventos registrados
                </p>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="min-w-[140px]">
                      <p className="text-sm font-medium">
                        {format(new Date(log.timestamp), "dd/MM/yyyy", {
                          locale: es,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(log.timestamp), "HH:mm:ss", {
                          locale: es,
                        })}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{log.message}</p>
                    </div>
                    {getLogTypeBadge(log.type)}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{logs.length}</p>
                <p className="text-sm text-muted-foreground">
                  Total de eventos
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {logs.filter((l) => l.type === "command").length}
                </p>
                <p className="text-sm text-muted-foreground">Comandos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">
                  {logs.filter((l) => l.type === "alert").length}
                </p>
                <p className="text-sm text-muted-foreground">Alertas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {logs.filter((l) => l.type === "connection").length}
                </p>
                <p className="text-sm text-muted-foreground">Conexiones</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
