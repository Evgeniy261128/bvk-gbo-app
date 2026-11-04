const CACHE_NAME = 'bvk-pwa-v5';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  // Не кэшируем ничего заранее — стратегия Network-First,
  // чтобы после каждого деплоя пользователи получали свежую версию.
  event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Удаляем кэши прошлых версий Service Worker
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Network-First: сначала сеть, ответ кладём в кэш;
  // при отсутствии сети (офлайн) — отдаём из кэша.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const freshResponse = await fetch(request);
        // Кэшируем только успешные базовые ответы (не opaque, не ошибки)
        if (freshResponse && freshResponse.ok && freshResponse.type === 'basic') {
          cache.put(request, freshResponse.clone());
        }
        return freshResponse;
      } catch (err) {
        const cached = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });
        if (cached) return cached;
        // Для навигации офлайн пробуем отдать корень приложения
        if (request.mode === 'navigate') {
          const fallback = await cache.match('./index.html');
          if (fallback) return fallback;
        }
        throw err;
      }
    })()
  );
});
