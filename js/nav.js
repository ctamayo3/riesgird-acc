/**
 * Barra inferior — 5 accesos directos (Inicio, Agenda, Salas, Ponentes,
 * Más → Info). Guía queda accesible desde la tarjeta de Inicio.
 */

const NAV_ITEMS = [
  {
    page: "inicio",
    href: "index.html",
    label: "Inicio",
    icon:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
  },
  {
    page: "agenda",
    href: "agenda.html",
    label: "Agenda",
    icon:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>',
  },
  {
    page: "salas",
    href: "salas.html",
    label: "Salas",
    icon:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-6h6v6"/></svg>',
  },
  {
    page: "ponentes",
    href: "ponentes.html",
    label: "Ponentes",
    icon:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
  },
  {
    page: "info",
    href: "info.html",
    label: "Más",
    icon:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>',
  },
];

function renderTabBar() {
  const activePage = document.body.dataset.page;
  const mount = document.getElementById("tab-bar-mount");
  if (!mount) return;

  const items = NAV_ITEMS.map((item) => {
    const isActive = item.page === activePage;
    return `
      <a class="tab-item-vivid${isActive ? " active" : ""}" href="${item.href}">
        ${item.icon}
        <span>${item.label}</span>
      </a>
    `;
  }).join("");

  mount.innerHTML = `
    <nav class="tab-bar">
      <div class="tab-bar-inner">${items}</div>
    </nav>
  `;
}

document.addEventListener("DOMContentLoaded", renderTabBar);
