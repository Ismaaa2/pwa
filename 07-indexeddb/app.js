const request = window.indexedDB.open("mi-database", 1);

//! Se actuliza cuando se crea o se sube de versión de la DB
request.onupgradeneeded = (event) => {
  console.log("Actualización de BD");

  const db = event.target.result;

  db.createObjectStore("heroes", {
    keyPath: "id",
  });
};

//! Manejo de errores

request.onerror = (event) => {
  console.log("DB error:", event.target.error);
};

//! Insertar datos
request.onsuccess = (event) => {
  const db = event.target.result;

  const heroesData = [
    {
      id: "111",
      heroe: "Spiderman",
      mensaje: "Aquí esta mi mensaje Spiderman",
    },
    { id: "222", heroe: "Thor", mensaje: "Aquí esta mi mensaje Thor" },
  ];

  const heroesTransaction = db.transaction("heroes", "readwrite");
  heroesTransaction.onerror = (event) => {
    console.log("Error guardando: ", event.target.error);
  };

  //! Éxito de la transacción
  heroesTransaction.oncomplete = (event) => {
    console.log("Transación hecha", event);
  };
  const heroesStore = heroesTransaction.objectStore("heroes");

  for (const heroe of heroesData) {
    heroesStore.add(heroe);
  }

  heroesStore.onsuccess = (event) => {
    console.log("Nuevo item agregado a la base de datos", event);
  };
};
