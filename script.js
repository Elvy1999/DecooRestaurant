const CART_KEY = "decoo_cart";

const menuData = {
  empanadas: [
    { id: "emp-chicken-cheese", name: "Chicken & Cheese", price: 3.0, note: "Most Poplar!" },
    { id: "emp-steak-cheese", name: "Steak & Cheese", price: 4.0 },
    { id: "emp-conch-lambi", name: "Conch Meat (Lambi)", price: 4.0 },
    { id: "emp-beef-cheese", name: "Beef & Cheese", price: 3.5 },
    { id: "emp-shrimp", name: "Shrimp", price: 3.5 },
    { id: "emp-crab-meat", name: "Crab Meat", price: 3.5 },
    { id: "emp-pork-cheese", name: "Pork & Cheese", price: 3.0 },
    { id: "emp-three-cheese", name: "3 Cheese", price: 3.0, note: "Prov, Motz, Ched" },
  ],
  juices: [
    { id: "jui-passion-fruit", name: "Passion Fruit", price: 5.0, note: "Most Poplar!" },
    { id: "jui-tamarind", name: "Tamarind", price: 5.0 },
    { id: "jui-lemonade", name: "Lemonade", price: 5.0 },
    { id: "jui-guanabana", name: "Guanabana", price: 5.0 },
    { id: "jui-orange", name: "Orange", price: 5.0 },
    { id: "jui-morir-sonando", name: "Morir Soñando", price: 6.0, note: "House Specialty" },
  ],
  sodas: [
    { id: "soda-malta", name: "Malta", price: 2.0 },
    { id: "soda-coke", name: "Coca-Cola", price: 1.5 },
    { id: "soda-sprite", name: "Sprite", price: 1.5 },
    { id: "soda-mtn-dew", name: "Mtn Dew", price: 1.5 },
    { id: "soda-ginger-ale", name: "Ginger Ale", price: 1.5 },
    { id: "soda-orange", name: "Orange Soda", price: 1.5 },
    { id: "soda-grape", name: "Grape Soda", price: 1.5 },
    { id: "soda-pepsi", name: "Pepsi", price: 1.5 },
    { id: "soda-diet-pepsi", name: "Dieta Pepsi", price: 1.5 },
    { id: "soda-pina", name: "Piña", price: 1.5 },
    { id: "soda-water", name: "Water", price: 1.0 },
  ],
  pinchos: [{ id: "pincho", name: "Pincho", price: 5.0 }],
  quipes: [{ id: "quipe", name: "Quipe", price: 3.5 }],
  alcapurrias: [{ id: "alcapurria", name: "Alcapurria", price: 4.0 }],
  sorullitos: [{ id: "sorullitos", name: "Sorullitos", price: 1.0 }],
  tresLeches: [{ id: "tres-leches", name: "Tres Leches", price: 4.0 }],
};

const menuIndex = Object.values(menuData).reduce((acc, items) => {
  items.forEach((item) => {
    acc[item.id] = item;
  });
  return acc;
}, {});

const loadCart = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_KEY));
    if (!stored || typeof stored !== "object") return {};
    return Object.entries(stored).reduce((acc, [id, qty]) => {
      if (menuIndex[id] && Number.isFinite(qty) && qty > 0) {
        acc[id] = Math.floor(qty);
      }
      return acc;
    }, {});
  } catch (error) {
    return {};
  }
};

const saveCart = () => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

const getQty = (id) => cart[id] || 0;

const setQty = (id, qty) => {
  if (!menuIndex[id]) return;
  if (qty <= 0) {
    delete cart[id];
    return;
  }
  cart[id] = qty;
};

const increment = (id) => setQty(id, getQty(id) + 1);
const decrement = (id) => setQty(id, getQty(id) - 1);

const getCartSubtotal = () =>
  Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuIndex[id];
    if (!item) return sum;
    return sum + item.price * qty;
  }, 0);

const formatPrice = (price) => `$${price.toFixed(2)}`;

const getNoteClass = (note) =>
  note === "Prov, Motz, Ched" ? "menu-item__note menu-item__note--compact" : "menu-item__note";

const renderQtyControlMarkup = (qty) =>
  qty > 0
    ? `
      <button class="qty-control__btn" type="button" data-action="decrease" aria-label="Decrease quantity">-</button>
      <span class="qty-control__qty">${qty}</span>
      <button class="qty-control__btn" type="button" data-action="increase" aria-label="Increase quantity">+</button>
    `
    : `<button class="qty-control__add" type="button" data-action="add">Add</button>`;

const renderMenuItemMarkup = (item) => {
  const noteMarkup = item.note
    ? `<small class="${getNoteClass(item.note)}">${item.note}</small>`
    : "";
  const qty = getQty(item.id);
  return `
    <li class="menu-item" data-id="${item.id}">
      <span class="menu-item__left">
        <span class="menu-item__name">${item.name}</span>
        ${noteMarkup}
      </span>
      <span class="menu-item__right">
        <span class="menu-item__price">${formatPrice(item.price)}</span>
        <span class="qty-control">${renderQtyControlMarkup(qty)}</span>
      </span>
    </li>
  `;
};

const renderMenuList = (listEl, items) => {
  listEl.innerHTML = items.map(renderMenuItemMarkup).join("");
};

const renderAllMenus = () => {
  document.querySelectorAll("[data-menu-list]").forEach((listEl) => {
    const key = listEl.dataset.menuList;
    const items = menuData[key];
    if (!items) return;
    renderMenuList(listEl, items);
  });
};

const updateMenuItemQty = (itemEl, qty) => {
  const control = itemEl.querySelector(".qty-control");
  if (!control) return;
  control.innerHTML = renderQtyControlMarkup(qty);
};

let cart = loadCart();

// Map trigger selectors to their corresponding modal IDs.
const modalPairs = [
  ["[data-empanadas]", "#empanadas-modal"],
  ["[data-alcapurrias]", "#alcapurrias-modal"],
  ["[data-quipes]", "#quipes-modal"],
  ["[data-pinchos]", "#pinchos-modal"],
  ["[data-sorullitos]", "#sorullitos-modal"],
  ["[data-tres-leches]", "#tres-leches-modal"],
  ["[data-juices]", "#juices-modal"],
  ["[data-beverages]", "#beverages-modal"],
];
// Shared modal close controls and backdrop areas.
const modalCloseButtons = document.querySelectorAll("[data-modal-close]");
const modalBackdrops = document.querySelectorAll(".modal");
const menuButton = document.querySelector("[data-scroll-menu]");

const initMenus = () => {
  cart = loadCart();
  renderAllMenus();
};

// Open a modal and lock page scroll.
const openModal = (modal) => {
  if (!modal) return;
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
};

// Close a modal and restore scroll if none are open.
const closeModal = (modal) => {
  if (!modal) return;
  modal.classList.remove("is-open");
  if (!document.querySelector(".modal.is-open")) {
    document.body.style.overflow = "";
  }
};

// Wire each menu/drink card to its modal.
modalPairs.forEach(([triggerSelector, modalSelector]) => {
  const trigger = document.querySelector(triggerSelector);
  const modal = document.querySelector(modalSelector);
  if (!trigger || !modal) return;
  trigger.addEventListener("click", () => openModal(modal));
});

// Close when clicking the X button.
modalCloseButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const modal = event.target.closest(".modal");
    closeModal(modal);
  });
});

// Close when clicking the dimmed backdrop.
modalBackdrops.forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});

// Close on Escape key.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal.is-open").forEach((modal) => {
      closeModal(modal);
    });
  }
});

document.addEventListener("click", (event) => {
  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) return;
  const itemEl = actionEl.closest(".menu-item");
  if (!itemEl) return;
  const id = itemEl.dataset.id;
  if (!id) return;

  const action = actionEl.dataset.action;
  if (action === "add") {
    setQty(id, 1);
  } else if (action === "increase") {
    increment(id);
  } else if (action === "decrease") {
    decrement(id);
  } else {
    return;
  }

  saveCart();
  updateMenuItemQty(itemEl, getQty(id));
});

// Smooth scroll for the hero "View Menu" button.
if (menuButton) {
  menuButton.addEventListener("click", (event) => {
    event.preventDefault();
    const target = document.querySelector(menuButton.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMenus);
} else {
  initMenus();
}
