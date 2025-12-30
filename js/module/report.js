import { protectedFetch } from "../services/apiClient.js";
import { checkAuth } from "../guards/authGuard.js";
import { showSnackBar } from "../ui/snackbar.js";

/* =========================
   Seguridad
========================= */
if (!checkAuth(["Administrador"])) {
  throw new Error("Acceso no autorizado. Redirigiendo...");
}

/* =========================
   Descargar archivo
========================= */
const fetchReportFile = async (format, startDate, endDate) => {
  const params = new URLSearchParams({
    format,
    startDate,
    endDate,
  });

  const url = `/api/reports/download?${params.toString()}`;

  const response = await protectedFetch(url, "GET", null, {
    responseType: "blob",
    headers: {
      Accept:
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });

  if (!response.ok) {
    showSnackBar("No se pudo generar el reporte", "error");
    throw new Error("Error en la descarga");
  }

  return response;
};

/* =========================
   Procesar descarga
========================= */
const processFileDownload = async (response, format) => {
  const contentDisposition = response.headers.get("Content-Disposition");
  let fileName = `reporte_visitas.${format}`;

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]*)"?/i);
    if (match?.[1]) fileName = match[1];
  }

  const blob = await response.blob();
  const href = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.style.display = "none";
  a.href = href;
  a.download = fileName;

  document.body.appendChild(a);
  a.click();

  window.URL.revokeObjectURL(href);
  document.body.removeChild(a);

  showSnackBar(`✅ Reporte (${fileName}) descargado con éxito.`, "success");
};

/* =========================
   Exportar
========================= */
const handleExport = async (format) => {
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const btnExcel = document.getElementById("btn-export-excel");
  const btnPdf = document.getElementById("btn-export-pdf");

  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  if (!startDate || !endDate) {
    showSnackBar("Selecciona ambas fechas.", "error");
    return;
  }

  if (new Date(startDate) > new Date(endDate)) {
    showSnackBar(
      "La fecha de inicio no puede ser posterior a la fecha de fin.",
      "error"
    );
    return;
  }

  btnExcel.disabled = true;
  btnPdf.disabled = true;

  showSnackBar(`⏳ Generando reporte en ${format.toUpperCase()}...`);

  try {
    const response = await fetchReportFile(format, startDate, endDate);
    await processFileDownload(response, format);
  } catch (error) {
    console.error(error);
    showSnackBar("❌ Error al generar el reporte.", "error");
  } finally {
    btnExcel.disabled = false;
    btnPdf.disabled = false;
  }
};

/* =========================
   Inicializar modal (SOLO AL ABRIR)
========================= */
const initializeReportModule = () => {
  const endDateInput = document.getElementById("endDate");
  const btnExportExcel = document.getElementById("btn-export-excel");
  const btnExportPdf = document.getElementById("btn-export-pdf");

  if (!endDateInput.value) {
    endDateInput.value = new Date().toISOString().split("T")[0];
  }

  showSnackBar(
    "Selecciona un rango de fechas y haz clic en exportar.",
    "success"
  );

  btnExportExcel.onclick = () => handleExport("xlsx");
  btnExportPdf.onclick = () => handleExport("pdf");
};

/* =========================
   Resetear modal al cerrar
========================= */
const resetReportModal = () => {
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = new Date()
    .toISOString()
    .split("T")[0];
};

/* =========================
   Eventos 
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadAllVisitors(); // 👈 ESTA ES LA CLAVE

  const modal = document.getElementById("reportModal");
  if (modal) {
    modal.addEventListener("shown.bs.modal", initializeReportModule);
    modal.addEventListener("hidden.bs.modal", resetReportModal);
  }
});

export const loadAllVisitors = async () => {
  const tableBody = document.getElementById("AllvisitorsTableBody");
  const loadingDiv = document.getElementById("loading");
  const errorDiv = document.getElementById("error-msg");

  if (!tableBody || !loadingDiv || !errorDiv) return;

  loadingDiv.style.display = "block";
  tableBody.innerHTML = "";
  errorDiv.style.display = "none";

  try {
    const response = await protectedFetch("/api/Visitantes/historial", "GET");

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
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        second: "2-digit",
        minute: "2-digit",
        hour12: true,
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
        <td>${formattedDate}</td>
        <td>${visitor.codigo}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error al cargar visitantes:", error);
    errorDiv.style.display = "block";
    errorDiv.textContent = "Error al cargar visitantes.";
  }
};
