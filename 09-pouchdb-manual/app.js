// Entrenamiento PouchDB

// 1- Crear la base de datos
// Nombre:  mensajes
const db = new PouchDB("mensajes");
const remoteCouch = false;

// Objeto a grabar en base de datos
const mensaje = {
  _id: new Date().toISOString(),
  user: "spiderman",
  mensaje: "Mi tía hizo unos panqueques muy buenos",
  sincronizado: false,
};

// 2- Insertar en la base de datos
db.put(mensaje).then(
  console.log("Se ha añadido correctamente a la base de datos.")
);

// 3- Leer todos los mensajes offline
db.allDocs({ include_docs: true, descending: true }).then(console.log);

// 4- Cambiar el valor 'sincronizado' de todos los objetos
//  en la BD a TRUE

db.allDocs({ include_docs: true, descending: true }).then(({ rows }) => {
  for (const docOne of rows) {
    docOne.doc.sincronizado = true;
    db.put(docOne.doc);
  }
});
// 5- Borrar todos los registros, uno por uno, evaluando
// cuales estan sincronizados

db.allDocs({ include_docs: true, descending: true }).then(({ rows }) => {
  for (const docOne of rows) {
    if (docOne.doc.sincronizado) {
      db.remove(docOne.doc);
    }
  }
});

// deberá de comentar todo el código que actualiza
// el campo de la sincronización
