// visitors.js

import { protectedFetch } from "../services/apiClient.js";
import { showSnackBar, showConfirmSnackBar } from "../ui/snackbar.js";

export const loadVisitors = async () => {
  const tableBody = document.getElementById("visitorsTableBody");
  const loadingDiv = document.getElementById("loading");
  const errorDiv = document.getElementById("error-msg");

  if (!tableBody || !loadingDiv || !errorDiv) return;

  loadingDiv.style.display = "block";
  tableBody.innerHTML = "";
  errorDiv.style.display = "none";

  try {
    const response = await protectedFetch("/api/Visitantes/pendientes", "GET");

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }

    const visitors = await response.json();
    console.log("Datos recibidos de la API:", visitors);
    loadingDiv.style.display = "none";

    if (!visitors || visitors.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="25"  style="text-align: center;">No hay visitantes activos.</td></tr>';
      return;
    }

    // Limpiar antes de rellenar
    tableBody.innerHTML = "";
    visitors.forEach((visitor) => {
      const row = document.createElement("tr");
      const entryDate = new Date(visitor.horaEntrada);
      const formattedDate = entryDate.toLocaleString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      row.innerHTML = `
        <td>${visitor.nombreVisitante}</td> 
        <td>${visitor.cedulaVisitante}</td>
        <td>${visitor.empresaVisitante}</td>
        <td>${visitor.visitado}</td>
        <td>${formattedDate}</td>
        <td>${visitor.codigo}</td>
        <td>
          <button class="btn-exit" data-id="${visitor.id}">Salida</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    document.querySelectorAll(".btn-exit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        showConfirmSnackBar(
          "¿Confirmar salida del visitante?",
          async () => {
            const response = await registerExit(id);

            if (response && response.status === 204) {
              showSnackBar("Salida registrada exitosamente.", "success");
              setTimeout(() => {
                showSnackBar(
                  "Recuerda devolverle la cedula al visitante",
                  "success"
                );
                loadVisitors();
              }, 1000);
            } else {
              showSnackBar(
                `Error al registrar la salida: ${
                  response ? response.status : "Error de red"
                }.`,
                "error"
              );
            }
          },
          () => {
            showSnackBar("❌ Salida cancelada", "error");
          }
        );
      });
    });
  } catch (error) {
    showSnackBar(
      "Error al cargar visitantes: " + (error.message || "Error desconocido"),
      "error"
    );
  }
};

export const loadVisitorsP = async () => {
  const tableBody = document.getElementById("visitorsTableBodyP");
  const loadingDiv = document.getElementById("loading");
  const errorDiv = document.getElementById("error-msg");

  if (!tableBody || !loadingDiv || !errorDiv) return;

  loadingDiv.style.display = "block";
  tableBody.innerHTML = "";
  errorDiv.style.display = "none";

  try {
    const response = await protectedFetch("/api/Visitantes/pendientes", "GET");

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }

    const visitors = await response.json();
    console.log("Datos recibidos de la API:", visitors);
    loadingDiv.style.display = "none";

    if (!visitors || visitors.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="25"  style="text-align: center;">No hay visitantes activos.</td></tr>';
      return;
    }

    // Limpiar antes de rellenar
    tableBody.innerHTML = "";
    visitors.forEach((visitor) => {
      const row = document.createElement("tr");
      const entryDate = new Date(visitor.horaEntrada);
      const formattedDate = entryDate.toLocaleString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      row.innerHTML = `
        <td>${visitor.nombreVisitante}</td> 
        <td>${visitor.cedulaVisitante}</td>
        <td>${visitor.empresaVisitante}</td>
        <td>${visitor.visitado}</td>
        <td>${visitor.departamento}</td>
        <td>${visitor.motivo}</td>
        <td>${formattedDate}</td>
        <td>${visitor.codigo}</td>
        <td>
          <button class="btn-exit" data-id="${visitor.id}">Salida</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    document.querySelectorAll(".btn-exit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        showConfirmSnackBar(
          "¿Confirmar salida del visitante?",
          async () => {
            const response = await registerExit(id);

            if (response && response.status === 204) {
              showSnackBar("Salida registrada exitosamente.", "success");
              setTimeout(() => {
                showSnackBar(
                  "Recuerda devolverle la cedula al visitante",
                  "success"
                );
                loadVisitors();
              }, 1000);
            } else {
              showSnackBar(
                `Error al registrar la salida: ${
                  response ? response.status : "Error de red"
                }.`,
                "error"
              );
            }
          },
          () => {
            showSnackBar("❌ Salida cancelada", "error");
          }
        );
      });
    });
  } catch (error) {
    console.error("Error loading visitors:", error);
    showSnackBar(
      "Error al cargar visitantes: " + (error.message || "Error desconocido"),
      "error"
    );
  }
};

const registerExit = async (id) => {
  try {
    const response = await protectedFetch(
      `/api/Visitantes/registrarSalida/${id}`,
      "PUT"
    );

    return response;
  } catch (error) {
    console.error("Error registering exit:", error);

    showSnackBar(
      "Error al registrar salida: " + (error.message || "Error desconocido"),
      "error"
    );
    return { status: 500, statusText: "Network Error" };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("visitorsTableBody")) {
    loadVisitors();
  }

  if (document.getElementById("visitorsTableBodyP")) {
    loadVisitorsP();
  }
});
