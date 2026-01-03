import { protectedFetch } from "../services/apiClient.js";
import { showSnackBar } from "../ui/snackbar.js";

// =========================
// Cargar todos los visitantes
// =========================
export const loadAllVisitors = async () => {
  const tableBody = document.getElementById("AllvisitorsTableBody");
  if (!tableBody) return;
  tableBody.innerHTML = "";
  try {
    const response = await protectedFetch("/api/Visitantes/historial", "GET");

    if (!response.ok) {
      showSnackBar(
        `Error HTTP: ${response.status} ${response.statusText}`,
        "error"
      );
      return;
    }

    const visitors = await response.json();
    if (!visitors || visitors.length === 0) {
      showSnackBar("No hay datos en el historial.", "error");
      return;
    }

    // Limpiar antes de rellenar
    tableBody.innerHTML = "";
    visitors.forEach((visitor) => {
      const row = document.createElement("tr");
      const entryDate = new Date(visitor.horaEntrada);
      const salidaDate = new Date(visitor.horaSalida);
      const formattedDate = entryDate.toLocaleString("es-ES", {
        hour: "2-digit",
        second: "2-digit",
        minute: "2-digit",
        hour12: true,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const formattedDateSalida = salidaDate.toLocaleString("es-ES", {
        hour: "2-digit",
        second: "2-digit",
        minute: "2-digit",
        hour12: true,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      row.innerHTML = `
        <td>${visitor.nombreVisitante}</td> 
        <td>${visitor.cedulaVisitante}</td>
        <td>${visitor.empresaVisitante}</td>
        <td>${visitor.visitado}</td>
        <td>${visitor.departamento}</td>
        <td>${visitor.motivo}</td>
        <!--  hora de entrada -->
        <td>${formattedDate}</td>
        <!--  hora de salida -->
        <td>${formattedDateSalida}</td>
        <td>${visitor.codigo}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    setTimeout(() => {
      showSnackBar("Error al cargar datos del Historial!", "error");
    }, 5000);
  }
};

// ==========================================
// FILTRO DE BÚSQUEDA
// ==========================================
document.getElementById("inputBusqueda")?.addEventListener("input", (e) => {
  const texto = e.target.value.toLowerCase().trim();
  // Seleccionamos solo las filas de datos reales, ignorando el mensaje de error si existe
  const filas = document.querySelectorAll(
    "#AllvisitorsTableBody tr:not(#sinResultados)"
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
    // Seleccionamos la primera celda (ajusta el índice [0] si el nombre está en otra columna)
    const celdaNombre = fila.getElementsByTagName("td")[0];
    const textoNombre = celdaNombre
      ? celdaNombre.textContent.toLowerCase()
      : "";

    if (textoNombre.includes(texto)) {
      fila.style.display = "";
      coincidencias++;
    } else {
      fila.style.display = "none";
    }
  });
  gestionarMensajeVacio(coincidencias === 0);
});

const gestionarMensajeVacio = (mostrar) => {
  const tablaBody = document.getElementById("AllvisitorsTableBody");
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
