// Приём выписки через меню «Поделиться» (Android, установленное приложение).
// Система присылает файл POST-запросом на ./share-statement. Кладём его в кэш
// и открываем приложение на вкладке «Операции» — там окно выписки заберёт файл
// (см. src/sharedFile.ts). Этот файл подключается к service worker в vite.config.ts.

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'POST' || !url.pathname.endsWith('/share-statement')) return;

  event.respondWith(
    (async () => {
      const back = new URL('./?shared=statement#expenses', self.registration.scope).href;
      try {
        const form = await event.request.formData();
        const file = form.getAll('file').find((f) => f instanceof File);
        if (file) {
          const cache = await caches.open('shared-statement');
          await cache.put(
            'statement',
            new Response(file, { headers: { 'X-File-Name': encodeURIComponent(file.name), 'Content-Type': file.type } }),
          );
        }
      } catch {
        // не получилось прочитать — откроем приложение, пусть выберет файл вручную
      }
      return Response.redirect(back, 303);
    })(),
  );
});
