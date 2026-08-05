/**
 * Inicio — hub de tarjetas. Solo necesita datos para la mini franja "ahora",
 * el resto de la pantalla es navegación estática hacia las demás secciones.
 */

async function renderAhoraTeaser() {
  const mount = document.getElementById("home-ahora-mount");
  const storedDay = Number(localStorage.getItem("riesgird_selected_day"));
  const selectedDay = [1, 2].includes(storedDay) ? storedDay : 1;

  const [tracks, salas, sesiones] = await Promise.all([getTracks(), getSalas(), getAgenda()]);
  const tracksById = {};
  tracks.forEach((t) => (tracksById[t.id] = t));
  const salasById = {};
  salas.forEach((s) => (salasById[s.id] = s));

  const sesionesDelDia = sesiones.filter((s) => s.dia === selectedDay);
  const nowHHMM = getCurrentHHMM();
  const { now, next } = findNowAndNext(sesionesDelDia, nowHHMM);

  if (now.length === 0 && next.length === 0) {
    mount.innerHTML = "";
    return;
  }

  const destacada = now[0] || next[0];
  const esAhora = now.length > 0;
  const extra = esAhora && now.length > 1 ? ` +${now.length - 1} en simultáneo` : "";
  const sala = salasById[destacada.sala_id];
  const etiqueta = esAhora
    ? `Ahora · Día ${selectedDay}`
    : `Siguiente · ${destacada.hora_inicio} · Día ${selectedDay}`;

  mount.innerHTML = `
    <a class="home-ahora-teaser${esAhora ? " is-now" : ""}" href="agenda.html">
      ${esAhora ? '<span class="pulse-dot"></span>' : ""}
      <div class="home-ahora-teaser-body">
        <div class="home-ahora-teaser-meta">${etiqueta}</div>
        <div class="home-ahora-teaser-title">${destacada.titulo}${extra}</div>
        <div class="home-ahora-teaser-meta">${sala ? sala.nombre : ""}</div>
      </div>
      <div class="home-ahora-teaser-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    </a>
  `;
}

function renderCountdown() {
  const mount = document.getElementById("home-countdown-mount");
  if (!mount) return;

  const startDay = new Date(2026, 8, 2);
  const endDay = new Date(2026, 8, 3);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (today > endDay) {
    mount.innerHTML = "";
    return;
  }

  if (today.getTime() === startDay.getTime()) {
    mount.innerHTML = `<div class="home-countdown home-countdown--live"><span class="home-countdown-label">¡Hoy comienza el Foro! · Día 1</span></div>`;
    return;
  }

  if (today.getTime() === endDay.getTime()) {
    mount.innerHTML = `<div class="home-countdown home-countdown--live"><span class="home-countdown-label">El Foro continúa hoy · Día 2</span></div>`;
    return;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((startDay - today) / msPerDay);
  const label = diffDays === 1 ? "día para el Foro" : "días para el Foro";

  mount.innerHTML = `
    <div class="home-countdown">
      <span class="home-countdown-num">${diffDays}</span>
      <span class="home-countdown-label">${label}</span>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", renderAhoraTeaser);
document.addEventListener("DOMContentLoaded", renderCountdown);
