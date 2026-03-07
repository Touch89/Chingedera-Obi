// Solicita permiso para notificaciones del navegador
export async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

// Envía una notificación del navegador
export function sendBrowserNotification(title: string, body: string, icon?: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: icon || '/favicon.ico',
      tag: 'iot-monitoring',
      requireInteraction: false
    });
  }
}
