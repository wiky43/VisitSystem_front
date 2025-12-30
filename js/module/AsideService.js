const manejarNavegacion = (e) => {
  const boton = e.target.closest("button[id^='btn-']");

  if (!boton) return;

  const id = boton.id;

  const rutas = {
    "btn-home": "/pages/Admin_View/dashboard_admin.html",
    "btn-usuarios": "/pages/Admin_View/User.html",
    "btn-reportes": "/pages/Admin_View/report.html",
  };

  if (rutas[id]) {
    console.log(`Navegando a: ${rutas[id]}`);
    window.location.href = rutas[id];
  }
};

document.addEventListener("click", manejarNavegacion);
