import { showSnackBar } from "../ui/snackbar.js";
import { protectedFetch } from "../services/apiClient.js";
let debounceTimer;

// 🔍 Debounce genérico para cualquier tipo de búsqueda
// No exportado, es una función interna.
function debounce(fn, delay = 300) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fn, delay);
}

// 🔎 Autocompletar empleados
export function buscarEmpleado(texto) {
  debounce(() => ejecutarBusquedaEmpleado(texto));
}

// 🔎 Autocompletar departamentos
export function buscarDepartamento(texto) {
  debounce(() => ejecutarBusquedaDepartamento(texto));
}

/* ============================================================
    BUSCAR EMPLEADOS
    ============================================================ */
function ejecutarBusquedaEmpleado(termino) {
  const lista = document.getElementById("listaVisitados");
  lista.innerHTML = "";

  // Mantenemos el límite de 3 caracteres para optimizar
  if (termino.length < 3) return;

  protectedFetch(`/api/empleados/buscar?q=${encodeURIComponent(termino)}`)
    .then((response) => response.json())
    .then((empleados) => {
      empleados.forEach((emp) => {
        const option = document.createElement("option");
        option.value = emp.nombreCompleto;
        option.dataset.id = emp.id;
        option.dataset.depto = emp.departamento;
        lista.appendChild(option);
      });
    })
    .catch((error) => {
      showSnackBar("Error al buscar empleados:", error);
    });
}

/* ============================================================
    BUSCAR DEPARTAMENTOS
    ============================================================ */
function ejecutarBusquedaDepartamento(termino) {
  const lista = document.getElementById("listaDepartamentos");
  lista.innerHTML = "";

  if (termino.length < 2) return;

  protectedFetch(`/api/departamentos/buscar?q=${encodeURIComponent(termino)}`)
    .then((response) => response.json())
    .then((departamentos) => {
      departamentos.forEach((dep) => {
        const option = document.createElement("option");
        option.value = dep;
        lista.appendChild(option);
      });
    })
    .catch((error) => {
      showSnackBar("Error al buscar departamentos:", error);
    });
}

/* ============================================================
    CUANDO SE SELECCIONA O ESCRIBE EL EMPLEADO (MEJORADO)
    ============================================================ */
export function cargarDepartamentoPorEmpleado(nombre) {
  const inputDepto = document.getElementById("departamento");
  const options = document.getElementById("listaVisitados").options;

  // --- ACCESO AL BOTÓN ---
  const submitButton = document.querySelector(".btn-submit"); // Asume que solo hay uno

  // 1. Búsqueda rápida en el DOM (Opción más eficiente)
  for (let opt of options) {
    if (opt.value === nombre) {
      inputDepto.value = opt.dataset.depto || "";
      if (submitButton) submitButton.disabled = false; // Asegurar que esté habilitado
      return;
    }
  }

  // 2. FALLBACK AJAX (Si no se encontró en el DOM)
  if (nombre.trim()) {
    inputDepto.value = "Buscando...";
    if (submitButton) submitButton.disabled = true;

    protectedFetch(`/api/empleado/info?nombre=${encodeURIComponent(nombre)}`)
      .then((response) => {
        if (response.status === 404) return null;
        if (!response.ok) throw new Error("Error de red o servidor.");
        return response.json();
      })
      .then((empleadoInfo) => {
        if (empleadoInfo && empleadoInfo.departamento) {
          inputDepto.value = empleadoInfo.departamento;
          inputDepto.readOnly = true;
        } else {
          inputDepto.value = "No encontrado"; // Mensaje claro
          showSnackBar("Empleado no válido o no encontrado.", "warning");
          inputDepto.readOnly = false;
        }
      })
      .catch((error) => {
        console.error("Error de búsqueda:", error);
        showSnackBar(
          "Este empleado no existe o no tiene departamento.",
          "error"
        );
        inputDepto.readOnly = false;
      })
      .finally(() => {
        if (submitButton) submitButton.disabled = false;
      });
  } else {
    inputDepto.value = "";
    if (submitButton) submitButton.disabled = false;
  }
}
