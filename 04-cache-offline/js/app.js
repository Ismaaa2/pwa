if (navigator.serviceWorker) {
  navigator.serviceWorker.register("/sw.js");
}

// if (window.caches) {
//   caches.open("prueba-1");

//   caches.open("prueba-2");

//   //caches.has("prueba-2").then(console.log);

//   //caches.delete("prueba-1").then(console.log);

//   caches.open("cache-v1").then((cache) => {
//     cache
//       .addAll(["/index.html", "/css/style.css", "/img/main.jpg"])
//       .then(() => {
//         // cache.delete("/css/style.css");

//         cache.put("index.html", new Response("Holaaaa"));
//       });

//     // cache.match("/index.html").then((resp) => {
//     //   resp.text().then(console.log);
//     // });
//   });

//   caches.keys().then((caches) => {
//     console.log(caches);
//   });
// }
