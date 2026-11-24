// Service worker Portal HRIS Karyawan (hrdcentral.cloud/goda/employee).
// Hanya menyimpan "kerangka" halaman agar portal cepat terbuka dan bisa dipasang di HP.
// Data karyawan TIDAK pernah disimpan di cache: semua panggilan API (POST ke Apps Script) dilewati.
const CACHE = "hris-goda-v5.9";
const KERANGKA = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "../config.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(KERANGKA)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((daftar) => Promise.all(daftar.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // font, video, dan API tidak disentuh
  // Jaringan dulu (versi terbaru), cache hanya cadangan saat offline
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) { const salinan = res.clone(); caches.open(CACHE).then((c) => c.put(req, salinan)); }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("./index.html")))
  );
});
