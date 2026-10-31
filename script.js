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
