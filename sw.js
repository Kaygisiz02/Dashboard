/* Günlük Ajandam — Service Worker (opsiyonel)
   ------------------------------------------------------------------
   Amaç: index.html'i önbelleğe alarak uygulamanın internet olmadan da
   açılabilmesini sağlamak. index.html tamamen kendi kendine yeten tek
   dosya olduğundan (CSS/JS/ikonlar hepsi satır içi), önbelleğe alınması
   gereken tek "gerçek" kaynak odur.

   Bu dosya YOKSA veya index.html file:// ile doğrudan açılıyorsa hiçbir
   şey bozulmaz — index.html bu dosyayı best-effort olarak kaydetmeyi
   dener ve başarısız olursa sessizce yoluna devam eder.

   Döviz kuru / hava durumu / makbuz OCR gibi dış API çağrıları kasıtlı
   olarak burada ele alınmaz ve önbelleğe alınmaz — uygulama zaten
   bunların başarısız olma ihtimaline karşı kendi içinde (try/catch)
   hazırlıklı; bu istekler her zaman doğrudan ağa gider. */

const CACHE_NAME = "gunluk-ajandam-v1";
const APP_SHELL = ["./", "./index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Sadece bu origin'den gelen GET isteklerini yönet. Döviz kuru / hava
  // durumu / OCR kütüphanesi gibi dış kaynaklara dokunma — onları olduğu
  // gibi ağa bırak.
  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // Stale-while-revalidate: önbellek varsa anında onu döndür (hızlı +
  // çevrimdışı çalışır), arka planda ağdan güncel sürümü çekip önbelleği
  // tazeler. Ağ da başarısız olursa ve önbellek de yoksa, tarayıcının
  // normal hata davranışına bırakılır.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
