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

function favIconHtml(active) {
  return active
    ? '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.5 8.1 2.3 4.5 6 4c2.2-.3 4 .8 6 3 2-2.2 3.8-3.3 6-3 3.7.5 5.5 4.1 4 7.7C19.5 16.4 12 21 12 21z"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7.5-4.6-10-9.3C.5 8.1 2.3 4.5 6 4c2.2-.3 4 .8 6 3 2-2.2 3.8-3.3 6-3 3.7.5 5.5 4.1 4 7.7C19.5 16.4 12 21 12 21z"/></svg>';
}

function breakIconSvg() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>';
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
    mount.innerHTML = `<div class="empty-now">No hay sesiones programadas en este momento para el Día ${state.selectedDay}.</div>`;
    return;
  }

  const nowHtml = now.length
    ? now.map((s) => nowNextCardHtml(s, { isNow: true })).join("")
    : `<div class="empty-now">Ninguna sesión en curso ahora mismo.</div>`;

  const nextHtml = next.map((s) => nowNextCardHtml(s, { isNow: false })).join("");

  mount.innerHTML = nowHtml + nextHtml;
}

function renderTimeline() {
  const mount = document.getElementById("timeline-mount");
  const sesionesDelDia = state.sesiones
    .filter((s) => s.dia === state.selectedDay)
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  if (sesionesDelDia.length === 0) {
    mount.innerHTML = `<div class="empty-state">Aún no hay sesiones cargadas para este día.</div>`;
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
