import { checkAuth } from "../guards/authGuard.js";
import { showSnackBar } from "../ui/snackbar.js";

import "../module/Logout.js";
import "../module/modalReport.js";
import "../module/asideService.js";

import { loadAllVisitors } from "../module/report.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth(["Administrador"])) {
    showSnackBar("Acceso no autorizado", "error");
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 1500);
    return;
  }

  loadAllVisitors();
});
