// const CACHE_NAME = "cache-1";
const CACHE_STATIC_NAME = "static-v1";
const CACHE_DYNAMIC_NAME = "dynamic-v1";

const CACHE_INMUTABLE_NAME = "inmutable-v1";
const CACHE_DYNAMIC_LIMIT = 50;

function clearCache(cacheName, numberItems) {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > numberItems) {
        cache.delete(keys[0]).then(clearCache(cacheName, numberItems));
      }
    });
  });
}

self.addEventListener("install", (e) => {
  const cacheStatic = caches.open(CACHE_STATIC_NAME).then((cache) => {
    cache.addAll([
      "/",
      "/index.html",
      "/css/style.css",
      "/img/main.jpg",
      "/js/app.js",
      "/img/no-img.jpg",
    ]);
  });

  const cacheInmutable = caches.open(CACHE_INMUTABLE_NAME).then((cache) => {
    cache.add(
      "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
    );
  });

  e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

self.addEventListener("fetch", (e) => {
  //! 1. Cache Only ( Toda la app sea servida desde el cache )
  // e.respondWith(caches.match(e.request));

  //! 2. cache with Network Fallback
  // const resp = caches.match(e.request).then((res) => {
  //   if (res) return res;
  //   // No existe el archivo
  //   console.log("No existe ", e.request.url);

  //   return fetch(e.request).then((newRes) => {
  //     caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
  //       cache.put(e.request, newRes);
  //       clearCache(CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT);
  //     });

  //     return newRes.clone();
  //   });
  // });

  // e.respondWith(resp);

  //! 3. Network with cache Fallback

  // const resp = fetch(e.request)
  //   .then((res) => {
  //     if (!res) return caches.match(e.request);
  //     console.log("Fecth: ", res);

  //     caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
  //       cache.put(e.request, res);
  //       clearCache(CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT);
  //     });

  //     return res.clone();
  //   })
  //   .catch((err) => {
  //     return caches.match(e.request);
  //   });

  // e.respondWith(resp);

  //! 4. Cache with Network update

  // if (e.request.url.includes("bootstrap")) {
  //   return e.respondWith(caches.match(e.request));
  // }

  // const resp = caches.open(CACHE_STATIC_NAME).then((cache) => {
  //   fetch(e.request).then((newRes) => cache.put(e.request, newRes));
  //   return cache.match(e.request);
  // });

  // e.respondWith(resp);

  //! 5. Cache & Network Race

  const resp = new Promise((resolve, reject) => {
    let fail = false;

    const failOneTime = () => {
      if (fail) {
        if (/\.(png|jpg)$/i.test(e.request.url)) {
          resolve(caches.match("/img/no-img.jpg"));
        } else {
          reject("No se encontró respuesta");
        }
      } else {
        fail = true;
      }
    };

    fetch(e.request)
      .then((res) => (res.ok ? resolve(res) : failOneTime()))
      .catch(failOneTime);

    caches
      .match(e.request)
      .then((res) => (res ? resolve(res) : failOneTime()))
      .catch(failOneTime);
  });

  e.respondWith(resp);
});
