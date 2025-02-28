// public/service-worker.js

const CACHE_NAME = "tennis-tracker-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/static/js/main.chunk.js",
  "/static/js/vendors~main.chunk.js",
  "/static/js/bundle.js",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
];

// Встановлення сервіс-воркера і кешування файлів
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error("Failed to cache resources:", error);
      }),
  );
});

// Активація сервіс-воркера
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        }),
      );
    }),
  );
});

// Обробка запитів, використовуючи стратегію "Network first, falling back to cache"
self.addEventListener("fetch", (event) => {
  // Пропускаємо запити до Firebase
  if (
    event.request.url.includes("firebaseio.com") ||
    event.request.url.includes("googleapis.com") ||
    event.request.url.includes("firestore.googleapis.com")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Перевіряємо, що отримали валідну відповідь
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Клонуємо відповідь, оскільки вона може бути використана лише один раз
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Якщо мережа недоступна, використовуємо кеш
        return caches.match(event.request);
      }),
  );
});

// Синхронізація даних при відновленні з'єднання
self.addEventListener("sync", (event) => {
  if (event.tag === "syncMatchData") {
    event.waitUntil(syncMatchData());
  }
});

// Функція для синхронізації даних
async function syncMatchData() {
  try {
    // Тут буде код для синхронізації даних з IndexedDB до Firebase
    console.log("Syncing match data");
  } catch (error) {
    console.error("Sync failed:", error);
  }
}
