export function showSnackBar(message, type = "error") {
  let snackbar = document.getElementById("snackbar");

  if (!snackbar) {
    snackbar = document.createElement("div");
    snackbar.id = "snackbar";
    document.body.appendChild(snackbar);
  }

  snackbar.className = "";
  snackbar.classList.add(type);

  let iconClass = type === "success" ? "bx-check-circle" : "bx-error-circle";
  if (type === "confirm") iconClass = "bx-help-circle";

  snackbar.innerHTML = `<i class='bx ${iconClass}'></i> <span>${message}</span>`;

  snackbar.classList.add("show");

  if (type !== "confirm") {
    setTimeout(() => {
      snackbar.classList.remove("show");
    }, 3000);
  }
}

export function showConfirmSnackBar(message, onConfirm, onCancel) {
  let snackbar = document.getElementById("snackbar");

  if (!snackbar) {
    snackbar = document.createElement("div");
    snackbar.id = "snackbar";
    document.body.appendChild(snackbar);
  }

  snackbar.className = "snackbar confirm";

  snackbar.innerHTML = `
    <i class='bx bx-help-circle'></i>
    <span>${message}</span>
    <div>
      <button id="confirm-yes" class="btn-snackbar">Sí</button>
      <button id="confirm-no" class="btn-snackbar">No</button>
    </div>
  `;

  snackbar.classList.add("show");

  const close = () => {
    snackbar.classList.remove("show");
  };

  const yesBtn = snackbar.querySelector("#confirm-yes");
  const noBtn = snackbar.querySelector("#confirm-no");

  yesBtn.onclick = () => {
    close();
    if (onConfirm) onConfirm();
  };

  noBtn.onclick = () => {
    close();
    if (onCancel) onCancel();
  };
}
