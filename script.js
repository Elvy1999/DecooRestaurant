const CART_KEY = "decoo_cart";
const PROCESSING_FEE = 1.0;

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

const itemById = Object.values(menuData).reduce((acc, items) => {
  items.forEach((item) => {
    acc[item.id] = item;
  });
  return acc;
}, {});

const formatMoney = (value) => `$${value.toFixed(2)}`;

const getCartItemCount = (cartState) =>
  Object.values(cartState).reduce((sum, qty) => sum + qty, 0);

const getCartSubtotal = (cartState) =>
  Object.entries(cartState).reduce((sum, [id, qty]) => {
    const item = itemById[id];
    if (!item) return sum;
    return sum + item.price * qty;
  }, 0);

const calculateTotals = (cartState) => {
  const subtotal = getCartSubtotal(cartState);
  const processingFee = subtotal > 0 ? PROCESSING_FEE : 0;
  const tax = 0;
  const total = subtotal + processingFee + tax;
  return { subtotal, processingFee, tax, total };
};

const loadCart = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_KEY));
    if (!stored || typeof stored !== "object") return {};
    return Object.entries(stored).reduce((acc, [id, qty]) => {
      if (itemById[id] && Number.isFinite(qty) && qty > 0) {
        acc[id] = Math.floor(qty);
      }
      return acc;
    }, {});
  } catch (error) {
    return {};
  }
};

const saveCart = (cartState) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cartState));
};

const getQty = (cartState, id) => cartState[id] || 0;

const setQty = (cartState, id, qty) => {
  if (!itemById[id]) return;
  if (qty <= 0) {
    delete cartState[id];
    return;
  }
  cartState[id] = qty;
};

const increment = (cartState, id) => setQty(cartState, id, getQty(cartState, id) + 1);
const decrement = (cartState, id) => setQty(cartState, id, getQty(cartState, id) - 1);

const getNoteClass = (note) =>
  note === "Prov, Motz, Ched" ? "menu-item__note menu-item__note--compact" : "menu-item__note";

const renderQtyControlMarkup = (qty, allowAdd) => {
  if (qty > 0) {
    return `
      <button class="qty-control__btn" type="button" data-action="decrease" aria-label="Decrease quantity">-</button>
      <span class="qty-control__qty">${qty}</span>
      <button class="qty-control__btn" type="button" data-action="increase" aria-label="Increase quantity">+</button>
    `;
  }
  if (!allowAdd) return "";
  return `<button class="qty-control__add" type="button" data-action="add">Add</button>`;
};

const renderMenuItemMarkup = (item, cartState) => {
  const noteMarkup = item.note
    ? `<small class="${getNoteClass(item.note)}">${item.note}</small>`
    : "";
  const qty = getQty(cartState, item.id);
  return `
    <li class="menu-item" data-id="${item.id}">
      <span class="menu-item__left">
        <span class="menu-item__name">${item.name}</span>
        ${noteMarkup}
      </span>
      <span class="menu-item__right">
        <span class="menu-item__price">${formatMoney(item.price)}</span>
        <span class="qty-control">${renderQtyControlMarkup(qty, true)}</span>
      </span>
    </li>
  `;
};

const renderMenuList = (listEl, items, cartState) => {
  listEl.innerHTML = items.map((item) => renderMenuItemMarkup(item, cartState)).join("");
};

const renderAllMenus = (cartState) => {
  document.querySelectorAll("[data-menu-list]").forEach((listEl) => {
    const key = listEl.dataset.menuList;
    const items = menuData[key];
    if (!items) return;
    renderMenuList(listEl, items, cartState);
  });
};

const renderCartList = (cartState) => {
  const listEl = document.querySelector("[data-cart-list]");
  if (!listEl) return;
  const entries = Object.entries(cartState);
  if (entries.length === 0) {
    listEl.innerHTML = '<li class="cart-empty">Your cart is empty</li>';
    return;
  }

  listEl.innerHTML = entries
    .map(([id, qty]) => {
      const item = itemById[id];
      if (!item) return "";
      return `
        <li class="cart-item" data-id="${id}">
          <span class="cart-item__name">${item.name}</span>
          <span class="cart-item__price">${formatMoney(item.price)}</span>
          <div class="qty-control">
            ${renderQtyControlMarkup(qty, false)}
          </div>
        </li>
      `;
    })
    .join("");
};

const updateMenuItemQtyById = (id, qty) => {
  document.querySelectorAll(`.menu-item[data-id="${id}"]`).forEach((itemEl) => {
    const control = itemEl.querySelector(".qty-control");
    if (!control) return;
    control.innerHTML = renderQtyControlMarkup(qty, true);
  });
};

const updateCartTotals = (cartState) => {
  const totalsEl = document.querySelector("[data-cart-totals]");
  if (!totalsEl) return;
  const { subtotal, processingFee, tax, total } = calculateTotals(cartState);
  const subtotalEl = totalsEl.querySelector("[data-subtotal]");
  const feeEl = totalsEl.querySelector("[data-fee]");
  const taxEl = totalsEl.querySelector("[data-tax]");
  const totalEl = totalsEl.querySelector("[data-total]");
  if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
  if (feeEl) feeEl.textContent = formatMoney(processingFee);
  if (taxEl) taxEl.textContent = formatMoney(tax);
  if (totalEl) totalEl.textContent = formatMoney(total);
};

const updateCartBar = (cartState) => {
  const cartBar = document.querySelector("[data-cart-bar]");
  if (!cartBar) return;
  const countEl = cartBar.querySelector("[data-cart-count]");
  const totalEl = cartBar.querySelector("[data-cart-total]");
  const itemCount = getCartItemCount(cartState);
  const { total } = calculateTotals(cartState);

  if (countEl) countEl.textContent = itemCount;
  if (totalEl) totalEl.textContent = formatMoney(total);

  if (itemCount === 0) {
    cartBar.hidden = true;
    document.body.style.paddingBottom = "";
    return;
  }

  cartBar.hidden = false;
  requestAnimationFrame(() => {
    const barHeight = cartBar.offsetHeight || 0;
    document.body.style.paddingBottom = `${barHeight + 12}px`;
  });
};

const syncUIAfterCartChange = (cartState, changedId) => {
  if (changedId) {
    updateMenuItemQtyById(changedId, getQty(cartState, changedId));
  } else {
    renderAllMenus(cartState);
  }
  renderCartList(cartState);
  updateCartTotals(cartState);
  updateCartBar(cartState);
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
const cartModal = document.querySelector("#cart-modal");

const initMenus = () => {
  cart = loadCart();
  renderAllMenus(cart);
  syncUIAfterCartChange(cart);
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
  const openCart = event.target.closest("[data-open-cart]");
  if (openCart) {
    openModal(cartModal);
    return;
  }

  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) return;
  const itemEl = actionEl.closest("[data-id]");
  if (!itemEl) return;
  const id = itemEl.dataset.id;
  if (!id) return;

  const action = actionEl.dataset.action;
  if (action === "add") {
    setQty(cart, id, 1);
  } else if (action === "increase") {
    increment(cart, id);
  } else if (action === "decrease") {
    decrement(cart, id);
  } else {
    return;
  }

  saveCart(cart);
  syncUIAfterCartChange(cart, id);
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
