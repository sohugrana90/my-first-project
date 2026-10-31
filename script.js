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
const SUPABASE_KEY = "sb_publishable_u_zCC7ueb8VGJYr9KzXZbg_gPHxRK1O";

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

function productImages(p) {
  let raw = p.image_urls;
  if (typeof raw === "string") {
    try { raw = JSON.parse(raw); } catch (_) { raw = [raw]; }
  }
  const list = Array.isArray(raw) ? raw.filter(url => typeof url === "string" && url.trim()) : [];
  if (p.image_url && !list.includes(p.image_url)) list.unshift(p.image_url);
  return [...new Set(list)];
}

function renderProducts(filter = "") {
  const lang = currentLanguage;
  const term = filter.toLowerCase();
  const shown = products.filter(p =>
    [p.name, p.name_bn, p.category, p.description].filter(Boolean).join(" ").toLowerCase().includes(term)
  );
  productGrid.innerHTML = shown.length ? shown.map(p => {
    const sizes = Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ["Free"];
    const imgs = productImages(p);
    const cover = imgs[0];
    return `
      <article class="product-card glass" data-product-card="${esc(p.id)}">
        <button class="product-gallery-trigger" type="button" data-gallery="${esc(p.id)}" aria-label="View photos of ${esc(p.name)}">
          <div class="product-art">${cover ? `<img data-main-product-image="${esc(p.id)}" src="${esc(cover)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover">` : "👗"}</div>
          <span class="gallery-count">${imgs.length} photo${imgs.length===1?"":"s"} · Click to enlarge ↗</span>
        </button>
        ${imgs.length > 1 ? `<div class="product-photo-strip" aria-label="More product photos">${imgs.map((url,i)=>`<button type="button" class="product-photo-thumb ${i===0?"active":""}" data-card-photo="${esc(p.id)}" data-photo-index="${i}" aria-label="Show product photo ${i+1}"><img src="${esc(url)}" alt="${esc(p.name)} photo ${i+1}" loading="lazy"></button>`).join("")}</div>` : ""}
        <div class="product-details">
          <div class="product-category">${esc(p.category)}</div>
          <h3>${esc(lang === "bn" && p.name_bn ? p.name_bn : p.name)}</h3>
          <div class="product-price">${money(p.price)}</div>
          ${p.description ? `<p>${esc(p.description)}</p>` : ""}
          <div class="product-controls">
            <select id="size-${esc(p.id)}" aria-label="Choose size">${sizes.map(size => `<option value="${esc(size)}">${esc(size)}</option>`).join("")}</select>
            <button class="add-cart" data-add="${esc(p.id)}">${lang === "bn" ? "কার্টে যোগ" : "Add +"}</button>
          </div>
        </div>
      </article>`;
  }).join("") : `<p class="no-results">${lang === "bn" ? "কোনো পণ্য পাওয়া যায়নি।" : "No products found."}</p>`;
  document.getElementById("productCount").textContent = `${shown.length} ${lang === "bn" ? "টি পণ্য" : "products"}`;
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


/* Product photo gallery: tap the cover or any thumbnail to view images. */
const galleryStyle = document.createElement("style");
galleryStyle.textContent = `
.product-photo-strip{display:flex;gap:7px;padding:9px 10px;background:#fffdf8;overflow-x:auto;scrollbar-width:thin;scrollbar-color:#bda77f #eee8de}
.product-photo-thumb{display:block;flex:0 0 calc((100% - 28px)/5);min-width:0;height:66px;padding:2px;border:1px solid #e7dfd1;background:#fff;cursor:pointer;overflow:hidden}
.product-photo-thumb.active{border:2px solid #a1814d}
.product-photo-thumb img{display:block;width:100%;height:100%;object-fit:cover}
.product-photo-thumb:hover{border-color:#a1814d}
@media(max-width:620px){.product-photo-strip{gap:6px;padding:8px}.product-photo-thumb{flex-basis:calc((100% - 24px)/5);height:58px}}
.product-gallery-trigger{display:block;width:100%;padding:0;border:0;background:transparent;color:inherit;text-align:left;cursor:zoom-in;position:relative}
.product-gallery-trigger:hover{background:transparent}
.gallery-count{display:block;padding:8px 14px;background:#f7f3eb;color:#8a7048;font-size:10px;letter-spacing:.5px}
.product-gallery-modal{position:fixed;inset:0;z-index:9999;background:#171511eF;display:none;align-items:center;justify-content:center;padding:18px}
.product-gallery-modal.open{display:flex}
.gallery-dialog{width:min(760px,100%);max-height:94vh;overflow:auto;background:#fffdf8;padding:18px;position:relative}
.gallery-close{position:absolute;right:12px;top:12px;z-index:2;width:38px;height:38px;border:0;background:#201d18;color:white;font-size:24px;cursor:pointer}
.gallery-main{height:min(62vh,520px);display:grid;place-items:center;background:#f1ece3;margin-bottom:12px}
.gallery-main img{max-width:100%;max-height:100%;object-fit:contain}
.gallery-thumbs{display:flex;gap:9px;overflow-x:auto;padding:3px}
.gallery-thumb{width:72px;height:78px;flex:0 0 72px;padding:2px;border:1px solid #ded4c4;background:white;cursor:pointer}
.gallery-thumb.active{border:2px solid #a1814d}
.gallery-thumb img{width:100%;height:100%;object-fit:cover}
.gallery-info{padding:12px 2px 3px;display:flex;justify-content:space-between;gap:12px;align-items:center}
.gallery-info h3{font:500 20px Georgia,serif;margin:0;color:#211e19}
.gallery-info span{font-weight:700;color:#8a7048}
@media(max-width:600px){.gallery-dialog{padding:10px}.gallery-main{height:55vh}.gallery-info h3{font-size:16px}}
`;
document.head.appendChild(galleryStyle);
const galleryModal=document.createElement("div");
galleryModal.className="product-gallery-modal";
galleryModal.id="productGalleryModal";
galleryModal.innerHTML='<div class="gallery-dialog" role="dialog" aria-modal="true" aria-label="Product photo gallery"><button type="button" class="gallery-close" aria-label="Close gallery">×</button><div class="gallery-main"><img id="galleryMainImage" alt="Product view"></div><div class="gallery-thumbs" id="galleryThumbs"></div><div class="gallery-info"><h3 id="galleryProductName"></h3><span id="galleryProductPrice"></span></div></div>';
document.body.appendChild(galleryModal);
let activeGalleryProductId=null;
function openProductGallery(id){
  activeGalleryProductId=String(id);
  const p=products.find(item=>String(item.id)===String(id)); if(!p)return;
  const imgs=productImages(p); if(!imgs.length)return;
  document.getElementById("galleryProductName").textContent=p.name;
  document.getElementById("galleryProductPrice").textContent=money(p.price);
  const main=document.getElementById("galleryMainImage"), thumbs=document.getElementById("galleryThumbs");
  main.src=imgs[0]; main.alt=p.name;
  thumbs.innerHTML=imgs.map((url,i)=>`<button type="button" class="gallery-thumb ${i===0?'active':''}" data-gallery-index="${i}" aria-label="View photo ${i+1}"><img src="${esc(url)}" alt=""></button>`).join("");
  galleryModal.classList.add("open"); document.body.style.overflow="hidden";
}
productGrid.addEventListener("click",event=>{
  const thumb=event.target.closest("[data-card-photo]");
  if(!thumb)return;
  const id=String(thumb.dataset.cardPhoto);
  const product=products.find(p=>String(p.id)===id);
  if(!product)return;
  const image=productImages(product)[Number(thumb.dataset.photoIndex)];
  if(!image)return;
  const main=document.querySelector(`[data-main-product-image="${CSS.escape(id)}"]`);
  if(main)main.src=image;
  const card=thumb.closest("[data-product-card]");
  if(card)card.querySelectorAll(".product-photo-thumb").forEach(el=>el.classList.toggle("active",el===thumb));
});
productGrid.addEventListener("click",event=>{const trigger=event.target.closest("[data-gallery]");if(trigger)openProductGallery(trigger.dataset.gallery)});
document.getElementById("galleryThumbs").addEventListener("click",event=>{
  const button=event.target.closest("[data-gallery-index]");if(!button)return;
  const activeProduct=products.find(p=>String(p.id)===activeGalleryProductId);
  const imgs=activeProduct?productImages(activeProduct):[];
  const index=Number(button.dataset.galleryIndex); if(!imgs[index])return;
  document.getElementById("galleryMainImage").src=imgs[index];
  document.querySelectorAll(".gallery-thumb").forEach((el,i)=>el.classList.toggle("active",i===index));
});
function closeProductGallery(){galleryModal.classList.remove("open");document.body.style.overflow="";}
galleryModal.querySelector(".gallery-close").addEventListener("click",closeProductGallery);
galleryModal.addEventListener("click",event=>{if(event.target===galleryModal)closeProductGallery()});
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeProductGallery()});

renderCart();
startStore();

languageToggle.addEventListener("click", () => {
  renderProducts(productSearch.value);
  renderCart();
});
