self.addEventListener('install', (e) => {
  self.skipWaiting();
});
self.addEventListener('fetch', (e) => {
  // Пустой обработчик нужен для прохождения проверки PWA в Chrome
});
