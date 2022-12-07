var url = window.location.href;
var swLocation = "/twittor/sw.js";

let swReg;

if (navigator.serviceWorker) {
  if (url.includes("localhost")) {
    swLocation = "/sw.js";
  }

  window.addEventListener("load", function () {
    navigator.serviceWorker.register(swLocation).then(function (reg) {
      swReg = reg;
      swReg.pushManager.getSubscription().then(verificaSubs);
    });
  });
}

// Referencias de jQuery

const titulo = $("#titulo");
const nuevoBtn = $("#nuevo-btn");
const salirBtn = $("#salir-btn");
const cancelarBtn = $("#cancel-btn");
const postBtn = $("#post-btn");
const avatarSel = $("#seleccion");
const timeline = $("#timeline");

const modal = $("#modal");
const modalAvatar = $("#modal-avatar");
const avatarBtns = $(".seleccion-avatar");
const txtMensaje = $("#txtMensaje");

const btnActivadas = $(".btn-noti-activadas");
const btnDesactivadas = $(".btn-noti-desactivadas");

// El usuario, contiene el ID del hÃ©roe seleccionado
var usuario;

// ===== Codigo de la aplicación

function crearMensajeHTML(mensaje, personaje) {
  var content = `
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${personaje}.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${personaje}</h3>
                <br/>
                ${mensaje}
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

  timeline.prepend(content);
  cancelarBtn.click();
}

// Globals
function logIn(ingreso) {
  if (ingreso) {
    nuevoBtn.removeClass("oculto");
    salirBtn.removeClass("oculto");
    timeline.removeClass("oculto");
    avatarSel.addClass("oculto");
    modalAvatar.attr("src", "img/avatars/" + usuario + ".jpg");
  } else {
    nuevoBtn.addClass("oculto");
    salirBtn.addClass("oculto");
    timeline.addClass("oculto");
    avatarSel.removeClass("oculto");

    titulo.text("Seleccione Personaje");
  }
}

// Seleccion de personaje
avatarBtns.on("click", function () {
  usuario = $(this).data("user");

  titulo.text("@" + usuario);

  logIn(true);
});

// Boton de salir
salirBtn.on("click", function () {
  logIn(false);
});

// Boton de nuevo mensaje
nuevoBtn.on("click", function () {
  modal.removeClass("oculto");
  modal.animate(
    {
      marginTop: "-=1000px",
      opacity: 1,
    },
    200
  );
});

// Boton de cancelar mensaje
cancelarBtn.on("click", function () {
  if (!modal.hasClass("oculto")) {
    modal.animate(
      {
        marginTop: "+=1000px",
        opacity: 0,
      },
      200,
      function () {
        modal.addClass("oculto");
        txtMensaje.val("");
      }
    );
  }
});

// Boton de enviar mensaje
postBtn.on("click", function () {
  var mensaje = txtMensaje.val();
  if (mensaje.length === 0) {
    cancelarBtn.click();
    return;
  }

  var data = {
    mensaje: mensaje,
    user: usuario,
  };

  fetch("api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => console.log("app.js", res))
    .catch((err) => console.log("app.js error:", err));

  crearMensajeHTML(mensaje, usuario);
});

// Obtener mensajes del servidor
function getMensajes() {
  fetch("http://localhost:3000/api")
    .then((res) => res.json())
    .then((posts) => {
      console.log(posts);
      posts.forEach((post) => crearMensajeHTML(post.mensaje, post.user));
    });
}

getMensajes();

// Detectar cambios de conexión
function isOnline() {
  if (navigator.onLine) {
    // tenemos conexión
    // console.log('online');
    $.mdtoast("Online", {
      interaction: true,
      interactionTimeout: 1000,
      actionText: "OK!",
    });
  } else {
    // No tenemos conexión
    $.mdtoast("Offline", {
      interaction: true,
      actionText: "OK",
      type: "warning",
    });
  }
}

window.addEventListener("online", isOnline);
window.addEventListener("offline", isOnline);

isOnline();

//! Notificaciones

function verificaSubs(activadas) {
  if (activadas) {
    btnActivadas.removeClass("oculto");
    btnDesactivadas.addClass("oculto");
  } else {
    btnActivadas.addClass("oculto");
    btnDesactivadas.removeClass("oculto");
  }
}

function enviarNotificacion() {
  const notificationOpts = {
    body: "Este es el cuerpo de la notificación",
    icon: "img/icons/icon-72x72.png",
  };

  const n = new Notification("Hola Mundo", notificationOpts);

  n.onclick = () => {
    console.log("Click");
  };
}

function notificarme() {
  if (!window.Notification) {
    console.log("Este navegador no soporta notificaciones");
    return;
  }

  if (Notification.permission === "granted") {
    enviarNotificacion();
  } else if (
    Notification.permission !== "denied" ||
    Notification.permission === "default"
  ) {
    Notification.requestPermission(function (permission) {
      console.log(permission);
      if (permission === "granted") {
        enviarNotificacion();
      }
    });
  }
}

// notificarme();

//! Get Key

function getPublicKey() {
  // fetch("http://localhost:3000/api/key")
  //   .then((res) => res.text())
  //   .then(console.log);

  return (
    fetch("http://localhost:3000/api/key")
      .then((res) => res.arrayBuffer())
      // Retornar arreglo, pero como un Uint8arry
      .then((key) => new Uint8Array(key))
  );
}

// getPublicKey().then(console.log);
btnDesactivadas.on("click", function () {
  if (!swReg) return console.log("error no hay registro de SW");

  getPublicKey().then(function (key) {
    swReg.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      })
      .then((res) => {
        console.log(res.toJSON());
        return res.toJSON();
      })
      .then((suscripcion) => {
        console.log(suscripcion);
        fetch("http://localhost:3000/api/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(suscripcion),
        })
          .then(verificaSubs)
          .catch(cancelarSubscripcion);
      });
  });
});

function cancelarSubscripcion() {
  swReg.pushManager.getSubscription().then((subs) => {
    subs.unsubscribe().then(() => verificaSubs(false));
  });
}

btnActivadas.on("click", function () {
  cancelarSubscripcion();
});
