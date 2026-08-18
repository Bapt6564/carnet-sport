/* Service worker : met l'app en cache pour qu'elle fonctionne hors ligne.

   DEUX CHOSES À FAIRE APRÈS CHAQUE MODIFICATION :
   1. incrémenter VERSION ci-dessous, sinon le téléphone garde l'ancienne version ;
   2. ajouter tout nouveau fichier de séance à la liste FICHIERS. */
const VERSION = "carnet-v5";

const FICHIERS = [
  "./", "./index.html", "./style.css", "./app.js", "./manifest.json", "./icone.svg",
  "./seances/commun.js",
  "./seances/technique-base.js",
  "./seances/push-pull.js",
  "./seances/pull-a.js",
  "./seances/jambes-abdos.js",
  "./seances/epaules.js",
  "./seances/hiit.js",
  "./seances/etirements.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(cles =>
    Promise.all(cles.filter(c => c !== VERSION).map(c => caches.delete(c)))
  ).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== location.origin) return; // on ne cache pas GitHub / Google Fonts
  e.respondWith(
    caches.match(e.request).then(rep => rep || fetch(e.request).then(reseau => {
      const copie = reseau.clone();
      caches.open(VERSION).then(c => c.put(e.request, copie));
      return reseau;
    }).catch(() => caches.match("./index.html")))
  );
});
