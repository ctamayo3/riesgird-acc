/**
 * Salas — listado con la sesión en curso en cada una (si existe),
 * para ayudar al asistente a ubicarse dentro del venue.
 */

const SALA_ICONS = {
  "aud-principal":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="10" rx="1.5"/><path d="M9 20h6M12 14v6"/><path d="M4 20c1.5-1 3-1 4 0M20 20c-1.5-1-3-1-4 0"/></svg>',
  "por-confirmar":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5"/><circle cx="12" cy="16.5" r="0.5" fill="currentColor"/></svg>',
};

const CALENDAR_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>';

async function renderSalas() {
  const mount = document.getElementById("salas-mount");
  const storedDay = Number(localStorage.getItem("riesgird_selected_day"));
  const selectedDay = [1, 2].includes(storedDay) ? storedDay : 1;

  const [salas, sesiones, tracks] = await Promise.all([getSalas(), getAgenda(), getTracks()]);
  const tracksById = {};
  tracks.forEach((t) => (tracksById[t.id] = t));

  const sesionesDelDia = sesiones.filter((s) => s.dia === selectedDay);
  const nowHHMM = getCurrentHHMM();

  mount.innerHTML = salas
    .map((sala) => {
      const activa = sesionesDelDia.find((s) => s.sala_id === sala.id && isSessionNow(s, nowHHMM));
      const icono = SALA_ICONS[sala.id] || SALA_ICONS["por-confirmar"];
      return `
        <div class="sala-card${activa ? " is-now" : ""}" id="sala-${sala.id}">
          <div class="sala-icon">${icono}</div>
          <div style="flex:1; min-width:0;">
            <div class="sala-name">${sala.nombre}</div>
            <div class="sala-meta">${sala.ubicacion}${sala.capacidad ? ` · Aforo ${sala.capacidad}` : ""}</div>
            ${
              activa
                ? `<div class="sala-status sala-status--now"><span class="pulse-dot"></span>Ahora: ${activa.titulo}</div>`
                : `<div class="sala-status sala-status--free">${CALENDAR_ICON}Sin sesión en curso (Día ${selectedDay})</div>`
            }
          </div>
        </div>
      `;
    })
    .join("");

  wireCampusMap(salas, sesionesDelDia, nowHHMM);
}

function wireCampusMap(salas, sesionesDelDia, nowHHMM) {
  document.querySelectorAll(".campus-hotspot").forEach((hotspot) => {
    const salaId = hotspot.dataset.sala;
    const sala = salas.find((s) => s.id === salaId);
    if (!sala) return;

    const activa = sesionesDelDia.find((s) => s.sala_id === salaId && isSessionNow(s, nowHHMM));
    const pin = hotspot.querySelector(".campus-pin");
    const existingDot = pin.querySelector(".pulse-dot");
    if (activa && !existingDot) {
      pin.insertAdjacentHTML("beforeend", '<span class="pulse-dot"></span>');
    } else if (!activa && existingDot) {
      existingDot.remove();
    }

    hotspot.onclick = () => {
      const card = document.getElementById(`sala-${salaId}`);
      if (!card) return;
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("sala-card-flash");
      setTimeout(() => card.classList.remove("sala-card-flash"), 900);
    };
  });
}

document.addEventListener("DOMContentLoaded", renderSalas);
