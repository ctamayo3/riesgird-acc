/**
 * Ponentes — grid de fichas. Como no hay fotos reales todavía, se usa
 * un avatar circular con iniciales, coloreado de forma estable por ponente.
 */

const AVATAR_COLORS = ["#1B3A53", "#1B8F7D", "#D69A2A", "#6B8F42", "#8C3644"];

function initialsOf(nombre) {
  const limpio = nombre.replace(/^(Ing\.\s*Agr\.|Dra\.|Dr\.|Ing\.|Mg\.)\s*/, "");
  const partes = limpio.split(" ").filter(Boolean);
  return ((partes[0] || "")[0] + (partes[1] || "")[0]).toUpperCase();
}

function colorFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}

async function renderPonentes() {
  const mount = document.getElementById("ponentes-mount");
  const [ponentes, sesiones] = await Promise.all([getPonentes(), getAgenda()]);

  mount.innerHTML = ponentes
    .map((p) => {
      const temas = sesiones
        .filter((s) => s.ponente_ids.includes(p.id))
        .map((s) => s.titulo);
      const temaHtml = temas.length
        ? `<div class="speaker-topic">${temas[0]}${temas.length > 1 ? ` +${temas.length - 1} más` : ""}</div>`
        : "";
      return `
        <div class="speaker-card">
          <div class="speaker-avatar" style="background:${colorFor(p.id)}">${initialsOf(p.nombre)}</div>
          <div class="speaker-name">${p.nombre}</div>
          <div class="speaker-role">${p.cargo}</div>
          <div class="speaker-org">${p.institucion}</div>
          ${temaHtml}
        </div>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", renderPonentes);
