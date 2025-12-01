import { protectedFetch } from "./apiClient.js";

document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("fecha");
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;

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
      console.error("Validación fallida. Campos faltantes:", missingFields);
      console.groupEnd();
      alert(
        `Por favor complete los siguientes campos: ${missingFields.join(", ")}`
      );
      return;
    }

    console.log("✅ Validación exitosa. Enviando datos...");
    console.groupEnd();

    const btn = form.querySelector(".btn-submit");
    const originalText = btn.innerText;
    btn.innerText = "Enviando...";

    try {
      const result = await protectedFetch(
        "/visitantes/registrar",
        "POST",
        data
      );

      console.log("Success:", result);

      btn.innerText = "¡Registrado!";
      btn.style.background = "linear-gradient(135deg, #22c55e, #16a34a)";

      alert("Visita registrada exitosamente en el sistema.");

      // Reset form
      form.reset();
      dateInput.value = today;

      setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "";
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      btn.innerText = "Error";
      btn.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
      alert("Hubo un error al registrar la visita. Detalles: " + error.message);

      setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "";
      }, 2000);
    }
  });
});
