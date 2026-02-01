const CART_KEY = "decoo_cart";
const appSettings = {
  pickupEnabled: true,
  deliveryEnabled: false,
  deliveryRadiusMiles: 2,
  processingFee: 1.0,
};
const menuData = {
  empanadas: [
    {
      id: "emp-chicken-cheese",
      name: "Chicken & Cheese",
      price: 3.0,
      inStock: true,
      note: "Most Poplar!",
    },
    { id: "emp-steak-cheese", name: "Steak & Cheese", price: 4.0, inStock: false },
    { id: "emp-conch-lambi", name: "Conch Meat (Lambi)", price: 4.0, inStock: false },
    { id: "emp-beef-cheese", name: "Beef & Cheese", price: 3.5, inStock: true },
    { id: "emp-shrimp", name: "Shrimp", price: 3.5, inStock: true },
    { id: "emp-crab-meat", name: "Crab Meat", price: 3.5, inStock: false },
    { id: "emp-pork-cheese", name: "Pork & Cheese", price: 3.0, inStock: true },
    {
      id: "emp-three-cheese",
      name: "3 Cheese",
      price: 3.0,
      inStock: true,
      note: "Prov, Motz, Ched",
    },
  ],
  juices: [
    {
      id: "jui-passion-fruit",
      name: "Passion Fruit",
      price: 5.0,
      inStock: true,
      note: "Most Poplar!",
    },
    { id: "jui-tamarind", name: "Tamarind", price: 5.0, inStock: true },
    { id: "jui-lemonade", name: "Lemonade", price: 5.0, inStock: true },
    { id: "jui-guanabana", name: "Guanabana", price: 5.0, inStock: false },
    { id: "jui-orange", name: "Orange", price: 5.0, inStock: true },
    {
      id: "jui-morir-sonando",
      name: "Morir Soñando",
      price: 6.0,
      inStock: true,
      note: "House Specialty",
    },
  ],
  sodas: [
    { id: "soda-malta", name: "Malta", price: 2.0, inStock: false },
    { id: "soda-coke", name: "Coca-Cola", price: 1.5, inStock: true },
    { id: "soda-sprite", name: "Sprite", price: 1.5, inStock: true },
    { id: "soda-mtn-dew", name: "Mtn Dew", price: 1.5, inStock: true },
    { id: "soda-ginger-ale", name: "Ginger Ale", price: 1.5, inStock: true },
    { id: "soda-orange", name: "Orange Soda", price: 1.5, inStock: true },
    { id: "soda-grape", name: "Grape Soda", price: 1.5, inStock: true },
    { id: "soda-pepsi", name: "Pepsi", price: 1.5, inStock: true },
    { id: "soda-diet-pepsi", name: "Dieta Pepsi", price: 1.5, inStock: true },
    { id: "soda-pina", name: "Piña", price: 1.5, inStock: true },
    { id: "soda-water", name: "Water", price: 1.0, inStock: true },
  ],
  pinchos: [{ id: "pincho", name: "Pincho", price: 5.0, inStock: true }],
  quipes: [{ id: "quipe", name: "Quipe", price: 3.5, inStock: true }],
  alcapurrias: [{ id: "alcapurria", name: "Alcapurria", price: 4.0, inStock: true }],
  sorullitos: [{ id: "sorullitos", name: "Sorullitos", price: 1.0, inStock: true }],
  tresLeches: [{ id: "tres-leches", name: "Tres Leches", price: 4.0, inStock: true }],
};

const itemById = Object.values(menuData).reduce((acc, items) => {
  items.forEach((item) => {
    acc[item.id] = item;
  });
  return acc;
}, {});

const formatMoney = (value) => `$${value.toFixed(2)}`;

const getCartItemCount = (cartState) => Object.values(cartState).reduce((sum, qty) => sum + qty, 0);

const getCartSubtotal = (cartState) =>
  Object.entries(cartState).reduce((sum, [id, qty]) => {
    const item = itemById[id];
    if (!item) return sum;
    return sum + item.price * qty;
  }, 0);

const calculateTotals = (cartState) => {
  const subtotal = getCartSubtotal(cartState);
  const processingFee = subtotal > 0 ? appSettings.processingFee : 0;
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

const sanitizeCartForStock = (cartState) =>
  Object.entries(cartState).reduce((acc, [id, qty]) => {
    const item = itemById[id];
    if (!item || item.inStock === false) return acc;
    if (Number.isFinite(qty) && qty > 0) {
      acc[id] = Math.floor(qty);
    }
    return acc;
  }, {});

const areCartsEqual = (a, b) => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => a[key] === b[key]);
};

const clearCart = () => {
  cart = {};
  localStorage.removeItem(CART_KEY);
  syncUIAfterCartChange(cart);
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
  const noteMarkup = item.note ? `<small class="${getNoteClass(item.note)}">${item.note}</small>` : "";
  const qty = getQty(cartState, item.id);
  const soldOutBadge = item.inStock ? "" : '<span class="menu-item__soldout-badge">Sold out</span>';
  const qtyControlMarkup = item.inStock ? renderQtyControlMarkup(qty, true) : "";
  return `
    <li class="menu-item${item.inStock ? "" : " menu-item--soldout"}" data-id="${item.id}">
      <span class="menu-item__left">
        <span class="menu-item__name">${item.name}</span>
        ${noteMarkup}
      </span>
      <span class="menu-item__right">
        <span class="menu-item__price">${formatMoney(item.price)}</span>
        ${soldOutBadge}
        <span class="qty-control">${qtyControlMarkup}</span>
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
  const item = itemById[id];
  if (!item) return;
  if (item.inStock === false) {
    renderAllMenus(cart);
    return;
  }
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

const updateClearCartButton = (cartState) => {
  const clearButton = document.querySelector("[data-clear-cart]");
  if (!clearButton) return;
  clearButton.disabled = getCartItemCount(cartState) === 0;
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
  const sanitizedCart = sanitizeCartForStock(cartState);
  if (!areCartsEqual(cartState, sanitizedCart)) {
    cart = sanitizedCart;
    saveCart(cart);
    cartState = cart;
    changedId = null;
  }
  if (changedId) {
    updateMenuItemQtyById(changedId, getQty(cartState, changedId));
  } else {
    renderAllMenus(cartState);
  }
  renderCartList(cartState);
  updateCartTotals(cartState);
  updateClearCartButton(cartState);
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
const checkoutModal = document.querySelector("#checkout-modal");
const checkoutNote = document.querySelector("[data-checkout-note]");
const checkoutPickup = document.querySelector("[data-checkout-pickup]");
const checkoutDelivery = document.querySelector("[data-checkout-delivery]");
const checkoutPickupOption = document.querySelector("[data-checkout-pickup-option]");
const checkoutDeliveryOption = document.querySelector("[data-checkout-delivery-option]");

const initMenus = () => {
  cart = sanitizeCartForStock(loadCart());
  saveCart(cart);
  renderAllMenus(cart);
  syncUIAfterCartChange(cart);
  updateCheckoutUI();
};

// Open a modal and lock page scroll.
const openModal = (modal) => {
  if (!modal) return;
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
  if (modal === checkoutModal) {
    updateCheckoutUI();
  }
};

// Close a modal and restore scroll if none are open.
const closeModal = (modal) => {
  if (!modal) return;
  modal.classList.remove("is-open");
  if (!document.querySelector(".modal.is-open")) {
    document.body.style.overflow = "";
  }
};

const updateCheckoutUI = () => {
  if (!checkoutModal) return;
  const deliveryEnabled = appSettings.deliveryEnabled;
  const pickupEnabled = appSettings.pickupEnabled;

  if (checkoutDeliveryOption) checkoutDeliveryOption.hidden = !deliveryEnabled;
  if (checkoutDelivery) checkoutDelivery.disabled = !deliveryEnabled;
  if (checkoutPickup) checkoutPickup.disabled = !pickupEnabled;

  if (checkoutNote) {
    checkoutNote.hidden = !(!deliveryEnabled && pickupEnabled);
  }

  if (pickupEnabled && !deliveryEnabled && checkoutPickup) {
    checkoutPickup.checked = true;
  } else if (!pickupEnabled && deliveryEnabled && checkoutDelivery) {
    checkoutDelivery.checked = true;
  } else if (pickupEnabled && deliveryEnabled && checkoutPickup && checkoutDelivery) {
    if (!checkoutPickup.checked && !checkoutDelivery.checked) {
      checkoutPickup.checked = true;
    }
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

  const openCheckout = event.target.closest("[data-open-checkout]");
  if (openCheckout) {
    openModal(checkoutModal);
    return;
  }

  const clearCartButton = event.target.closest("[data-clear-cart]");
  if (clearCartButton) {
    if (getCartItemCount(cart) === 0) return;
    const ok = window.confirm("Clear your order? This will remove all items.");
    if (ok) {
      clearCart();
    }
    return;
  }

  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) return;
  const itemEl = actionEl.closest("[data-id]");
  if (!itemEl) return;
  const id = itemEl.dataset.id;
  if (!id) return;

  const action = actionEl.dataset.action;
  const item = itemById[id];
  if ((action === "add" || action === "increase") && item && item.inStock === false) {
    alert("This item is currently sold out.");
    return;
  }
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
