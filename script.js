const empanadasTrigger = document.querySelector("[data-empanadas]");
const juicesTrigger = document.querySelector("[data-juices]");
const beveragesTrigger = document.querySelector("[data-beverages]");
const empanadasModal = document.querySelector("#empanadas-modal");
const juicesModal = document.querySelector("#juices-modal");
const beveragesModal = document.querySelector("#beverages-modal");
const modalCloseButtons = document.querySelectorAll("[data-modal-close]");
const modalBackdrops = document.querySelectorAll(".modal");
const menuButton = document.querySelector("[data-scroll-menu]");

const openModal = (modal) => {
  if (!modal) return;
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
};

const closeModal = (modal) => {
  if (!modal) return;
  modal.classList.remove("is-open");
  if (!document.querySelector(".modal.is-open")) {
    document.body.style.overflow = "";
  }
};

if (empanadasTrigger) {
  empanadasTrigger.addEventListener("click", () => openModal(empanadasModal));
}

if (juicesTrigger) {
  juicesTrigger.addEventListener("click", () => openModal(juicesModal));
}

if (beveragesTrigger) {
  beveragesTrigger.addEventListener("click", () => openModal(beveragesModal));
}

modalCloseButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const modal = event.target.closest(".modal");
    closeModal(modal);
  });
});

modalBackdrops.forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal.is-open").forEach((modal) => {
      closeModal(modal);
    });
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
