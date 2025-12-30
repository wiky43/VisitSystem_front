// js/module/Logout.js
import { logout } from "../services/auth.js";
import { protectedFetch } from "../services/apiClient.js";
import { showSnackBar, showConfirmSnackBar } from "../ui/snackbar.js";

async function handleLogoutClick() {
  showConfirmSnackBar(
    "¿Confirmar cierre de sesión?",
    async () => {
      try {
        // Asegúrate de que tu backend use esta ruta exacta o ajusta según apiClient
        const response = await protectedFetch("/api/Auth/logout", "POST");

        if (response && response.status === 204) {
          showSnackBar("Sesión cerrada exitosamente.", "success");
        }
      } catch (error) {
        // Si el error es de sesión ya expirada, no asustamos al usuario
        if (
          !error.message.includes("Sesión no válida") &&
          !error.message.includes("Login requerido")
        ) {
          showSnackBar(
            "⚠️ Error en el servidor. Limpieza local forzada.",
            "error"
          );
        }
      }

      // Redirección después de un breve delay para que se vea el SnackBar
      setTimeout(() => {
        logout(); // Esta función debe hacer el localStorage.clear() y window.location.href
      }, 800);
    },
    () => {
      // Opcional: Solo mostrar si realmente quieres confirmar la cancelación
      showSnackBar("❌ Cierre de sesión cancelado", "info");
    }
  );
}

// Inicialización segura
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogoutClick);
  }
});
