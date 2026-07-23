self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => {
  self.registration.unregister().then(() => {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
      for (const c of clients) c.navigate(c.url);
    });
  });
});
