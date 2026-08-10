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
  const etiqueta = esAhora ? "Ahora" : `Siguiente · ${destacada.hora_inicio}`;
  const metaLine = [etiqueta, sala ? sala.nombre : ""].filter(Boolean).join(" · ");

  mount.innerHTML = `
    <a class="home-ahora-teaser${esAhora ? " is-now" : ""}" href="agenda.html">
      ${esAhora ? '<span class="pulse-dot"></span>' : ""}
      <div class="home-ahora-teaser-body">
        <div class="home-ahora-teaser-title">${destacada.titulo}${extra}</div>
        <div class="home-ahora-teaser-meta">${metaLine}</div>
      </div>
      <div class="home-ahora-teaser-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    </a>
  `;
}

document.addEventListener("DOMContentLoaded", renderAhoraTeaser);
