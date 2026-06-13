/* Stacked Poker service worker.
 * Handles tournament "starting soon" web push notifications.
 * Stores nothing; subscription persistence lives on the client + backend.
 */

self.addEventListener('install', () => {
  // Take over immediately so a freshly registered worker can receive pushes.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Control all open clients without requiring a reload.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (err) {
      payload = {};
    }
  }

  const title = payload.title || 'Tournament starting soon';
  const tournamentId = payload.tournamentId;

  const options = {
    body: payload.body || '',
    // tag dedupes across a user's devices: same wallet + tournament keeps only
    // the latest notification visible instead of stacking duplicates.
    tag: payload.tag || (tournamentId != null ? `tournament-${tournamentId}` : 'tournament'),
    data: { tournamentId },
    icon: '/IconMain.png',
    badge: '/IconLogo.png',
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const id = event.notification.data && event.notification.data.tournamentId;
  // Land on the lobby; the client resolves the live table to avoid a 404 when
  // the player is not yet seated.
  const url = id != null ? `/tournament/${id}` : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (id != null) {
        for (const client of clientList) {
          // Exact pathname match: a substring test would let id 5 focus an open
          // /tournament/55 window.
          let pathname = '';
          try {
            pathname = new URL(client.url).pathname;
          } catch (e) {
            pathname = '';
          }
          if (pathname === `/tournament/${id}` && 'focus' in client) {
            return client.focus();
          }
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
      return undefined;
    })
  );
});
