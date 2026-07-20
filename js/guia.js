/**
 * Guía del visitante en Lima — hospedaje, transporte y emergencias.
 * Reemplaza a la antigua página de Tracks (esos datos siguen vivos en
 * mock-data.js y coloreando las sesiones en Agenda).
 */

const guiaState = {
  categoria: "hoteles",
  distritoFiltro: "Todos",
  hoteles: [],
  tours: [],
  taxis: [],
  emergencias: [],
};

const CATEGORIAS = [
  { id: "hoteles", label: "Hoteles" },
  { id: "transporte", label: "Transporte" },
  { id: "emergencias", label: "Emergencias" },
];

function starsHtml(n) {
  if (!n) return "";
  return `<div class="hotel-stars">${"★".repeat(n)}</div>`;
}

function pinIconSvg() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
}

function phoneIconSvg() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
}

function mailIconSvg() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>';
}

function renderCategoriaTabs() {
  const mount = document.getElementById("guia-tabs-mount");
  mount.innerHTML = CATEGORIAS.map(
    (c) => `<button class="day-tab${c.id === guiaState.categoria ? " active" : ""}" data-cat="${c.id}">${c.label}</button>`
  ).join("");
}

function renderHoteles() {
  const mount = document.getElementById("guia-content-mount");
  const distritos = ["Todos", ...new Set(guiaState.hoteles.map((h) => h.distrito))];
  const chipsHtml = distritos
    .map((d) => `<button class="filter-chip${d === guiaState.distritoFiltro ? " active" : ""}" data-distrito="${d}">${d}</button>`)
    .join("");

  const lista = guiaState.hoteles.filter(
    (h) => guiaState.distritoFiltro === "Todos" || h.distrito === guiaState.distritoFiltro
  );

  const cardsHtml = lista
    .map(
      (h) => `
        <div class="hotel-card">
          <div class="hotel-card-top">
            <div>
              <div class="hotel-name">${h.nombre}</div>
              ${h.cadena ? `<div class="hotel-chain">${h.cadena}</div>` : ""}
              ${starsHtml(h.categoria)}
            </div>
            <span class="hotel-district-chip">${h.distrito}</span>
          </div>
          <div class="hotel-detail-row">${pinIconSvg()}<span>${h.direccion}</span></div>
          <div class="hotel-detail-row">${phoneIconSvg()}<a href="tel:${h.telefono.replace(/\s|-/g, "")}">${h.telefono}</a></div>
          <div class="hotel-detail-row">${mailIconSvg()}<a href="mailto:${h.email}">${h.email}</a></div>
          ${h.contacto ? `<div class="hotel-sales-note"><strong>Contacto de ventas/eventos:</strong> ${h.contacto}</div>` : ""}
        </div>
      `
    )
    .join("");

  mount.innerHTML = `
    <div class="filter-chips">${chipsHtml}</div>
    ${cardsHtml || '<div class="empty-state">No hay hoteles en este distrito.</div>'}
  `;
}

function renderTransporte() {
  const mount = document.getElementById("guia-content-mount");

  const toursHtml = guiaState.tours
    .map(
      (t) => `
        <div class="transport-card">
          <div class="transport-card-top">
            <div class="transport-name">${t.nombre}</div>
            <span class="hotel-district-chip">${t.distrito}</span>
          </div>
          <div class="hotel-detail-row">${phoneIconSvg()}<a href="tel:${t.telefono.replace(/\s|-/g, "")}">${t.telefono}</a></div>
          <div class="hotel-detail-row">${mailIconSvg()}<a href="mailto:${t.email}">${t.email}</a></div>
          ${t.driveUrl ? `<div class="hotel-detail-row"><a href="${t.driveUrl}" target="_blank" rel="noopener">Ver catálogo de tours →</a></div>` : ""}
        </div>
      `
    )
    .join("");

  const taxisHtml = guiaState.taxis
    .map(
      (t) => `
        <div class="transport-card">
          <div class="transport-card-top">
            <div class="transport-name">${t.nombre}</div>
            ${t.recomendado ? `<span class="taxi-badge">Recomendado</span>` : ""}
          </div>
          <div class="transport-desc">${t.descripcion}</div>
          <div class="taxi-store-row">
            <a class="taxi-store-btn" href="${t.playStoreUrl}" target="_blank" rel="noopener">Google Play</a>
            <a class="taxi-store-btn" href="${t.appStoreUrl}" target="_blank" rel="noopener">App Store</a>
          </div>
        </div>
      `
    )
    .join("");

  mount.innerHTML = `
    <h2 class="section-label">Agencia de tours</h2>
    ${toursHtml}
    <h2 class="section-label">Apps de taxi</h2>
    ${taxisHtml}
  `;
}

function renderEmergencias() {
  const mount = document.getElementById("guia-content-mount");
  mount.innerHTML = guiaState.emergencias
    .map(
      (e) => `
        <div class="emergency-card">
          <div class="emergency-top">
            <div class="emergency-icon">${phoneIconSvg()}</div>
            <div>
              <div class="emergency-name">${e.nombre}</div>
              <div class="emergency-desc">${e.descripcion}</div>
            </div>
          </div>
          <a class="emergency-number-link mono" href="tel:${e.numero}">${phoneIconSvg()} ${e.numero}</a>
        </div>
      `
    )
    .join("");
}

function renderCategoria() {
  if (guiaState.categoria === "hoteles") renderHoteles();
  else if (guiaState.categoria === "transporte") renderTransporte();
  else renderEmergencias();
}

function wireGuiaEvents() {
  document.getElementById("guia-tabs-mount").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    guiaState.categoria = btn.dataset.cat;
    renderCategoriaTabs();
    renderCategoria();
  });

  document.getElementById("guia-content-mount").addEventListener("click", (e) => {
    const chip = e.target.closest("[data-distrito]");
    if (!chip) return;
    guiaState.distritoFiltro = chip.dataset.distrito;
    renderHoteles();
  });
}

async function initGuia() {
  const [hoteles, transporte, emergencias] = await Promise.all([getHoteles(), getTransporte(), getEmergencias()]);
  guiaState.hoteles = hoteles;
  guiaState.tours = transporte.tours;
  guiaState.taxis = transporte.taxis;
  guiaState.emergencias = emergencias;

  renderCategoriaTabs();
  renderCategoria();
  wireGuiaEvents();
}

document.addEventListener("DOMContentLoaded", initGuia);
