function actulizarCacheDinamico(dynamicCache, req, res) {
  if (res.ok) {
    return caches.open(dynamicCache).then((cache) => {
      cache.put(req, res);
      return res.clone();
    });
  }
}
