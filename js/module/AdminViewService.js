const configurarBotonReportes = () => {
  const botonNavegacion = document.getElementById("btn-reportes");

  if (botonNavegacion) {
    botonNavegacion.addEventListener("click", () => {
      window.location.href = "pages/Admin_View/report.html";
    });
  }
};
document.addEventListener("DOMContentLoaded", configurarBotonReportes);

const configurarBotonUsuarios = () => {
  const botonNavegacion = document.getElementById("btn-usuarios");

  if (botonNavegacion) {
    botonNavegacion.addEventListener("click", () => {
      window.location.href = "pages/Admin_View/User.html";
    });
  }
};
document.addEventListener("DOMContentLoaded", configurarBotonUsuarios);

const configurarBotonHome = () => {
  const botonNavegacion = document.getElementById("btn-home");

  if (botonNavegacion) {
    botonNavegacion.addEventListener("click", () => {
      window.location.href = "pages/Admin_View/dashboar_admin.html";
    });
  }
};
document.addEventListener("DOMContentLoaded", configurarBotonHome);
