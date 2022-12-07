const fs = require("fs");
const urlSafeBase64 = require("urlsafe-base64");
const vapid = require("./vapid.json");

const webpush = require("web-push");

webpush.setVapidDetails(
  "mailto:ibismaa2@gmail.com",
  vapid.publicKey,
  vapid.privateKey
);

let subscripciones = require("./subs-db.json");

const writeFile = (subscripcion) => {
  fs.writeFileSync(`${__dirname}/subs-db.json`, JSON.stringify(subscripcion));
};

module.exports.getKey = () => {
  return urlSafeBase64.decode(vapid.publicKey);
};

module.exports.addSubscription = (subscripcion) => {
  subscripciones.push(subscripcion);

  writeFile(subscripcion);
};

module.exports.getAllSubscription = (subscripcion) =>
  fs.readFileSync(`${__dirname}/subs-db.json`);

module.exports.sendPush = (post) => {
  console.log("Mandando PUSHES");
  const notificacionesEnviadas = [];

  subscripciones.forEach((sub, i) => {
    const pushProm = webpush
      .sendNotification(sub, JSON.stringify(post))
      .then(console.log("Notificacion Enviada."))
      .catch((err) => {
        if (err.statusCode === 410) {
          // GONE, ya no existe
          subscripciones[i].borrar = true;
        }
      });
    notificacionesEnviadas.push(pushProm);
  });
  Promise.all(notificacionesEnviadas).then(() => {
    subscripciones = subscripciones.filter((subs) => !subs.borrar);

    writeFile(subscripciones);
  });
};
