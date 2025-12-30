import { showSnackBar } from "../ui/snackbar.js";
import { API_BASE_URL } from "../config/config.js";
import { logout } from "./auth.js";
import { getCurrentUser } from "./auth.js";

export async function protectedFetch(endpoint, method = "GET", data = null) {
  const BASE_URL = API_BASE_URL;

  const user = getCurrentUser();

  if (!user) {
    showSnackBar("Login requerido. Información local ausente.", "error");
    logout();
    return Promise.reject(new Error("Login requerido."));
  }

  const headers = {
    "Content-Type": "application/json",
  };

  let response = null;

  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      method: method,
      headers: headers,
      body: data ? JSON.stringify(data) : null,
      credentials: "include",
    });

    if (response.status === 401 || response.status === 403) {
      showSnackBar(
        "Sesión no válida o expirada. Vuelva a iniciar sesión.",
        "error"
      );
      logout();
      throw new Error("Sesión no válida o expirada. Vuelva a iniciar sesión.");
    }

    if (!response.ok) {
      let errorMessage = `Error en la petición: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (e) {
        // Fallback if not JSON
      }
      // showSnackBar(errorMessage, "error"); // Removed to avoid double snacking if caller handles it?
      // Actually original has it inside catch? No, original threw error.
      // But auth.js had SNACKBAR inside !response.ok block.
      // We will THROW and let caller handle OR show snackbar here?
      // Default behavior: throw.
      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    // showSnackBar("Error en protectedFetch: " + error, "error"); // Too noisy?

    if (
      (response === null && error.message.includes("Failed to fetch")) ||
      error.message.includes("NetworkError")
    ) {
      showSnackBar(
        "Error de Conexión: El servidor de la API no está disponible. Verifique su red o CORS.",
        "error"
      );
      throw new Error("Network connection failed. Backend server unreachable.");
    }
    throw error;
  }
}
