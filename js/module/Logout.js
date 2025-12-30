import { logout } from "../services/auth.js";
import { protectedFetch } from "../services/apiClient.js";
import { showSnackBar, showConfirmSnackBar } from "../ui/snackbar.js";

async function handleLogoutClick() {
  showConfirmSnackBar(
    "¿Confirmar cierre de sesión?",

    async () => {
      try {
        const response = await protectedFetch("/api/Auth/logout", "POST");

        if (response && response.status === 204) {
          showSnackBar("Sesión cerrada exitosamente.", "success");
        }
      } catch (error) {
        if (
          !error.message.includes("Sesión no válida") &&
          !error.message.includes("Login requerido")
        ) {
          showSnackBar(
            "⚠️ Error en el servidor de logout. Limpieza local forzada.",
            "error"
          );
        }
      }

      setTimeout(() => {
        logout();
      }, 800);
    },
    () => {
      showSnackBar("❌ Cierre de sesión cancelado", "error");
    }
  );
}

document
  .getElementById("logout-button")
  .addEventListener("click", handleLogoutClick);
