/**
 * Agenda — pantalla principal.
 * Orquesta: carga de datos (mock hoy, Supabase mañana), selección de día,
 * bloque ahora/siguiente y timeline vertical.
 */

const SELECTED_DAY_KEY = "riesgird_selected_day";
const VALID_DAYS = [1, 2];

function readStoredDay() {
  const stored = Number(localStorage.getItem(SELECTED_DAY_KEY));
  return VALID_DAYS.includes(stored) ? stored : 1;
}

const state = {
  selectedDay: readStoredDay(),
  tracks: [],
  salas: [],
  ponentes: [],
  sesiones: [],
};

function byId(list) {
  const map = {};
  for (const item of list) map[item.id] = item;
  return map;
}

const TIPO_LABELS = {
  ceremonia: "Ceremonia",
  dialogo: "Diálogo multiactor",
  conferencia: "Conferencia",
  panel: "Panel",
};

function isBreakType(sesion) {
  return sesion.tipo === "registro" || sesion.tipo === "receso";
}

function trackTagHtml(sesion, onLight) {
  const cls = onLight ? "session-tag on-light" : "session-tag";
  if (sesion.tipo === "track") {
    const track = state.tracksById[sesion.track_id];
    return `<span class="${cls} ${track.color_key}">${track.letra} · ${track.nombre}</span>`;
  }
  const label = TIPO_LABELS[sesion.tipo] || sesion.tipo;
  return `<span class="${cls} ${sesion.tipo}">${label}</span>`;
}

function speakerNamesHtml(sesion) {
  const confirmados = sesion.ponente_ids
    .map((id) => state.ponentesById[id])
    .filter(Boolean)
    .map((p) => p.nombre);
  const pendientes = (sesion.instituciones_pendientes || []).map(
    (inst) => `<span class="pendiente-inline">Ponente pendiente (${inst})</span>`
  );
  return [...confirmados, ...pendientes].join(" · ");
}

function salaNombre(sesion) {
  const sala = state.salasById[sesion.sala_id];
  return sala ? sala.nombre : "";
}

function trackColorKey(sesion) {
  if (sesion.tipo === "track") return state.tracksById[sesion.track_id].color_key;
  return "primary";
}

function isWaterTrack(sesion) {
  return trackColorKey(sesion) === "track-1";
}

function waterRippleHtml() {
  return `
    <span class="water-ripple" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle class="ripple-1" cx="12" cy="12" r="2"/>
        <circle class="ripple-2" cx="12" cy="12" r="2"/>
        <circle class="ripple-3" cx="12" cy="12" r="2"/>
      </svg>
    </span>
  `;
}

function favIconHtml(active) {
  return active
    ? '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.5 8.1 2.3 4.5 6 4c2.2-.3 4 .8 6 3 2-2.2 3.8-3.3 6-3 3.7.5 5.5 4.1 4 7.7C19.5 16.4 12 21 12 21z"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7.5-4.6-10-9.3C.5 8.1 2.3 4.5 6 4c2.2-.3 4 .8 6 3 2-2.2 3.8-3.3 6-3 3.7.5 5.5 4.1 4 7.7C19.5 16.4 12 21 12 21z"/></svg>';
}

function breakIconSvg() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>';
}

function emptyStateHtml(cls, message) {
  return `
    <div class="${cls}">
      <span class="empty-lupa" aria-hidden="true"><img src="assets/logo-icono-lupa-clean.png" alt="" /></span>
      <div>${message}</div>
    </div>
  `;
}

function pendingBadgeHtml(sesion) {
  return sesion.horario_por_confirmar ? `<span class="badge-pending">Horario a confirmar</span>` : "";
}

function breakRowHtml(sesion) {
  return `
    <div class="timeline-break">
      ${breakIconSvg()}
      <span class="timeline-break-time mono">${sesion.hora_inicio}–${sesion.hora_fin}</span>
      <span>${sesion.titulo}</span>
      ${pendingBadgeHtml(sesion)}
    </div>
  `;
}

function nowNextCardHtml(sesion, opts) {
  const isNow = opts && opts.isNow;

  if (isBreakType(sesion)) {
    return `
      <div class="${isNow ? "now-card" : "next-card"}" data-sesion-id="${sesion.id}">
        ${
          isNow
            ? `<div class="now-badge"><span class="pulse-dot"></span> Ahora</div>`
            : `<div class="next-label">Siguiente</div>`
        }
        <div class="session-title">${sesion.titulo}</div>
        <div class="session-meta"><span class="mono">${sesion.hora_inicio}–${sesion.hora_fin}</span></div>
      </div>
    `;
  }

  const fav = isFavorite(sesion.id);
  return `
    <div class="${isNow ? "now-card" : "next-card"}" data-sesion-id="${sesion.id}">
      ${isWaterTrack(sesion) ? waterRippleHtml() : ""}
      ${
        isNow
          ? `<div class="now-badge"><span class="pulse-dot"></span> Ahora</div>`
          : `<div class="next-label">Siguiente</div>`
      }
      <div class="session-card-top">
        <div>
          ${trackTagHtml(sesion, !isNow)}
          <div class="session-title">${sesion.titulo}</div>
        </div>
        <button class="fav-btn${fav ? " is-fav" : ""}" data-fav-toggle="${sesion.id}" aria-label="Marcar como favorito">
          ${favIconHtml(fav)}
        </button>
      </div>
      <div class="session-meta">
        <span class="mono">${sesion.hora_inicio}–${sesion.hora_fin}</span>
        ${salaNombre(sesion) ? `<span class="mono">${salaNombre(sesion)}</span>` : ""}
      </div>
      ${speakerNamesHtml(sesion) ? `<div class="session-speakers">${speakerNamesHtml(sesion)}</div>` : ""}
    </div>
  `;
}

function renderNowNext() {
  const mount = document.getElementById("now-next-mount");
  const sesionesDelDia = state.sesiones.filter((s) => s.dia === state.selectedDay);
  const nowHHMM = getCurrentHHMM();
  const { now, next } = findNowAndNext(sesionesDelDia, nowHHMM);

  if (now.length === 0 && next.length === 0) {
    mount.innerHTML = emptyStateHtml("empty-now", `No hay sesiones programadas en este momento para el Día ${state.selectedDay}.`);
    return;
  }

  const nowHtml = now.length
    ? now.map((s) => nowNextCardHtml(s, { isNow: true })).join("")
    : emptyStateHtml("empty-now", "Ninguna sesión en curso ahora mismo.");

  const nextHtml = next.map((s) => nowNextCardHtml(s, { isNow: false })).join("");

  mount.innerHTML = nowHtml + nextHtml;
}

function renderTimeline() {
  const mount = document.getElementById("timeline-mount");
  const sesionesDelDia = state.sesiones
    .filter((s) => s.dia === state.selectedDay)
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  if (sesionesDelDia.length === 0) {
    mount.innerHTML = emptyStateHtml("empty-state", "Aún no hay sesiones cargadas para este día.");
    return;
  }

  const nowHHMM = getCurrentHHMM();

  const itemsHtml = sesionesDelDia
    .map((s) => {
      const active = isSessionNow(s, nowHHMM);

      if (isBreakType(s)) {
        return `
          <div class="timeline-item${active ? " is-now" : ""}">
            <div class="timeline-time mono">${s.hora_inicio}</div>
            <div class="timeline-dot"></div>
            ${breakRowHtml(s)}
          </div>
        `;
      }

      const trackKey = trackColorKey(s);
      const fav = isFavorite(s.id);
      return `
        <div class="timeline-item${active ? " is-now" : ""}">
          <div class="timeline-time mono">${s.hora_inicio}</div>
          <div class="timeline-dot"></div>
          <div class="session-card${active ? " is-now" : ""}" data-track="${trackKey}" data-sesion-id="${s.id}">
            ${isWaterTrack(s) ? waterRippleHtml() : ""}
            <div class="session-card-top">
              <div>
                ${trackTagHtml(s, false)}
                <div class="session-title">${s.titulo}</div>
              </div>
              <button class="fav-btn${fav ? " is-fav" : ""}" data-fav-toggle="${s.id}" aria-label="Marcar como favorito">
                ${favIconHtml(fav)}
              </button>
            </div>
            <div class="session-meta">
              <span class="mono">${s.hora_inicio}–${s.hora_fin}</span>
              ${salaNombre(s) ? `<span class="mono">${salaNombre(s)}</span>` : ""}
            </div>
            ${speakerNamesHtml(s) ? `<div class="session-speakers">${speakerNamesHtml(s)}</div>` : ""}
          </div>
        </div>
      `;
    })
    .join("");

  mount.innerHTML = `<div class="timeline" id="timeline">${itemsHtml}</div>`;
  renderTopoConnector(document.getElementById("timeline"));
  observeBlueprintCards(mount);
}

// Efecto "blueprint": el contorno de cada tarjeta de sesión se dibuja solo
// cuando entra al viewport al hacer scroll, como si el plano se fuera
// levantando a medida que avanzás por el cronograma.
let blueprintObserver;

function getBlueprintObserver() {
  if (blueprintObserver !== undefined) return blueprintObserver;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    blueprintObserver = null;
    return blueprintObserver;
  }
  blueprintObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        drawBlueprintBorder(entry.target);
        blueprintObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );
  return blueprintObserver;
}

function observeBlueprintCards(mount) {
  const observer = getBlueprintObserver();
  if (!observer) return;
  mount.querySelectorAll(".session-card").forEach((card) => observer.observe(card));
}

function drawBlueprintBorder(card) {
  const w = card.offsetWidth;
  const h = card.offsetHeight;
  if (!w || !h) return;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "blueprint-svg");
  svg.setAttribute("width", String(w));
  svg.setAttribute("height", String(h));
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.zIndex = "2";
  svg.style.pointerEvents = "none";

  const rectEl = document.createElementNS(svgNS, "rect");
  rectEl.setAttribute("x", "1");
  rectEl.setAttribute("y", "1");
  rectEl.setAttribute("width", String(Math.max(w - 2, 0)));
  rectEl.setAttribute("height", String(Math.max(h - 2, 0)));
  rectEl.setAttribute("rx", "15");
  rectEl.setAttribute("fill", "none");
  rectEl.setAttribute("stroke", "rgba(255,255,255,0.85)");
  rectEl.setAttribute("stroke-width", "1.5");
  svg.appendChild(rectEl);
  card.appendChild(svg);

  const length = rectEl.getTotalLength();
  rectEl.style.strokeDasharray = String(length);
  rectEl.style.strokeDashoffset = String(length);
  requestAnimationFrame(() => {
    rectEl.style.transition = "stroke-dashoffset 0.9s ease-out";
    rectEl.style.strokeDashoffset = "0";
  });
}

function renderTopoConnector(timelineEl) {
  if (!timelineEl) return;
  const dots = timelineEl.querySelectorAll(".timeline-dot");
  if (dots.length < 2) return;

  const contRect = timelineEl.getBoundingClientRect();
  const pts = Array.from(dots).map((d) => {
    const r = d.getBoundingClientRect();
    return { x: r.left - contRect.left + r.width / 2, y: r.top - contRect.top + r.height / 2 };
  });

  let path = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const midY = (p0.y + p1.y) / 2;
    const wobble = i % 2 === 0 ? 8 : -8;
    path += ` C ${p0.x + wobble} ${midY} ${p1.x - wobble} ${midY} ${p1.x} ${p1.y}`;
  }

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "topo-line");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", String(contRect.height));
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.zIndex = "0";
  svg.style.pointerEvents = "none";
  svg.innerHTML = `<path d="${path}" fill="none" stroke="#D8D2C2" stroke-width="2" stroke-linecap="round"/>`;
  timelineEl.prepend(svg);

  // Efecto "se dibuja solo": el trazo arranca oculto (dashoffset = su propio
  // largo) y se revela hacia 0, como si el terreno se fuera levantando.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const pathEl = svg.querySelector("path");
  const length = pathEl.getTotalLength();
  pathEl.style.strokeDasharray = String(length);
  pathEl.style.strokeDashoffset = String(length);
  requestAnimationFrame(() => {
    pathEl.style.transition = `stroke-dashoffset ${Math.min(1.8, 0.5 + length / 700)}s ease-out`;
    pathEl.style.strokeDashoffset = "0";
  });
}

function renderDayTabs() {
  const mount = document.getElementById("day-tabs-mount");
  const days = [1, 2];
  mount.innerHTML = days
    .map(
      (d) => `
        <button class="day-tab${d === state.selectedDay ? " active" : ""}" data-day="${d}">
          Día ${d}
        </button>
      `
    )
    .join("");
}

function wireEvents() {
  document.getElementById("day-tabs-mount").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-day]");
    if (!btn) return;
    state.selectedDay = Number(btn.dataset.day);
    localStorage.setItem(SELECTED_DAY_KEY, String(state.selectedDay));
    renderDayTabs();
    renderNowNext();
    renderTimeline();
    document.getElementById("day-pill").textContent = `Día ${state.selectedDay} / 2`;
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fav-toggle]");
    if (!btn) return;
    const sesionId = btn.dataset.favToggle;
    const active = toggleFavorite(sesionId);
    btn.classList.toggle("is-fav", active);
    btn.innerHTML = favIconHtml(active);
  });
}

async function init() {
  const [tracks, salas, ponentes, sesiones] = await Promise.all([
    getTracks(),
    getSalas(),
    getPonentes(),
    getAgenda(),
  ]);

  state.tracks = tracks;
  state.salas = salas;
  state.ponentes = ponentes;
  state.sesiones = sesiones;
  state.tracksById = byId(tracks);
  state.salasById = byId(salas);
  state.ponentesById = byId(ponentes);

  renderDayTabs();
  renderNowNext();
  renderTimeline();
  wireEvents();
  document.getElementById("day-pill").textContent = `Día ${state.selectedDay} / 2`;

  // refresco periódico para que "ahora/siguiente" se mantenga vivo sin recargar
  setInterval(() => {
    renderNowNext();
    renderTimeline();
  }, 30000);
}

document.addEventListener("DOMContentLoaded", init);
