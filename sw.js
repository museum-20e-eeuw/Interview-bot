const CACHE_NAAM = "interview-zuil-v1";
const SHELL_BESTANDEN = [
  "/",
  "/?mode=zuil",
  "/manifest.webmanifest",
  "/static/museum.ico",
  "/static/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAAM)
      .then((cache) => cache.addAll(SHELL_BESTANDEN))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((namen) =>
      Promise.all(
        namen
          .filter((naam) => naam !== CACHE_NAAM)
          .map((naam) => caches.delete(naam))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const verzoek = event.request;
  if (verzoek.method !== "GET") return;

  const url = new URL(verzoek.url);
  if (url.pathname.startsWith("/api/")) return;

  // Netwerk-eerst met cache-fallback voor offline/installable ondersteuning
  event.respondWith(
    fetch(verzoek)
      .then((respons) => {
        if (respons && respons.status === 200 && url.origin === self.location.origin) {
          const kopie = respons.clone();
          caches.open(CACHE_NAAM).then((cache) => cache.put(verzoek, kopie)).catch(() => {});
        }
        return respons;
      })
      .catch(() => caches.match(verzoek).then((gevonden) => gevonden || caches.match("/")))
  );
});

