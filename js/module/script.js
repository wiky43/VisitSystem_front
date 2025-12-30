import { protectedFetch } from "../services/apiClient.js";
import { showSnackBar, showConfirmSnackBar } from "../ui/snackbar.js";
import { loadVisitors } from "./visitors.js";
import {
  buscarEmpleado,
  buscarDepartamento,
  cargarDepartamentoPorEmpleado,
} from "./AutoComplete.js";

window.buscarEmpleado = buscarEmpleado;
window.buscarDepartamento = buscarDepartamento;
window.cargarDepartamentoPorEmpleado = cargarDepartamentoPorEmpleado;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("visitorForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const data = {
      Nombre: formData.get("nombre"),
      Cedula: formData.get("cedula"),
      Empresa: formData.get("empresa"),
      Visitado: formData.get("visitado"),
      Motivo: formData.get("motivo"),
      Departamento: formData.get("departamento"),
    };

    console.group("Debug: Verificación de Datos");
    console.log("Payload a enviar:", data);

    const missingFields = [];
    for (const [key, value] of Object.entries(data)) {
      if (!value || value.toString().trim() === "") {
        missingFields.push(key);
      }
    }

    if (missingFields.length > 0) {
      const fieldsText = missingFields.join(", ");
      showSnackBar(
        `Validación fallida. Campos faltantes: ${fieldsText}`,
        "error"
      );

      return;
    }

    showSnackBar("✅ Validación exitosa. Enviando datos...", "success");

    const btn = form.querySelector(".btn-submit");
    const originalText = btn.innerText;
    btn.innerText = "Enviando...";

    try {
      const result = await protectedFetch(
        "/api/Visitantes/registrar",
        "POST",
        data
      );
      loadVisitors();
      console.log("Success:", result);

      btn.innerText = "¡Registrado!";
      btn.style.background = "linear-gradient(135deg, #22c55e, #16a34a)";

      showSnackBar(
        "✅ Visita registrada exitosamente en el sistema.",
        "success"
      );

      form.reset();
      setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "";
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      btn.innerText = "Error";
      btn.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
      showSnackBar(
        "Hubo un error al registrar la visita. Detalles: " + error.message,
        "error"
      );

      setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "";
      }, 2000);
    }
  });
});
