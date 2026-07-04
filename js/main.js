/* ===================================================================
   Casa Trini Formentera — behaviour
   Language switching, mobile nav, sticky header, gallery + lightbox,
   and the inquiry form.
   =================================================================== */

/* ---- CONFIG ----------------------------------------------------------------
   The inquiry form uses FormSubmit (https://formsubmit.co) — free, no signup —
   in standard POST mode: on submit the browser shows FormSubmit's reCAPTCHA,
   emails the inquiry, then returns the guest to thanks.html.
   • The destination email is the form's `action` in index.html.
   • FIRST submission: FormSubmit emails that address a one-time confirmation
     link — click it once to activate; all future inquiries then arrive.
   • To hide your address, replace the email in the form `action` with the
     random alias FormSubmit gives you after activation. */
const CONTACT_EMAIL = "franciscoformentera2019@hotmail.com";
const BOOKING_URLS = {
  airbnb: "https://www.airbnb.com/rooms/648870699251352349"  // Casa Trini on Airbnb
};

/* ---- Google reviews -------------------------------------------------------
   Option A (live): add a Google Maps Platform API key with the Places API (New)
   enabled. Get the exact Place ID from https://developers.google.com/maps/documentation/places/web-service/place-id
   (search "Casa Trini Formentera"). Up to 5 reviews will load automatically.
   Option B (widget): paste a Trustindex / Elfsight embed into #reviewsWidget in index.html.
   Option C (manual): fill the TESTIMONIALS array below with real review quotes. */
const GOOGLE_PLACES = {
  apiKey:  "",                               // e.g. "AIza..."  (leave "" to skip live fetch)
  placeId: "ChIJEQlGRAVZmRIRIYDEy4Xb5qU"     // Casa Trini Formentera — verify with the Place ID finder
};
// Hand-picked quotes shown when no API key is set. Replace with real Google reviews.
const TESTIMONIALS = [
  { name: "Marta", when: "Google review", rating: 5, text: "An authentic Formentera home surrounded by a huge green garden. The pool is enormous and the house gave our family all the space and privacy we needed." },
  { name: "Thomas", when: "Google review", rating: 5, text: "Peaceful, rustic and beautifully kept. Ten minutes on foot to the sea, yet you feel completely secluded. We will be back." },
  { name: "Giulia", when: "Google review", rating: 5, text: "Wonderful hosts and a magical setting — whitewashed walls, stone, pines and flowers everywhere. The perfect base to discover the island." }
];
const SUPPORTED = ["en", "es", "de", "it", "fr", "sv"];
const LANG_LABEL = { en: "EN", es: "ES", de: "DE", it: "IT", fr: "FR", sv: "SV" };
/* -------------------------------------------------------------------------- */

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* Asset base — derived from where this script is served, so relative gallery
   paths resolve correctly on any page depth (/, /en/, …) and on any domain
   (github.io/casa-trini or the custom domain). e.g. ".../casa-trini/" */
const ASSET_BASE = (function () {
  const s = document.currentScript && document.currentScript.src;
  return s ? s.replace(/js\/main\.js.*$/, "") : "";
})();

/* ---------- i18n ---------- */
function detectLang() {
  const saved = localStorage.getItem("ct_lang");
  if (saved && SUPPORTED.includes(saved)) return saved;
  const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
  return SUPPORTED.includes(nav) ? nav : "en";
}

function applyLang(lang) {
  const dict = I18N[lang] || I18N.en;
  $$("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const val = dict[key];
    if (val == null) return;
    if (el.tagName === "META") el.setAttribute("content", val);
    else el.textContent = val;
  });
  document.documentElement.lang = lang;
  $("#langCurrent").textContent = LANG_LABEL[lang];
  $$("#langMenu button").forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
  localStorage.setItem("ct_lang", lang);
  if (window.refreshDynamic) window.refreshDynamic();  // re-render JS-set text (nights, guests)
}

/* ---------- Header scroll state ---------- */
const header = $("#siteHeader");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Mobile nav ---------- */
const nav = $("#mainNav");
const navToggle = $("#navToggle");
function closeNav() {
  nav.classList.remove("open");
  document.body.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
}
navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  document.body.classList.toggle("nav-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
});
$$("#mainNav a").forEach(a => a.addEventListener("click", closeNav));

/* ---------- Language menu ---------- */
const langBtn = $("#langBtn");
const langMenu = $("#langMenu");
langBtn.addEventListener("click", e => {
  e.stopPropagation();
  const open = langMenu.classList.toggle("open");
  langBtn.setAttribute("aria-expanded", String(open));
});
// The language switcher is now real links to /, /en/, /de/, … — remember the
// visitor's explicit choice so the root page's auto-detect respects it.
$$("#langMenu a").forEach(a =>
  a.addEventListener("click", () => {
    if (a.dataset.lang) localStorage.setItem("ct_lang", a.dataset.lang);
  })
);
document.addEventListener("click", () => langMenu.classList.remove("open"));

/* ---------- Gallery ---------- */
const grid = $("#galleryGrid");
GALLERY.forEach((item, i) => {
  const fig = document.createElement("figure");
  fig.dataset.index = i;
  const img = document.createElement("img");
  img.src = ASSET_BASE + item.src;
  img.loading = "lazy";
  img.decoding = "async";
  if (item.w) img.width = item.w;
  if (item.h) img.height = item.h;
  img.alt = "Casa Trini Formentera — holiday home in Formentera, photo " + (i + 1);
  fig.appendChild(img);
  grid.appendChild(fig);
});

/* Balanced masonry: each tile is sized from its own aspect ratio, then placed
   into the currently-shortest column so the bottom edge lines up instead of
   ending raggedly. A small symmetric offset pushes the outer columns down and
   keeps the inner ones up — an intentional cascade: staggered top, level bottom. */
const GAL_ROW = 8, GAL_GAP = 14;
function layoutGallery() {
  const figs = [...grid.children];
  if (!figs.length) return;
  const cs = getComputedStyle(grid);
  const cols = cs.gridTemplateColumns.split(" ").filter(Boolean).length || 1;
  const colW = (grid.clientWidth - GAL_GAP * (cols - 1)) / cols;
  const spanOf = fig => {
    const item = GALLERY[+fig.dataset.index];
    const ratio = item && item.w && item.h ? item.h / item.w : 0.72;
    const h = colW * ratio;
    return Math.max(1, Math.round((h + GAL_GAP) / (GAL_ROW + GAL_GAP)));
  };
  // Next free row-line per column (1-indexed). Seed outer columns lower for a
  // gentle symmetric cascade; single-column mobile stays flush.
  const OFFSET = 3;
  const nextRow = new Array(cols).fill(1);
  if (cols >= 3) { nextRow[0] += OFFSET; nextRow[cols - 1] += OFFSET; }
  for (const fig of figs) {
    let c = 0;
    for (let k = 1; k < cols; k++) if (nextRow[k] < nextRow[c]) c = k;
    const span = spanOf(fig);
    fig.style.gridColumnStart = c + 1;
    fig.style.gridRowStart = nextRow[c];
    fig.style.gridRowEnd = "span " + span;
    nextRow[c] += span;
  }
}
layoutGallery();
let galResizeRAF;
window.addEventListener("resize", () => {
  cancelAnimationFrame(galResizeRAF);
  galResizeRAF = requestAnimationFrame(layoutGallery);
});

/* ---------- Lightbox ---------- */
const lb = $("#lightbox");
const lbImg = $("#lbImg");
let lbIndex = 0;

function openLb(i) {
  lbIndex = (i + GALLERY.length) % GALLERY.length;
  lbImg.src = ASSET_BASE + GALLERY[lbIndex].src;
  lb.classList.add("open");
  lb.setAttribute("aria-hidden", "false");
  document.body.classList.add("nav-open");
}
function closeLb() {
  lb.classList.remove("open");
  lb.setAttribute("aria-hidden", "true");
  document.body.classList.remove("nav-open");
}
grid.addEventListener("click", e => {
  const fig = e.target.closest("figure");
  if (fig) openLb(+fig.dataset.index);
});
$("#lbClose").addEventListener("click", closeLb);
$("#lbPrev").addEventListener("click", e => { e.stopPropagation(); openLb(lbIndex - 1); });
$("#lbNext").addEventListener("click", e => { e.stopPropagation(); openLb(lbIndex + 1); });
lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
document.addEventListener("keydown", e => {
  if (!lb.classList.contains("open")) return;
  if (e.key === "Escape") closeLb();
  else if (e.key === "ArrowLeft") openLb(lbIndex - 1);
  else if (e.key === "ArrowRight") openLb(lbIndex + 1);
});

/* ---------- Booking links ---------- */
$$("[data-booking]").forEach(a => {
  const url = BOOKING_URLS[a.dataset.booking];
  if (url) a.href = url;
});

/* ---------- Inquiry form (FormSubmit standard POST + reCAPTCHA) ---------- */
const form = $("#inquiryForm");
function t(key) { return (I18N[document.documentElement.lang] || I18N.en)[key]; }

// After FormSubmit shows its captcha, return the guest to our thank-you page
// (resolved against the current URL so it works on any domain / subpath).
const nextField = $("#cf-next");
if (nextField) nextField.value = ASSET_BASE + "thanks.html";

/* --- Date helpers --- */
const pad = n => String(n).padStart(2, "0");
const isoAddDays = (iso, n) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);          // built from parts → no timezone drift
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const isoToDMY = iso => { if (!iso) return ""; const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };
function nightsBetween(a, b) {
  if (!a || !b) return 0;
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

/* --- Nights badge --- */
const nightsBadge = $("#nightsBadge"), nightsText = $("#nightsText"), hNights = $("#hNights");
const dateState = { in: null, out: null };
function renderNights() {
  if (!nightsBadge) return;
  const n = nightsBetween(dateState.in, dateState.out);
  if (n > 0) { nightsText.innerHTML = `<strong>${n}</strong> ${t(n === 1 ? "form.night" : "form.nights")}`; nightsBadge.hidden = false; hNights.value = n; }
  else { nightsBadge.hidden = true; hNights.value = ""; }
}

/* --- Custom, themed date picker (always dd/mm/yyyy) --- */
const calEl = $("#calendar"), calGrid = $("#calGrid"), calTitle = $("#calTitle"), calWeekdays = $("#calWeekdays"), calMode = $("#calMode");
const inField = $("#cf-in"), outField = $("#cf-out"), hCheckin = $("#hCheckin"), hCheckout = $("#hCheckout");
let calRole = "in", calView = null;

function paintFields() {
  [["in", inField], ["out", outField]].forEach(([role, btn]) => {
    const span = btn.querySelector(".date-val");
    if (dateState[role]) { span.textContent = isoToDMY(dateState[role]); span.classList.remove("placeholder"); }
    else { span.textContent = "dd/mm/yyyy"; span.classList.add("placeholder"); }
  });
  hCheckin.value = isoToDMY(dateState.in);
  hCheckout.value = isoToDMY(dateState.out);
}
const minFor = role => role === "in" ? todayISO() : (dateState.in ? isoAddDays(dateState.in, 1) : isoAddDays(todayISO(), 1));

function positionCal(role) {
  const btn = role === "in" ? inField : outField, cont = $("#dateFields");
  const maxLeft = Math.max(0, cont.clientWidth - calEl.offsetWidth);
  calEl.style.left = Math.min(btn.offsetLeft, maxLeft) + "px";
  calEl.style.top = (btn.offsetTop + btn.offsetHeight + 6) + "px";
}

function renderCal() {
  if (!calView) return;
  const lang = document.documentElement.lang || "en";
  calMode.textContent = t(calRole === "in" ? "form.checkin" : "form.checkout");
  calTitle.textContent = new Intl.DateTimeFormat(lang, { month: "long", year: "numeric" }).format(new Date(calView.y, calView.m, 1));
  if (calWeekdays.dataset.lang !== lang) {
    calWeekdays.innerHTML = "";
    const monday = new Date(2024, 0, 1);         // a Monday
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      const s = document.createElement("span");
      s.textContent = new Intl.DateTimeFormat(lang, { weekday: "short" }).format(d).replace(".", "");
      calWeekdays.appendChild(s);
    }
    calWeekdays.dataset.lang = lang;
  }
  calGrid.innerHTML = "";
  const { y, m } = calView;
  const startDow = (new Date(y, m, 1).getDay() + 6) % 7;   // Monday-first
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const min = minFor(calRole), today = todayISO();
  for (let i = 0; i < startDow; i++) { const e = document.createElement("div"); e.className = "cal-day empty"; calGrid.appendChild(e); }
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${y}-${pad(m + 1)}-${pad(day)}`;
    const b = document.createElement("button");
    b.type = "button"; b.className = "cal-day"; b.textContent = day; b.dataset.iso = iso;
    if (iso < min) b.disabled = true;
    if (iso === today) b.classList.add("today");
    if (iso === dateState.in || iso === dateState.out) b.classList.add("selected");
    else if (dateState.in && dateState.out && iso > dateState.in && iso < dateState.out) b.classList.add("in-range");
    calGrid.appendChild(b);
  }
}

function openCal(role) {
  calRole = role;
  const base = (dateState[role] || minFor(role)).split("-").map(Number);
  calView = { y: base[0], m: base[1] - 1 };
  renderCal();
  calEl.hidden = false;
  inField.classList.toggle("open", role === "in");
  outField.classList.toggle("open", role === "out");
  positionCal(role);
}
function closeCal() { calEl.hidden = true; inField.classList.remove("open"); outField.classList.remove("open"); }

function selectDay(iso) {
  if (calRole === "in") {
    dateState.in = iso;
    if (dateState.out && dateState.out <= iso) dateState.out = null;  // drop now-invalid check-out
    paintFields(); renderNights();
    calRole = "out"; calView = { y: +iso.slice(0, 4), m: +iso.slice(5, 7) - 1 };  // continue to check-out
    renderCal(); inField.classList.remove("open"); outField.classList.add("open");
    positionCal("out");   // move the calendar under the check-out field so the switch is clear
  } else {
    dateState.out = iso; paintFields(); renderNights(); closeCal();
  }
}

if (inField && outField) {
  paintFields();
  const toggle = role => (!calEl.hidden && calRole === role) ? closeCal() : openCal(role);
  inField.addEventListener("click", e => { e.stopPropagation(); toggle("in"); });
  outField.addEventListener("click", e => { e.stopPropagation(); toggle("out"); });
  calEl.addEventListener("click", e => {
    e.stopPropagation();
    const nav = e.target.closest(".cal-nav");
    if (nav) {
      calView.m += +nav.dataset.cal;
      if (calView.m < 0) { calView.m = 11; calView.y--; }
      if (calView.m > 11) { calView.m = 0; calView.y++; }
      renderCal(); return;
    }
    const day = e.target.closest(".cal-day[data-iso]");
    if (day && !day.disabled) selectDay(day.dataset.iso);
  });
  document.addEventListener("click", () => { if (!calEl.hidden) closeCal(); });
}

/* --- Family-friendly guest picker --- */
const MAX_GUESTS = 8;
const party = { adults: 2, children: 0, ages: [] };
const adultsVal = $("#adultsVal"), childrenVal = $("#childrenVal"), childAges = $("#childAges"), partyNote = $("#partyNote");
const hAdults = $("#hAdults"), hChildren = $("#hChildren"), hAges = $("#hAges"), hGuests = $("#hGuests");

function ageOptions(sel) {
  let html = `<option value=""${sel === "" ? " selected" : ""}>${t("form.agePlaceholder")}</option>`;
  html += `<option value="0"${sel === "0" ? " selected" : ""}>${t("form.under1")}</option>`;
  for (let a = 1; a <= 17; a++) html += `<option value="${a}"${sel === String(a) ? " selected" : ""}>${a}</option>`;
  return html;
}

function renderParty() {
  if (!adultsVal) return;
  adultsVal.textContent = party.adults;
  childrenVal.textContent = party.children;
  const total = party.adults + party.children;

  childAges.innerHTML = "";
  for (let i = 0; i < party.children; i++) {
    const wrap = document.createElement("div");
    wrap.className = "child-age";
    wrap.innerHTML = `<label>${t("form.child")} ${i + 1}</label><select data-age="${i}">${ageOptions(party.ages[i] || "")}</select>`;
    childAges.appendChild(wrap);
  }

  $$(".step-btn").forEach(b => {
    const step = b.dataset.step, dir = +b.dataset.dir;
    b.disabled = dir < 0
      ? (step === "adults" ? party.adults <= 1 : party.children <= 0)
      : total >= MAX_GUESTS;
  });

  partyNote.textContent = total >= MAX_GUESTS ? t("form.full") : t("form.sleeps");
  $$(".preset").forEach(p =>
    p.classList.toggle("active", +p.dataset.adults === party.adults && +p.dataset.kids === party.children));

  hAdults.value = party.adults;
  hChildren.value = party.children;
  hGuests.value = total;
  hAges.value = party.ages.slice(0, party.children)
    .map(a => (a === "" || a == null) ? "?" : (a === "0" ? "<1" : a)).join(", ");
}

if (adultsVal) {
  $$(".step-btn").forEach(b => b.addEventListener("click", () => {
    const step = b.dataset.step, dir = +b.dataset.dir;
    if (dir > 0 && party.adults + party.children >= MAX_GUESTS) return;
    if (step === "adults") party.adults = Math.max(1, party.adults + dir);
    else {
      party.children = Math.max(0, party.children + dir);
      if (dir > 0) party.ages[party.children - 1] = "";
      else party.ages.length = party.children;
    }
    renderParty();
  }));

  $$(".preset").forEach(p => p.addEventListener("click", () => {
    party.adults = +p.dataset.adults;
    party.children = +p.dataset.kids;
    party.ages = Array(party.children).fill("");
    renderParty();
  }));

  childAges.addEventListener("change", e => {
    const sel = e.target.closest("select[data-age]");
    if (!sel) return;
    party.ages[+sel.dataset.age] = sel.value;          // update only the value, no rebuild
    hAges.value = party.ages.slice(0, party.children)
      .map(a => (a === "" || a == null) ? "?" : (a === "0" ? "<1" : a)).join(", ");
  });

  renderParty();
}

// keep JS-rendered text (nights, child labels, note, calendar) in sync on language change
window.refreshDynamic = () => {
  renderNights(); renderParty();
  if (calEl && !calEl.hidden) { calWeekdays.dataset.lang = ""; renderCal(); }
};

/* ---------- Reviews ---------- */
const reviewsGrid = $("#reviewsGrid");

function starRow(n) { const s = Math.round(n || 5); return "★★★★★☆☆☆☆☆".slice(5 - s, 10 - s); }

function reviewCard(r) {
  const card = document.createElement("div");
  card.className = "review-card";
  const initial = (r.name || "?").trim().charAt(0).toUpperCase();
  const avatar = r.photo
    ? `<span class="rc-avatar"><img src="${r.photo}" alt="" loading="lazy"></span>`
    : `<span class="rc-avatar">${initial}</span>`;
  card.innerHTML =
    `<div class="rc-stars" aria-hidden="true">${starRow(r.rating)}</div>` +
    `<p class="rc-text">${r.text}</p>` +
    `<div class="rc-author">${avatar}<span><span class="rc-name">${r.name}</span><br>` +
    `<span class="rc-when">${r.when || ""}</span></span></div>`;
  return card;
}

function renderTestimonials() {
  reviewsGrid.innerHTML = "";
  TESTIMONIALS.forEach(t => reviewsGrid.appendChild(reviewCard(t)));
}

async function loadGoogleReviews() {
  // If a widget was pasted into #reviewsWidget, let it handle everything.
  if ($("#reviewsWidget").children.length) return;
  if (!GOOGLE_PLACES.apiKey || !GOOGLE_PLACES.placeId) { renderTestimonials(); return; }
  try {
    const lang = document.documentElement.lang || "en";
    const url = `https://places.googleapis.com/v1/places/${GOOGLE_PLACES.placeId}` +
      `?languageCode=${lang}&fields=rating,userRatingCount,reviews&key=${GOOGLE_PLACES.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("places " + res.status);
    const data = await res.json();
    if (data.rating) $("#ratingNum").textContent = Number(data.rating).toFixed(1);
    if (data.userRatingCount) $("#ratingCount").textContent = ` · ${data.userRatingCount} ${t("reviews.count")}`;
    const revs = (data.reviews || []).slice(0, 6).map(r => ({
      name:   r.authorAttribution?.displayName || "Guest",
      photo:  r.authorAttribution?.photoUri || "",
      rating: r.rating || 5,
      when:   r.relativePublishTimeDescription || "Google review",
      text:   r.text?.text || r.originalText?.text || ""
    })).filter(r => r.text);
    reviewsGrid.innerHTML = "";
    if (revs.length) revs.forEach(r => reviewsGrid.appendChild(reviewCard(r)));
    else renderTestimonials();
  } catch (e) {
    renderTestimonials();
  }
}

/* ---------- Init ---------- */
$("#year").textContent = new Date().getFullYear();
// Each page is server-rendered in its own language; use that, not localStorage.
applyLang(document.documentElement.lang || "es");
loadGoogleReviews();
