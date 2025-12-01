document.addEventListener("DOMContentLoaded", () => {
  const getCurrentUser = () => {
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
  };

  const setCurrentUser = (user) => {
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const showError = (message) => {
    const errorDiv = document.getElementById("auth-error");
    if (errorDiv) {
      errorDiv.innerText = message;
      errorDiv.style.display = "block";
    } else {
      alert(message);
    }
  };

  const clearError = () => {
    const errorDiv = document.getElementById("auth-error");
    if (errorDiv) {
      errorDiv.style.display = "none";
      errorDiv.innerText = "";
    }
  };

  const handleFormSubmit = (formId, isSignup) => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerText;

      btn.innerText = "Processing...";
      btn.style.opacity = "0.8";
      btn.disabled = true;

      clearError();

      const usernameInput = form.querySelector("#username");
      const passwordInput = form.querySelector("#password");

      if (!usernameInput || !passwordInput) {
        showError(
          `Error: Faltan campos de usuario o contraseña en el formulario ${formId}.`
        );
        btn.innerText = originalText;
        btn.style.opacity = "1";
        btn.disabled = false;
        return;
      }
      const username = usernameInput.value;
      const password = passwordInput.value;

      let name = "";
      let apiEndpoint = "";
      let dataToSend = {};

      if (isSignup) {
        const nameInput = form.querySelector("#fullname");
        if (nameInput) name = nameInput.value;
        apiEndpoint = "https://localhost:7056/api/Auth/register";

        dataToSend = {
          Username: username,
          Password: password,
          name: name || username,
        };
      } else {
        apiEndpoint = "https://localhost:7056/api/Auth/login";

        dataToSend = {
          Username: username,
          Password: password,
        };
      }

      try {
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        });

        const responseData = await response.json();

        if (response.ok) {
          if (!isSignup && !responseData.token) {
            throw new Error(
              "Respuesta exitosa, pero no se recibió el token JWT."
            );
          }

          let userName = responseData.Username || dataToSend.Username;
          if (userName && userName.includes("@")) {
            userName = userName.split("@")[0];
          }
          if (userName) {
            userName = userName.charAt(0).toUpperCase() + userName.slice(1);
          }

          const user = {
            name: userName || "User",
            username: dataToSend.Username,
            token: responseData.token,
          };
          setCurrentUser(user);
          window.location.href = "index.html";
        } else {
          let message = responseData.message || response.statusText;
          let friendlyMessage = `Error en ${isSignup ? "Registro" : "Login"}: `;

          if (response.status === 400) {
            if (message.includes("Credenciales incorrectas")) {
              friendlyMessage =
                "Usuario o contraseña incorrectos. Por favor, verifica tus datos. 🔒";
            } else if (message.includes("El usuario ya existe")) {
              friendlyMessage =
                "Ese usuario ya está registrado. Intenta iniciar sesión o usa otro nombre. 📧";
            } else {
              friendlyMessage = `${friendlyMessage} ${message}`;
            }
          } else if (response.status >= 500) {
            friendlyMessage =
              "Error interno del servidor. Inténtalo más tarde. ⚠️";
          } else {
            friendlyMessage = `${friendlyMessage} ${message}`;
          }

          showError(friendlyMessage);
        }
      } catch (error) {
        console.error(
          `Error durante la llamada fetch a ${apiEndpoint}:`,
          error
        );
        showError("Error de conexión: No se pudo contactar al API. 📡");
      }

      // Restablecer el botón
      btn.innerText = originalText;
      btn.style.opacity = "1";
      btn.disabled = false;
    });
  };

  const handleLogout = () => {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
      });
    }
  };

  const setupPasswordToggle = (toggleId, inputId) => {
    const toggleBtn = document.getElementById(toggleId);
    const input = document.getElementById(inputId);

    if (!toggleBtn || !input) return;

    toggleBtn.addEventListener("click", () => {
      const type =
        input.getAttribute("type") === "password" ? "text" : "password";
      input.setAttribute("type", type);

      if (type === "text") {
        toggleBtn.innerHTML = `
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                  `;
      } else {
        toggleBtn.innerHTML = `
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                  `;
      }
    });
  };

  // Asignar manejadores a los formularios
  setupPasswordToggle("togglePassword", "password");
  setupPasswordToggle("toggleConfirmPassword", "confirm-password");
  handleFormSubmit("loginForm", false);
  handleFormSubmit("signupForm", true);

  handleLogout();

  const checkAuth = () => {};
  checkAuth();

  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      if (input.parentElement.parentElement)
        input.parentElement.parentElement.classList.add("focused");
    });
    input.addEventListener("blur", () => {
      if (input.parentElement.parentElement)
        input.parentElement.parentElement.classList.remove("focused");
    });
  });
});
