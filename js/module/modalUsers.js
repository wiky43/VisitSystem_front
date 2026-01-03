import { showSnackBar, showConfirmSnackBar } from "../ui/snackbar.js";
import { protectedFetch } from "../services/apiClient.js";
import { loadUsers } from "./usuarios.js";

// Verifica que la ruta sea correcta (mayúsculas/minúsculas)

// ===========================
// CONFIG
// ===========================
const API_ENDPOINT = "/api/users";

// ===========================
// DOM
// ===========================
let modal;
let btnNuevoUsuario;
let btnGuardarUsuario;
let btnCerrarModal;
let btnCancelarModal;
let tablaBody;

// ===========================
// INIT
// ===========================
export const initUserModal = () => {
  modal = document.getElementById("userModal");
  btnNuevoUsuario = document.getElementById("btnNuevoUsuario");
  btnGuardarUsuario = document.getElementById("btnGuardarUsuario");
  btnCerrarModal = document.getElementById("closeModal");
  btnCancelarModal = document.getElementById("btnCancelarModal");
  tablaBody = document.getElementById("tablaUsuariosBody");

  btnNuevoUsuario?.addEventListener("click", () => abrirModal());
  btnGuardarUsuario?.addEventListener("click", guardarUsuario);
  btnCerrarModal?.addEventListener("click", cerrarModal);
  btnCancelarModal?.addEventListener("click", cerrarModal);

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
      cerrarModal();
    }
  });

  tablaBody?.addEventListener("click", onTableClick);
};

// ===========================
// LÓGICA DEL MODAL
// ===========================
const abrirModal = (id = "", username = "", role = "") => {
  resetModal();

  document.getElementById("userId").value = id;
  document.getElementById("username").value = username;
  document.getElementById("role").value = role || "Recepcionista";

  document.getElementById("modalTitle").textContent = id
    ? "Editar Usuario"
    : "Registrar Usuario";

  modal.classList.remove("hidden");
};

const cerrarModal = () => {
  if (modal) modal.classList.add("hidden");
  resetModal();
};

const resetModal = () => {
  document.getElementById("userId").value = "";
  document.getElementById("username").value = "";
  document.getElementById("role").value = "Recepcionista";
  document.getElementById("password").value = "";
};

// ===========================
// GUARDAR / ACTUALIZAR
// ===========================
const guardarUsuario = async () => {
  // Obtenemos los valores correctamente
  const id = document.getElementById("userId").value;
  const username = document.getElementById("username").value.trim();
  const role = document.getElementById("role").value;
  const password = document.getElementById("password").value;

  // Validaciones
  if (!username) {
    return showSnackBar("El nombre de usuario es requerido", "warning");
  }

  if (!id && !password) {
    return showSnackBar(
      "La contraseña es obligatoria para nuevos usuarios",
      "warning"
    );
  }

  const payload = { username, role };
  if (password) payload.password = password;

  try {
    const url = id ? `${API_ENDPOINT}/${id}` : API_ENDPOINT;
    const method = id ? "PUT" : "POST";

    const response = await protectedFetch(url, method, payload);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error en la petición");
    }

    showSnackBar(
      id ? "Usuario actualizado:" + username : "Usuario creado:" + username,
      "success"
    );
    cerrarModal();
    loadUsers();
  } catch (error) {
    console.error("Error al guardar:", error);
    showSnackBar(error.message || "Error al procesar la solicitud", "error");
  }
};

// ===========================
// ACCIONES DE TABLA
// ===========================
const onTableClick = (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const row = btn.closest("tr");
  const { id, username, role } = row.dataset;

  if (btn.dataset.action === "edit") {
    abrirModal(id, username, role);
  }

  if (btn.dataset.action === "delete") {
    showConfirmSnackBar(
      `¿Estás seguro de eliminar a ${username}?`,
      async () => {
        try {
          const response = await protectedFetch(
            `${API_ENDPOINT}/${id}`,
            "DELETE"
          );
          if (response.ok) {
            showSnackBar("Usuario eliminado", "success");
            loadUsers();
          } else {
            throw new Error();
          }
        } catch {
          showSnackBar("No se pudo eliminar el usuario", "error");
        }
      }
    );
  }
};
