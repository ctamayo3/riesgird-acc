/**
 * Bottom tab bar — fijo, 5 secciones. La tab activa se marca según
 * `document.body.dataset.page`, definido en cada HTML.
 */

const NAV_ITEMS = [
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
    page: "guia",
    href: "guia.html",
    label: "Guía",
    icon:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="16 8 14 14 8 16 10 10 16 8"/></svg>',
  },
  {
    page: "info",
    href: "info.html",
    label: "Info",
    icon:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></svg>',
  },
];

function renderTabBar() {
  const activePage = document.body.dataset.page;
  const mount = document.getElementById("tab-bar-mount");
  if (!mount) return;

  const items = NAV_ITEMS.map((item) => {
    const isActive = item.page === activePage;
    return `
      <a class="tab-item${isActive ? " active" : ""}" href="${item.href}">
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
