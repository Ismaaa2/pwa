const fs = require("fs");
const urlSafeBase64 = require("urlsafe-base64");
const vapid = require("./vapid.json");

const webpush = require("web-push");

webpush.setVapidDetails(
  "mailto:ibismaa2@gmail.com",
  vapid.publicKey,
  vapid.privateKey
);

const subscripciones = require("./subs-db.json");

module.exports.getKey = () => {
  return urlSafeBase64.decode(vapid.publicKey);
};

module.exports.addSubscription = (subscripcion) => {
  subscripciones.push(subscripcion);

  fs.writeFileSync(`${__dirname}/subs-db.json`, JSON.stringify(subscripciones));
};

module.exports.getAllSubscription = (subscripcion) =>
  fs.readFileSync(`${__dirname}/subs-db.json`);

module.exports.sendPush = (post) => {
  subscripciones.forEach((sub, i) => {
    webpush.sendNotification(sub, JSON.stringify(post));
  });
};
