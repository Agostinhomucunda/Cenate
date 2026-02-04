self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('fetch', e => {
  // Não precisa de cache agora, só ativa a instalação
});