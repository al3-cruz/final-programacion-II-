// Service Worker de Notificaciones de Copa Extra 2026
self.addEventListener('install', (e) => {
  console.log('[Copa Extra SW] Service Worker instalado con éxito.');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('[Copa Extra SW] Service Worker activado.');
  e.waitUntil(self.clients.claim());
});

// Escuchador de eventos de notificaciones push en segundo plano / mensaje de la pestaña
self.addEventListener('message', (event) => {
  console.log('[Copa Extra SW] Mensaje recibido en SW:', event.data);
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag } = event.data;
    
    event.waitUntil(
      self.registration.showNotification(title || 'Copa Extra 2026', {
        body: body || '¡Resultados de Google Sheets actualizados!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        tag: tag || 'sheet-update-notification',
        renotify: true,
        data: { url: self.location.origin }
      })
    );
  }
});

// Manejo de clic en la notificación nativa
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Abrir la pestaña o enfocarla si ya está abierta
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
