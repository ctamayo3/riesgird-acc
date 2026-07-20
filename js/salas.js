/**
 * Salas — listado con la sesión en curso en cada una (si existe),
 * para ayudar al asistente a ubicarse dentro del venue.
 */

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
      const digitos = sala.nombre.match(/\d+/);
      const codigo = sala.id === "por-confirmar" ? "?" : digitos ? digitos[0] : sala.nombre.slice(0, 3).toUpperCase();
      return `
        <div class="sala-card${activa ? " is-now" : ""}">
          <div class="sala-icon mono">${codigo}</div>
          <div style="flex:1; min-width:0;">
            <div class="sala-name">${sala.nombre}</div>
            <div class="sala-meta">${sala.ubicacion}${sala.capacidad ? ` · Aforo ${sala.capacidad}` : ""}</div>
            ${
              activa
                ? `<div class="sala-meta" style="font-weight:600; margin-top:4px;"><span class="pulse-dot" style="display:inline-block; margin-right:5px; vertical-align:middle;"></span>Ahora: ${activa.titulo}</div>`
                : `<div class="sala-meta" style="margin-top:4px;">Sin sesión en curso (Día ${selectedDay})</div>`
            }
          </div>
        </div>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", renderSalas);
