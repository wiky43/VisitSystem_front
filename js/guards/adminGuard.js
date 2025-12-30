import { checkAuth } from "./authGuard.js";

document.addEventListener("DOMContentLoaded", () => {
  checkAuth(["Administrador"]);
});
