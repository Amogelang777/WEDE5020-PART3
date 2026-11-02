/* We Care Old Age - site scripts */
"use strict";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initFadeIn();
  initCounters();
  initCarousel();
  initAccordion();
  initTabs();
  initModal();
  initLightbox();
  initMap();
  initServices();
  initEnquiryForm();
  initContactForm();
  initToTop();
});

/* ---------- navigation ---------- */
function initNav() {
  const header = $(".site-header");
  const toggle = $(".nav-toggle");
  const nav = $(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.classList.remove("open");
    }));
  }
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
}

/* ---------- scroll animations ---------- */
function initFadeIn() {
  const items = $$(".fade-in");
  if (!("IntersectionObserver" in window)) { items.forEach((i) => i.classList.add("visible")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

/* ---------- animated counters ---------- */
function initCounters() {
  const nums = $$("[data-count]");
  if (!nums.length || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const dur = 1600;
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach((n) => io.observe(n));
}

/* ---------- testimonial carousel ---------- */
function initCarousel() {
  const slides = $$(".slide");
  const dotsBox = $(".dots");
  if (!slides.length || !dotsBox) return;
  let i = 0, timer;
  const dots = slides.map((_, n) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", "Show testimonial " + (n + 1));
    b.addEventListener("click", () => { go(n); restart(); });
    dotsBox.appendChild(b);
    return b;
  });
  const go = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("active", k === i));
    dots.forEach((d, k) => d.classList.toggle("active", k === i));
  };
  const restart = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), 5500); };
  go(0);
  restart();
}

/* ---------- accordion ---------- */
function initAccordion() {
  const heads = $$(".accordion-header");
  heads.forEach((btn) => {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      heads.forEach((b) => { b.setAttribute("aria-expanded", "false"); b.nextElementSibling.style.maxHeight = null; });
      if (!open) {
        btn.setAttribute("aria-expanded", "true");
        btn.nextElementSibling.style.maxHeight = btn.nextElementSibling.scrollHeight + "px";
      }
    });
  });
}

/* ---------- tabs ---------- */
function initTabs() {
  const tabs = $$(".tab-btn");
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    tabs.forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
    $$(".tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    $("#" + tab.dataset.target).classList.add("active");
  }));
}

/* ---------- modal ---------- */
function initModal() {
  const modal = $("#visit-modal");
  if (!modal) return;
  const close = () => modal.classList.remove("open");
  $$("[data-open-modal]").forEach((b) => b.addEventListener("click", () => modal.classList.add("open")));
  $$("[data-close-modal]").forEach((b) => b.addEventListener("click", close));
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

/* ---------- gallery lightbox ---------- */
function initLightbox() {
  const imgs = $$(".gallery img");
  if (!imgs.length) return;
  const box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.innerHTML = '<button class="lb-close" aria-label="Close">&times;</button>' +
    '<button class="lb-prev" aria-label="Previous">&#10094;</button><img alt="">' +
    '<button class="lb-next" aria-label="Next">&#10095;</button>';
  document.body.appendChild(box);
  const big = $("img", box);
  let index = 0;
  const show = (n) => { index = (n + imgs.length) % imgs.length; big.src = imgs[index].src; big.alt = imgs[index].alt; };
  const close = () => box.classList.remove("open");
  imgs.forEach((img, n) => img.addEventListener("click", () => { show(n); box.classList.add("open"); }));
  $(".lb-close", box).addEventListener("click", close);
  $(".lb-prev", box).addEventListener("click", () => show(index - 1));
  $(".lb-next", box).addEventListener("click", () => show(index + 1));
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => {
    if (!box.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
}

/* ---------- Leaflet map ---------- */
function initMap() {
  if (!$("#map") || typeof L === "undefined") return;
  const pos = [-26.1076, 28.0567];
  const map = L.map("map", { scrollWheelZoom: false }).setView(pos, 14);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  L.marker(pos).addTo(map).bindPopup("<b>We Care Old Age</b><br>123 Dignity Street, Sandton").openPopup();
}

/* ---------- dynamic services ---------- */
const FALLBACK_SERVICES = [
  { id: 1, name: "24-Hour Nursing Care", category: "Medical", icon: "🩺", price: 4500, description: "Qualified nurses on duty day and night, monitoring health and responding to every need." },
  { id: 2, name: "Meals & Nutrition", category: "Lifestyle", icon: "🍲", price: 1800, description: "Three healthy, balanced meals plus snacks daily, with dietary needs catered for." },
  { id: 3, name: "Medical Support", category: "Medical", icon: "💊", price: 2200, description: "Regular doctor visits and careful medication management for every resident." },
  { id: 4, name: "Social Activities", category: "Lifestyle", icon: "🎲", price: 900, description: "Games, crafts, music and birthday celebrations that keep residents connected and happy." },
  { id: 5, name: "Laundry & Housekeeping", category: "Home", icon: "🧺", price: 1100, description: "Spotless rooms, fresh bedding and laundry handled with care." }
];

async function loadServices() {
  try {
    const res = await fetch("data/services.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (err) {
    return FALLBACK_SERVICES; // e.g. opened straight from disk
  }
}

function initServices() {
  const list = $("#service-list");
  if (!list) return;
  const search = $("#service-search"), filter = $("#service-filter"), sort = $("#service-sort"), count = $("#service-count");
  let all = [];

  const render = () => {
    const term = search.value.trim().toLowerCase();
    const items = all.filter((s) =>
      (filter.value === "all" || s.category === filter.value) &&
      (s.name.toLowerCase().includes(term) || s.description.toLowerCase().includes(term)));
    const [key, dir] = sort.value.split("-");
    items.sort((a, b) => {
      const r = key === "price" ? a.price - b.price : a.name.localeCompare(b.name);
      return dir === "desc" ? -r : r;
    });

    list.innerHTML = "";
    items.forEach((s) => {
      const card = document.createElement("article");
      card.className = "service-card";
      card.innerHTML = '<div class="icon"></div><span class="tag"></span><h3></h3><p></p><div class="price"></div>';
      $(".icon", card).textContent = s.icon || "✚";
      $(".tag", card).textContent = s.category;
      $("h3", card).textContent = s.name;
      $("p", card).textContent = s.description;
      $(".price", card).innerHTML = "<strong></strong> <small>/ month</small>";
      $(".price strong", card).textContent = "From R" + s.price.toLocaleString("en-ZA");
      list.appendChild(card);
    });
    count.textContent = items.length ? items.length + " service" + (items.length > 1 ? "s" : "") + " found" : "No services match your search.";
  };

  loadServices().then((data) => { all = data; render(); });
  [search, filter, sort].forEach((c) => c.addEventListener("input", render));
}

/* ---------- form validation ---------- */
function showError(input, msg) {
  const err = input.parentElement.querySelector(".error-msg");
  input.classList.add("invalid");
  input.setAttribute("aria-invalid", "true");
  if (err) err.textContent = msg;
}
function clearError(input) {
  const err = input.parentElement.querySelector(".error-msg");
  input.classList.remove("invalid");
  input.removeAttribute("aria-invalid");
  if (err) err.textContent = "";
}

function validateField(input) {
  const v = input.value.trim();
  clearError(input);
  if (input.required && !v) { showError(input, input.tagName === "SELECT" ? "Please choose an option." : "This field is required."); return false; }
  if (input.name === "name" && v && !/^[A-Za-z][A-Za-z '\-]{1,49}$/.test(v)) { showError(input, "Enter a valid name (letters only, 2-50 characters)."); return false; }
  if (input.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { showError(input, "Enter a valid email address."); return false; }
  if (input.name === "phone" && v && !/^(\+27|0)[0-9]{9}$/.test(v.replace(/\s/g, ""))) { showError(input, "Enter a valid SA number, e.g. 0682238058 or +27682238058."); return false; }
  if (input.name === "date" && v) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (new Date(v) < today) { showError(input, "The date cannot be in the past."); return false; }
  }
  if (input.tagName === "TEXTAREA" && v && (v.length < 10 || v.length > 500)) { showError(input, "Message must be between 10 and 500 characters."); return false; }
  return true;
}
function validateForm(form) {
  let ok = true, firstBad = null;
  $$("input, select, textarea", form).forEach((f) => { if (!validateField(f)) { ok = false; firstBad = firstBad || f; } });
  if (firstBad) firstBad.focus();
  return ok;
}
function liveValidate(form) {
  $$("input, select, textarea", form).forEach((f) => {
    f.addEventListener("blur", () => validateField(f));
    f.addEventListener("input", () => { if (f.classList.contains("invalid")) validateField(f); });
  });
}

/* ---------- enquiry form (AJAX) ---------- */
function initEnquiryForm() {
  const form = $("#enquiry-form");
  if (!form) return;
  liveValidate(form);
  const dateInput = form.elements["date"];
  if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const out = $("#enquiry-result");
    if (!validateForm(form)) {
      out.className = "result error";
      out.textContent = "Please correct the highlighted fields.";
      return;
    }
    out.className = "result success";
    out.textContent = "Checking availability and cost...";

    const services = await loadServices();
    const svc = services.find((s) => String(s.id) === form.elements["service"].value);
    const months = parseInt(form.elements["months"].value, 10);
    const discount = months >= 6 ? 0.05 : 0;
    const total = svc.price * months * (1 - discount);
    const name = form.elements["name"].value.trim();
    const phone = form.elements["phone"].value.trim();

    out.innerHTML = "";
    const p1 = document.createElement("p");
    p1.textContent = "Thank you, " + name + ". Your enquiry about " + svc.name + " has been received.";
    const p2 = document.createElement("p");
    p2.innerHTML = 'Estimated cost for ' + months + ' month(s):<br><span class="quote-total"></span>';
    $(".quote-total", p2).textContent = "R" + total.toLocaleString("en-ZA");
    const p3 = document.createElement("p");
    p3.textContent = (discount ? "A 5% discount for 6+ months is included. " : "") +
      "Places are currently available. We will contact you on " + phone + " to arrange a visit.";
    out.append(p1, p2, p3);
    out.scrollIntoView({ behavior: "smooth", block: "center" });
    form.reset();
  });
}

/* ---------- contact form (compiles an email) ---------- */
const RECIPIENT = "info@wecareoldage.co.za";

function initContactForm() {
  const form = $("#contact-form");
  if (!form) return;
  liveValidate(form);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const out = $("#contact-result");
    if (!validateForm(form)) {
      out.className = "result error";
      out.textContent = "Please correct the highlighted fields.";
      return;
    }
    const f = form.elements;
    const subject = "[" + f["type"].value + "] Message from " + f["name"].value.trim();
    const body = "Name: " + f["name"].value.trim() + "\n" +
      "Email: " + f["email"].value.trim() + "\n" +
      "Phone: " + f["phone"].value.trim() + "\n" +
      "Message type: " + f["type"].value + "\n\n" +
      f["message"].value.trim();

    out.className = "result success";
    out.innerHTML = "";
    const h = document.createElement("p");
    h.innerHTML = "<strong>Your email is ready.</strong> Review it below, then click Send Email.";
    const pre = document.createElement("pre");
    pre.textContent = "To: " + RECIPIENT + "\nSubject: " + subject + "\n\n" + body;
    const a = document.createElement("a");
    a.className = "btn";
    a.href = "mailto:" + RECIPIENT + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    a.textContent = "Send Email";
    out.append(h, pre, a);
    out.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* ---------- back to top ---------- */
function initToTop() {
  const btn = $(".to-top");
  if (!btn) return;
  window.addEventListener("scroll", () => btn.classList.toggle("show", window.scrollY > 500), { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}
