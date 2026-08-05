/**
 * Barra inferior — ya no es un tab bar de 5 secciones (esas ya viven como
 * tarjetas en Inicio). Ahora es un único botón para volver a Inicio, con una
 * ilustración decorativa ocupando el resto del espacio.
 */

function renderTabBar() {
  const mount = document.getElementById("tab-bar-mount");
  if (!mount) return;

  const activePage = document.body.dataset.page;
  if (activePage === "inicio") {
    mount.innerHTML = "";
    return;
  }

  mount.innerHTML = `
    <nav class="tab-bar">
      <a class="tab-bar-inner" href="index.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>
        <span>Inicio</span>
      </a>
    </nav>
  `;
}

document.addEventListener("DOMContentLoaded", renderTabBar);
