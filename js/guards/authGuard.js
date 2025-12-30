export const checkAuth = (allowedRoles = []) => {
  const user = getCurrentUser();

  if (!user?.username) {
    window.location.href = "index.html";
    return false;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.map((r) => r.toLowerCase()).includes(user.role?.toLowerCase())
  ) {
    showSnackBar(`Acceso denegado. Rol: ${user.role}`, "error");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);

    return false;
  }

  return true;
};
