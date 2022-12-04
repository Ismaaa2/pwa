const STATIC_CACHE = "static-v4";
const DYNAMIC_CACHE = "dynamic-v2";
const INMUTABLE_CACHE = "inmutable-v3";

const APP_SHELL = [
  // "/",
  "index.html",
  "css/style.css",
  "img/favicon.ico",
  "img/avatars/spiderman.jpg",
  "img/avatars/hulk.jpg",
  "img/avatars/ironman.jpg",
  "img/avatars/wolverine.jpg",
  "img/avatars/thor.jpg",
  "js/app.js",
];

const APP_SHELL_INMUTABLE = [
  "https://fonts.googleapis.com/css?family=Quicksand:300,400",
  "https://fonts.googleapis.com/css?family=Lato:400,300",
  "https://fonts.gstatic.com/s/lato/v23/S6uyw4BMUTPHjx4wXg.woff2",
  "https://fonts.gstatic.com/s/quicksand/v30/6xKtdSZaM9iE8KbpRA_hK1QN.woff2",
  "https://use.fontawesome.com/releases/v5.3.1/css/all.css",
  "css/animate.css",
  "js/libs/jquery.js",
];

self.addEventListener("install", (e) => {
  const cacheStatic = caches
    .open(STATIC_CACHE)
    .then((cache) => cache.addAll(APP_SHELL));
  const cacheInmutable = caches
    .open(INMUTABLE_CACHE)
    .then((cache) => cache.addAll(APP_SHELL_INMUTABLE));

  e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

self.addEventListener("activate", (e) => {
  const resp = caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (
        (key !== STATIC_CACHE && key.includes("static")) ||
        (key !== DYNAMIC_CACHE && key.includes("dynamic"))
      ) {
        caches.delete(key);
      }
    });
  });
  e.waitUntil(resp);
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      if (res) return res;
      return fetch(e.request)
        .then((resp) => {
          console.log(resp);
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(e.request, resp);
            return resp;
          });
        })
        .catch(console.log);
    })
  );
});
