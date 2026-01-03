document.addEventListener("DOMContentLoaded", () => {
  const sideBar = document.querySelector("aside");
  const toggle = document.getElementById("toggle");

  // 1. DICCIONARIO DE RUTAS (Relación entre URL y ID de los botones)
  const rutas = {
    "/pages/Admin_View/dashboard_admin.html": "btn-home",
    "/pages/Admin_View/User.html": "btn-usuarios",
    "/pages/Admin_View/report.html": "btn-reportes",
    "/pages/Admin_View/visitasActivas.html": "btn-visitas",
  };

  // 2. PERSISTENCIA: Aplicar si el sidebar estaba mini o no al cargar
  const aplicarEstadoSidebar = () => {
    const isMini = localStorage.getItem("sidebar-mini") === "true";
    if (isMini) {
      sideBar.classList.add("mini");
      sideBar.style.width = "4rem";
    } else {
      sideBar.classList.remove("mini");
      sideBar.style.width = "16rem";
    }
  };

  // 3. DETECTAR PÁGINA ACTUAL: Marca el botón "active" según la URL
  const marcarPaginaActual = () => {
    const rutaActual = window.location.pathname;
    const activeId = rutas[rutaActual];

    // Limpia cualquier clase 'active' previa
    document
      .querySelectorAll("aside li")
      .forEach((li) => li.classList.remove("active"));

    // Agrega 'active' al botón que corresponde a la página actual
    if (activeId) {
      const el = document.getElementById(activeId);
      if (el) el.classList.add("active");
    }
  };

  // 4. NAVEGACIÓN: Lógica de redirección al hacer clic
  const manejarNavegacion = (e) => {
    const boton = e.target.closest("li[id]");

    // Si no es un botón de navegación, ignoramos el clic
    if (!boton || !boton.id.startsWith("btn-")) return;

    // Mapa inverso para saber a dónde ir según el ID
    const mapaNavegacion = {
      "btn-home": "/pages/Admin_View/dashboard_admin.html",
      "btn-usuarios": "/pages/Admin_View/User.html",
      "btn-reportes": "/pages/Admin_View/report.html",
      "btn-visitas": "/pages/Admin_View/visitasActivas.html",
    };

    const destino = mapaNavegacion[boton.id];
    if (destino) {
      window.location.href = destino;
    }
  };

  // 5. EVENTO TOGGLE: Cambiar tamaño y guardar en memoria
  if (toggle) {
    toggle.addEventListener("click", () => {
      const isMini = sideBar.classList.toggle("mini");
      sideBar.style.width = isMini ? "4rem" : "16rem";

      // Guardamos la preferencia en el navegador
      localStorage.setItem("sidebar-mini", isMini);
    });
  }

  // EJECUCIÓN INICIAL AL CARGAR LA PÁGINA
  aplicarEstadoSidebar();
  marcarPaginaActual();

  if (sideBar) {
    sideBar.addEventListener("click", manejarNavegacion);
  }
});
