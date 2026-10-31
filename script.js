// Language switcher: text is stored in data-en and data-bn attributes.
const languageToggle = document.getElementById("languageToggle");
let currentLanguage = localStorage.getItem("portfolio-language") || "en";

function applyLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;
  document.body.classList.toggle("lang-bn", language === "bn");
  document.querySelectorAll("[data-en][data-bn]").forEach((element) => {
    element.textContent = element.dataset[language];
  });
  languageToggle.textContent = language === "en" ? "বাংলা" : "English";
  localStorage.setItem("portfolio-language", language);
}
languageToggle.addEventListener("click", () => applyLanguage(currentLanguage === "en" ? "bn" : "en"));
applyLanguage(currentLanguage);

// Dark / light mode. Preference is remembered on this browser.
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme === "light") document.body.classList.add("light");
function updateThemeButton() {
  const isLight = document.body.classList.contains("light");
  themeToggle.textContent = isLight ? "☾" : "☀";
  themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
}
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("portfolio-theme", document.body.classList.contains("light") ? "light" : "dark");
  updateThemeButton();
});
updateThemeButton();

// Live clock uses the visitor's local device time.
const clock = document.getElementById("liveClock");
const date = document.getElementById("liveDate");
function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString(currentLanguage === "bn" ? "bn-BD" : "en-GB");
  date.textContent = now.toLocaleDateString(currentLanguage === "bn" ? "bn-BD" : "en-GB", {
    weekday: "long", year: "numeric", month: "short", day: "numeric"
  });
}
updateClock();
setInterval(updateClock, 1000);
languageToggle.addEventListener("click", updateClock);

// This is a browser-local visit counter, not a shared/global analytics counter.
const visitKey = "portfolio-visit-count";
const visits = Number(localStorage.getItem(visitKey) || 0) + 1;
localStorage.setItem(visitKey, String(visits));
document.getElementById("visitCount").textContent = visits.toLocaleString();

// Current year.
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile navigation.
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "×" : "☰";
});
navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));

// Scroll reveal animations.
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

// Back-to-top control.
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  backToTop.classList.toggle("visible", window.scrollY > 450);
}, { passive: true });
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));


// Nur Fashion House - Supabase product catalogue
const STORE_WHATSAPP = "8801722574666";

// Supabase connection
const SUPABASE_URL = "https://icpklfqzrfceaazhashh.supabase.co";
const SUPABASE_KEY = "YOUR_PUBLISHABLE_KEY";

let sb;
let products = [];
let cart = [];

const productGrid = document.getElementById("productGrid");
const productSearch = document.getElementById("productSearch");
const money = value => "৳" + Number(value).toLocaleString("en-BD");

function loadSupabaseLibrary() {
  return new Promise((resolve, reject) => {
    if (window.supabase) return resolve();
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function startStore() {
  try {
    await loadSupabaseLibrary();
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    await loadProducts();
  } catch (error) {
    productGrid.textContent = "পণ্য লোড করা যাচ্ছে না। পরে আবার চেষ্টা করুন।";
    console.error(error);
  }
}

async function loadProducts() {
  productGrid.textContent = "পণ্য লোড হচ্ছে...";
  const { data, error } = await sb
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    productGrid.textContent = "পণ্য লোড করতে সমস্যা হয়েছে: " + error.message;
    console.error(error);
    return;
  }

  products = data || [];
  renderProducts(productSearch.value);
}

function renderProducts(filter = "") {
  const lang = currentLanguage;
  const term = filter.toLowerCase();

  const shown = products.filter(p =>
    [p.name, p.name_bn, p.category, p.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term)
  );

  productGrid.innerHTML = shown.length
    ? shown.map(p => {
        const sizes = Array.isArray(p.sizes) && p.sizes.length
          ? p.sizes
          : ["Free"];

        return `
          <article class="product-card glass">
            <div class="product-art">
              ${p.image_url
                ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover">`
                : "👗"}
            </div>
            <div class="product-details">
              <div class="product-category">${esc(p.category)}</div>
              <h3>${esc(lang === "bn" && p.name_bn ? p.name_bn : p.name)}</h3>
              <div class="product-price">${money(p.price)}</div>
              ${p.description ? `<p>${esc(p.description)}</p>` : ""}
              <div class="product-controls">
                <select id="size-${esc(p.id)}" aria-label="Choose size">
                  ${sizes.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join("")}
                </select>
                <button class="add-cart" data-add="${esc(p.id)}">
                  ${lang === "bn" ? "কার্টে যোগ" : "Add +"}
                </button>
              </div>
            </div>
          </article>
        `;
      }).join("")
    : `<p class="no-results">${lang === "bn" ? "কোনো পণ্য পাওয়া যায়নি।" : "No products found."}</p>`;

  document.getElementById("productCount").textContent =
    `${shown.length} ${lang === "bn" ? "টি পণ্য" : "products"}`;
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTotal").textContent = money(total);
  document.getElementById("whatsappOrder").disabled = cart.length === 0;

  document.getElementById("cartItems").innerHTML = cart.length
    ? cart.map((item, index) => `
        <div class="cart-line">
          <div>
            <strong>${esc(item.name)}</strong>
            <small>Size: ${esc(item.size)} · Qty: ${item.qty} · ${money(item.price * item.qty)}</small>
          </div>
          <button class="remove-item" data-remove="${index}" aria-label="Remove item">×</button>
        </div>
      `).join("")
    : `<p class="empty-cart">${currentLanguage === "bn" ? "আপনার কার্ট খালি।" : "Your cart is empty."}</p>`;
}

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;

  const product = products.find(p => String(p.id) === button.dataset.add);
  if (!product) return;

  const size = document.getElementById(`size-${product.id}`).value;
  const existing = cart.find(item => item.id === product.id && item.size === size);
  const name = currentLanguage === "bn" && product.name_bn
    ? product.name_bn
    : product.name;

  if (existing) existing.qty++;
  else cart.push({
    id: product.id,
    name,
    price: Number(product.price),
    size,
    qty: 1
  });

  renderCart();
  button.textContent = currentLanguage === "bn" ? "যোগ হয়েছে ✓" : "Added ✓";
});

document.getElementById("cartItems").addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  cart.splice(Number(button.dataset.remove), 1);
  renderCart();
});

productSearch.addEventListener("input", () => renderProducts(productSearch.value));

document.getElementById("orderForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!cart.length) return;

  const name = document.getElementById("customerName").value.trim();
  const address = document.getElementById("customerAddress").value.trim();

  const lines = cart.map((item, i) =>
    `${i + 1}. ${item.name} | Size: ${item.size} | Qty: ${item.qty} | ${money(item.price * item.qty)}`
  );

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const message = `Hello! I would like to place an order.

Customer: ${name}
Delivery address: ${address}

Order details:
${lines.join("\n")}

Total: ${money(total)}

Please confirm availability and delivery charge.`;

  window.open(
    `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer"
  );
});

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

renderCart();
startStore();

languageToggle.addEventListener("click", () => {
  renderProducts(productSearch.value);
  renderCart();
});
