// users.js (refactor)
import { protectedFetch } from "../services/apiClient.js";
import { checkAuth } from "../guards/authGuard.js";
import { showSnackBar, showConfirmSnackBar } from "../ui/snackbar.js";

// --- Protección de Acceso ---
if (!checkAuth(["Administrador"])) {
  throw new Error("Acceso no autorizado. Redirigiendo...");
}

const API_URL = "/api/users";
let userModal;

// ---------------------------
// Init
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  const modalElement = document.getElementById("userModal");
  if (modalElement && window.bootstrap) {
    userModal = new bootstrap.Modal(modalElement);
  }

  document
    .getElementById("btnNuevoUsuario")
    ?.addEventListener("click", () => abrirModal());

  document
    .getElementById("btnGuardarUsuario")
    ?.addEventListener("click", guardarUsuario);

  // Delegación de eventos para botones dinámicos
  document
    .getElementById("tablaUsuarios")
    ?.addEventListener("click", onTableClick);

  loadUsers();
});

// ---------------------------
// READ
// ---------------------------
export const loadUsers = async () => {
  const tableBody = document.getElementById("tablaUsuarios");
  const loadingDiv = document.getElementById("loadingUsers");
  const errorDiv = document.getElementById("error-msg-users");

  if (!tableBody || !loadingDiv || !errorDiv) return;

  loadingDiv.style.display = "block";
  tableBody.innerHTML = "";
  errorDiv.style.display = "none";

  try {
    const response = await protectedFetch(API_URL, "GET");
    if (!response.ok) throw new Error(`${response.status}`);

    const users = await response.json();
    loadingDiv.style.display = "none";

    if (!users?.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-muted">
            No hay usuarios registrados.
          </td>
        </tr>`;
      return;
    }

    tableBody.innerHTML = "";
    users.forEach((u) => {
      const tr = document.createElement("tr");
      tr.dataset.id = u.id;
      tr.dataset.username = u.username;
      tr.dataset.role = u.role;

      const tdId = document.createElement("td");
      tdId.textContent = u.id;
      tr.appendChild(tdId);

      const tdUser = document.createElement("td");
      const strongUser = document.createElement("strong");
      strongUser.textContent = u.username;
      tdUser.appendChild(strongUser);
      tr.appendChild(tdUser);

      const tdRole = document.createElement("td");
      const spanRole = document.createElement("span");
      spanRole.className = `badge ${
        u.role === "Administrador" ? "bg-secondary" : "bg-success"
      }`;
      spanRole.textContent = u.role;
      tdRole.appendChild(spanRole);
      tr.appendChild(tdRole);

      const tdActions = document.createElement("td");
      tdActions.className = "text-end";

      const btnEdit = document.createElement("button");
      btnEdit.className = "btn btn-sm btn-Edit me-2";
      btnEdit.dataset.action = "edit";
      btnEdit.textContent = "Editar";
      btnEdit.innerHTML = `<i class="material-symbols-outlined"> edit </i> Editar`;
      tdActions.appendChild(btnEdit);

      const btnDelete = document.createElement("button");
      btnDelete.className = "btn btn-sm btn-Delete";
      btnDelete.dataset.action = "delete";
      btnDelete.textContent = "Eliminar";
      btnDelete.innerHTML = `<i class="material-symbols-outlined"> delete </i> Eliminar`;
      tdActions.appendChild(btnDelete);

      tr.appendChild(tdActions);
      tableBody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
    loadingDiv.style.display = "none";
    errorDiv.style.display = "block";
    errorDiv.textContent = "Error al cargar usuarios. Verifica tus permisos.";
    showSnackBar("Error al cargar usuarios", "error");
  }
};

// ---------------------------
// TABLE EVENTS
// ---------------------------
const onTableClick = (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const row = btn.closest("tr");
  const { id, username, role } = row.dataset;

  if (btn.dataset.action === "edit") {
    abrirModal(id, username, role);
  }

  if (btn.dataset.action === "delete") {
    confirmDelete(id, username);
  }
};

// ---------------------------
// MODAL
// ---------------------------
const abrirModal = (id = null, username = "", role = "") => {
  const form = document.getElementById("userForm");
  if (!form) return;

  form.reset();
  form.userId.value = id || "";
  form.username.value = username;
  form.role.value = role;
  form.password.value = "";

  document.getElementById("modalTitle").textContent = id
    ? "Editar Usuario"
    : "Registrar Usuario";

  document.getElementById("passHelp").textContent = id
    ? "Opcional."
    : "Obligatorio.";

  userModal?.show();
};

// ---------------------------
// CREATE / UPDATE
// ---------------------------
const guardarUsuario = async () => {
  const id = document.getElementById("userId").value;
  const username = document.getElementById("username").value.trim();
  const role = document.getElementById("role").value;
  const password = document.getElementById("password").value;

  if (!username || !role)
    return showSnackBar("Completa el nombre y el rol", "warning");

  if (!id && !password)
    return showSnackBar(
      "La contraseña es obligatoria para nuevos usuarios",
      "warning"
    );

  const payload = { username, role };
  if (password) {
    payload.password = password;
  }
  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/${id}` : API_URL;

  try {
    const response = await protectedFetch(url, method, payload);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Error al guardar");
    }

    userModal?.hide();
    showSnackBar(`Usuario ${id ? "actualizado" : "creado"}`, "success");
    loadUsers();
  } catch (error) {
    console.error(error);
    showSnackBar(error.message || "Error de red", "error");
  }
};

// ---------------------------
// DELETE
// ---------------------------
const confirmDelete = (id, username) => {
  showConfirmSnackBar(
    `¿Eliminar usuario ${username}?`,
    async () => {
      try {
        const response = await protectedFetch(`${API_URL}/${id}`, "DELETE");
        if (response.status === 204) {
          showSnackBar("Usuario eliminado", "success");
          loadUsers();
        } else {
          throw new Error(`Status ${response.status}`);
        }
      } catch (error) {
        console.error(error);
        showSnackBar("Error al eliminar usuario", "error");
      }
    },
    () => showSnackBar("Eliminación cancelada", "info")
  );
};
