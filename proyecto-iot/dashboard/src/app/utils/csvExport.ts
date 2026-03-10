import { NodeData } from '../types';

export function exportToCSV(nodes: NodeData[], startDate?: Date, endDate?: Date) {
  let csvContent = 'Nodo,Fecha,Hora,Temperatura (°C),Humedad (%),Luminosidad (lux)\n';

  nodes.forEach(node => {
    let dataToExport = node.history;

    // Filtrar por rango de fechas si se proporciona
    if (startDate || endDate) {
      dataToExport = node.history.filter(data => {
        const dataDate = new Date(data.timestamp);
        if (startDate && endDate) {
          return dataDate >= startDate && dataDate <= endDate;
        } else if (startDate) {
          return dataDate >= startDate;
        } else if (endDate) {
          return dataDate <= endDate;
        }
        return true;
      });
    }

    dataToExport.forEach(data => {
      const date = new Date(data.timestamp);
      const dateStr = date.toLocaleDateString('es-ES');
      const timeStr = date.toLocaleTimeString('es-ES');
      
      csvContent += `${node.name},${dateStr},${timeStr},${data.temperature.toFixed(2)},${data.humidity.toFixed(2)},${data.light.toFixed(0)}\n`;
    });
  });

  // Crear y descargar el archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `datos_sensores_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
