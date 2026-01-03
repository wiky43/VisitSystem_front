import { checkAuth } from "../guards/authGuard.js";
import { showSnackBar } from "../ui/snackbar.js";

import "../module/Logout.js";
import "../module/asideService.js";

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth(["Administrador"])) {
    showSnackBar("Acceso no autorizado", "error");
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 1500);
    return;
  }
});
