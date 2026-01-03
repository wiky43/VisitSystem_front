document.addEventListener("DOMContentLoaded", () => {
  const sideBar = document.querySelector("aside");
  const toggle = document.querySelector("#toggle");

  if (!sideBar || !toggle) {
    console.warn("Sidebar o toggle no encontrados en esta página");
    return;
  }

  toggle.addEventListener("click", () => {
    const isMini = sideBar.classList.toggle("mini");
    sideBar.style.width = isMini ? "4rem" : "16rem";
  });

  const listItems = document.querySelectorAll("aside li");

  listItems.forEach((item) => {
    item.addEventListener("click", () => {
      listItems.forEach((li) => li.classList.remove("active"));
      item.classList.add("active");
    });
  });
});
