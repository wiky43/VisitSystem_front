const getCurrentUser = () => {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
};

(function checkAuth() {
  const user = getCurrentUser();

  if (!user || !user.token) {
    window.location.href = "index.html";
  }
})();
