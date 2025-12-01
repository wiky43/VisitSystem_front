const getCurrentUser = () => {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
};

export const logout = () => {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
};

export async function protectedFetch(endpoint, method = "GET", data = null) {
  const BASE_URL = "https://localhost:7056/api";

  const user = getCurrentUser();
  const token = user ? user.token : null;

  if (!token) {
    console.error("Token no encontrado. Forzando logout.");
    logout();
    return Promise.reject(new Error("No token available. Login required."));
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  let response = null;

  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      method: method,
      headers: headers,
      body: data ? JSON.stringify(data) : null,
    });

    if (response.status === 401 || response.status === 403) {
      console.error(
        "Error 401/403: Token inválido o expirado. Forzando re-login."
      );
      logout();
      throw new Error("Sesión no válida o expirada. Vuelva a iniciar sesión.");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Error en la petición: ${response.status}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error en protectedFetch:", error);

    if (response === null) {
      alert(
        "Error de Conexión: El servidor de la API no está disponible. Verifique su red o CORS."
      );
      throw new Error("Network connection failed. Backend server unreachable.");
    }

    throw error;
  }
}
