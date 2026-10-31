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


// Simple fashion catalogue and cart. Orders are sent to the store WhatsApp number.
const STORE_WHATSAPP = "8801722574666"; // Bangladesh country code + number, without + or spaces.
const products = [
  {id:1,name:"Classic T-Shirt",bn:"ক্লাসিক টি-শার্ট",category:"Men's Fashion",price:450,emoji:"👕",art:""},
  {id:2,name:"Women's Kurti",bn:"মহিলাদের কুর্তি",category:"Women's Fashion",price:850,emoji:"👗",art:"art-2"},
  {id:3,name:"Casual Shirt",bn:"ক্যাজুয়াল শার্ট",category:"Men's Fashion",price:750,emoji:"👔",art:"art-3"},
  {id:4,name:"Stylish Handbag",bn:"স্টাইলিশ হ্যান্ডব্যাগ",category:"Accessories",price:990,emoji:"👜",art:"art-4"},
  {id:5,name:"Fashion Scarf",bn:"ফ্যাশন স্কার্ফ",category:"Accessories",price:350,emoji:"🧣",art:"art-5"},
  {id:6,name:"Sneakers",bn:"স্নিকার্স",category:"Footwear",price:1450,emoji:"👟",art:"art-6"}
];
let cart = [];
const productGrid = document.getElementById("productGrid");
const productSearch = document.getElementById("productSearch");
const money = value => "৳" + Number(value).toLocaleString("en-BD");
function renderProducts(filter = "") {
  const lang = currentLanguage;
  const shown = products.filter(p => (p.name + " " + p.bn + " " + p.category).toLowerCase().includes(filter.toLowerCase()));
  productGrid.innerHTML = shown.length ? shown.map(p => `<article class="product-card glass"><div class="product-art ${p.art}"><span class="product-tag">${p.category}</span>${p.emoji}</div><div class="product-details"><div class="product-category">${p.category}</div><h3>${lang === "bn" ? p.bn : p.name}</h3><div class="product-price">${money(p.price)}</div><div class="product-controls"><select id="size-${p.id}" aria-label="Choose size"><option value="M">Size M</option><option value="S">Size S</option><option value="L">Size L</option><option value="XL">Size XL</option><option value="Free">Free size</option></select><button class="add-cart" data-add="${p.id}">${lang === "bn" ? "কার্টে যোগ" : "Add +"}</button></div></div></article>`).join("") : `<p class="no-results">${lang === "bn" ? "কোনো পণ্য পাওয়া যায়নি।" : "No products found."}</p>`;
  document.getElementById("productCount").textContent = `${shown.length} ${lang === "bn" ? "টি পণ্য" : "products"}`;
}
function renderCart() {
  const count = cart.reduce((sum,item) => sum + item.qty, 0);
  const total = cart.reduce((sum,item) => sum + item.price * item.qty, 0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTotal").textContent = money(total);
  document.getElementById("whatsappOrder").disabled = cart.length === 0;
  document.getElementById("cartItems").innerHTML = cart.length ? cart.map((item,index) => `<div class="cart-line"><div><strong>${item.name}</strong><small>Size: ${item.size} · Qty: ${item.qty} · ${money(item.price * item.qty)}</small></div><button class="remove-item" data-remove="${index}" aria-label="Remove item">×</button></div>`).join("") : `<p class="empty-cart">${currentLanguage === "bn" ? "আপনার কার্ট খালি।" : "Your cart is empty."}</p>`;
}
productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]"); if (!button) return;
  const id = Number(button.dataset.add), product = products.find(p => p.id === id), size = document.getElementById(`size-${id}`).value;
  const existing = cart.find(item => item.id === id && item.size === size);
  if (existing) existing.qty += 1; else cart.push({id,name:currentLanguage === "bn" ? product.bn : product.name,price:product.price,size,qty:1});
  renderCart(); button.textContent = currentLanguage === "bn" ? "যোগ হয়েছে ✓" : "Added ✓";
  setTimeout(() => { if (button.isConnected) button.textContent = currentLanguage === "bn" ? "কার্টে যোগ" : "Add +"; }, 1000);
});
document.getElementById("cartItems").addEventListener("click", event => { const button = event.target.closest("[data-remove]"); if (button) { cart.splice(Number(button.dataset.remove),1); renderCart(); } });
productSearch.addEventListener("input", () => renderProducts(productSearch.value));
document.getElementById("orderForm").addEventListener("submit", event => {
  event.preventDefault(); if (!cart.length) return;
  const name = document.getElementById("customerName").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const lines = cart.map((item,i) => `${i+1}. ${item.name} | Size: ${item.size} | Qty: ${item.qty} | ${money(item.price * item.qty)}`);
  const total = cart.reduce((sum,item) => sum + item.price * item.qty,0);
  const message = `Hello! I would like to place an order.

Customer: ${name}
Delivery address: ${address}

Order details:
${lines.join("\n")}

Total: ${money(total)}

Please confirm availability and delivery charge.`;
  window.open(`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
});
renderProducts(); renderCart();
languageToggle.addEventListener("click", () => { renderProducts(productSearch.value); renderCart(); });
