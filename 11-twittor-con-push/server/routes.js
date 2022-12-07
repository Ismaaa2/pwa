// Routes.js - Módulo de rutas
const express = require("express");
const router = express.Router();
const push = require("./push");

const mensajes = [
  {
    _id: "XXX",
    user: "spiderman",
    mensaje: "Hola Mundo",
  },
];

// Get mensajes
router.get("/", function (req, res) {
  // res.json('Obteniendo mensajes');
  res.json(mensajes);
});

// Post mensaje
router.post("/", function (req, res) {
  const mensaje = {
    mensaje: req.body.mensaje,
    user: req.body.user,
  };

  mensajes.push(mensaje);

  console.log(mensajes);

  res.json({
    ok: true,
    mensaje,
  });
});

//! Almacenar la subscripción
router.post("/subscribe", (req, res) => {
  const subscripcion = req.body;

  push.addSubscription(subscripcion);

  res.json("suscribirse");
});

//! Enviarle al cliente el key
router.get("/key", (req, res) => {
  const key = push.getKey();

  res.send(key);
});

//! Enviarle al cliente el key
router.get("/allSubscription", (req, res) => {
  const keys = push.getAllSubscription();

  res.send(keys);
});

//! Enviar notifiación PUSH
router.post("/push", (req, res) => {
  const notification = {
    titulo: req.body.titulo,
    cuerpo: req.body.cuerpo,
    usuario: req.body.usuario,
  };

  push.sendPush(notification);

  res.json(notification);
});

module.exports = router;
