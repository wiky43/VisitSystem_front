import { showSnackBar } from "../ui/snackbar.js";
import { protectedFetch } from "../services/apiClient.js";

/* =========================
   Inicializar modal exportar reporte (SOLO AL ABRIR)
========================= */
export const initializeReportModule = () => {
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
   Resetear modal exportar reporte
========================= */
export const resetReportModal = () => {
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = new Date()
    .toISOString()
    .split("T")[0];
};

/* =========================
   Eventos
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const openModalBtn = document.getElementById("openReportModal");
  const closeModalBtn = document.getElementById("closeModal");
  const modalOverlay = document.getElementById("reportModal");

  // Abrir modal
  openModalBtn.addEventListener("click", () => {
    modalOverlay.classList.add("active");
    initializeReportModule();
  });

  // Cerrar con X
  closeModalBtn.addEventListener("click", () => {
    modalOverlay.classList.remove("active");
    resetReportModal();
  });

  // Cerrar haciendo clic fuera
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove("active");
      resetReportModal();
    }
  });
});

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
