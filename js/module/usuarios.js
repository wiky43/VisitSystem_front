import { protectedFetch } from "../services/apiClient.js";
import { showSnackBar } from "../ui/snackbar.js";

// ===========================
// INIT TABLA USUARIOS
// ===========================
export const initUsersTable = () => {
  const tableBody = document.getElementById("tablaUsuariosBody");
  if (!tableBody) return;

  tableBody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const row = btn.closest("tr");
    if (!row) return;

    const { id, username } = row.dataset;

    if (btn.dataset.action === "edit") {
      handleEdit(id);
    }

    if (btn.dataset.action === "delete") {
      handleDelete(id, username);
    }
  });
};

// ===========================
// CARGAR USUARIOS
// ===========================
export const loadUsers = async () => {
  const tableBody = document.getElementById("tablaUsuariosBody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  try {
    const response = await protectedFetch("/api/users", "GET");

    if (!response.ok) {
      showSnackBar(`Error ${response.status}`, "error");
      return;
    }

    const users = await response.json();

    if (!users.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="empty-message">
            No hay usuarios registrados
          </td>
        </tr>`;
      return;
    }

    users.forEach((u) => {
      const row = document.createElement("tr");

      row.dataset.id = u.id;
      row.dataset.username = u.username;
      row.dataset.role = u.role;

      row.innerHTML = `
        <td>${u.id}</td>
        <td><strong>${u.username}</strong></td>
        <td>
          <span class="role-badge ${
            u.role === "Administrador" ? "role-admin" : "role-user"
          }">${u.role}</span>
        </td>
        <td class="actions-cell">
  <button data-action="edit" class="btn-edit">
    <i class="fas fa-edit"></i> Editar
  </button>
  <button data-action="delete" class="btn-delete">
    <i class="fas fa-trash"></i> Eliminar
  </button>
</td>
      `;

      tableBody.appendChild(row);
    });
  } catch {
    showSnackBar("Error al cargar usuarios", "error");
  }
};

// ===========================
// ACCIONES INTERNAS
// ===========================
function handleEdit(id) {
  abrirModal(id);
}

async function handleDelete(id, name) {
  showConfirmSnackBar(`¿Eliminar al usuario "${name}"?`, () => {});

  try {
    const response = await protectedFetch(`/api/users/${id}`, "DELETE");

    if (response.ok) {
      showSnackBar("Usuario eliminado correctamente", "success");
      loadUsers();
    } else {
      showSnackBar("No se pudo eliminar el usuario", "error");
    }
  } catch (error) {
    showSnackBar("Error al eliminar:", error);
  }
}

// ==========================================
// FILTRO DE BÚSQUEDA CORREGIDO
// ==========================================
document.getElementById("inputBusqueda")?.addEventListener("input", (e) => {
  const texto = e.target.value.toLowerCase().trim();
  // Seleccionamos solo las filas de datos reales, ignorando el mensaje de error si existe
  const filas = document.querySelectorAll(
    "#tablaUsuariosBody tr:not(#sinResultados)"
  );
  let coincidencias = 0;

  // Si el buscador está vacío, mostramos todo y eliminamos el mensaje de error inmediatamente
  if (texto === "") {
    filas.forEach((f) => (f.style.display = ""));
    gestionarMensajeVacio(false);
    return;
  }

  // Filtrado lógico
  filas.forEach((fila) => {
    // Buscamos coincidencia en todo el texto de la fila (Nombre y Rol)
    const contenidoFila = fila.textContent.toLowerCase();

    if (contenidoFila.includes(texto)) {
      fila.style.display = "";
      coincidencias++;
    } else {
      fila.style.display = "none";
    }
  });

  // Solo mostrar el mensaje si NO hay coincidencias
  gestionarMensajeVacio(coincidencias === 0);
});

// Función para insertar o remover el mensaje de "No hay resultados"
const gestionarMensajeVacio = (mostrar) => {
  const tablaBody = document.getElementById("tablaUsuariosBody");
  const mensajeExistente = document.getElementById("sinResultados");

  if (mostrar) {
    if (!mensajeExistente) {
      const tr = document.createElement("tr");
      tr.id = "sinResultados";
      tr.innerHTML = `
                <td colspan="4" style="text-align:center; padding:40px; color: #64748b; background: #fff;">
                    <div style="display:flex; flex-direction:column; align-items:center; gap:10px;">
                        <i class="material-symbols-outlined" style="font-size: 48px; opacity:0.5;">person_search</i>
                        <span style="font-weight:500;">No se encontraron usuarios que coincidan.</span>
                    </div>
                </td>`;
      tablaBody.appendChild(tr);
    }
  } else {
    // Esta es la parte clave: si 'mostrar' es false, borramos el mensaje
    mensajeExistente?.remove();
  }
};
