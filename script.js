const openEmpanadasBtn = document.querySelector("[data-empanadas]");
const empanadasModal = document.querySelector("#empanadas-modal");
const modalCloseBtn = document.querySelector("[data-modal-close]");
const modalBackdrop = document.querySelector(".modal");
const menuButton = document.querySelector("[data-scroll-menu]");

const openModal = () => {
  if (!empanadasModal) return;
  empanadasModal.classList.add("is-open");
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  if (!empanadasModal) return;
  empanadasModal.classList.remove("is-open");
  document.body.style.overflow = "";
};

if (openEmpanadasBtn) {
  openEmpanadasBtn.addEventListener("click", openModal);
}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", closeModal);
}

if (modalBackdrop) {
  modalBackdrop.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

if (menuButton) {
  menuButton.addEventListener("click", (event) => {
    event.preventDefault();
    const target = document.querySelector(menuButton.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
}
