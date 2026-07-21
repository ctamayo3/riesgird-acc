# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este proyecto

App móvil-first de orientación para el asistente del **Foro Internacional 2026 RiesGIRD-ACC LAC** (2–3 sept 2026, Centro de Convenciones de la Universidad ESAN, Surco, Lima). Responde solo "qué está pasando ahora, dónde, y quién habla" — **no** es un sistema de registro/inscripción ni emite certificados; eso se maneja por fuera. Sin login, acceso público total.

Repo: https://github.com/ctamayo3/riesgird-acc (rama `main`). Deploy objetivo: Vercel (deploy estático directo).

## Stack y comandos

HTML + CSS + JavaScript vanilla. **Sin build tools, sin npm, sin framework.** No hay `package.json`, ni linter, ni test runner configurados.

- **Previsualizar en local**: no hay Node/Python garantizados en todos los entornos de desarrollo de este proyecto. Si faltan, usar el servidor estático mínimo incluido:
  ```powershell
  powershell -File serve.ps1
  ```
  Sirve la carpeta en `http://localhost:8791`. Si Node o Python están disponibles, cualquier servidor estático (`npx serve`, `python -m http.server`) funciona igual.
- **Publicar cambios**: no hay CI/CD ni pipeline de build. El flujo es `git add -A && git commit -m "..." && git push` — Vercel redespliega automáticamente desde `main` una vez conectado el repo.
- **Editar contenido del evento** (ponentes, horarios, salas, hoteles): todo vive en `js/mock-data.js`, no hay CMS ni base de datos. Ver "Modelo de datos" abajo.

## Arquitectura

### Páginas (6, todas hojas planas en la raíz)
`index.html` (Inicio — hub de tarjetas, **no** está en el tab bar), `agenda.html` (cronograma), `salas.html`, `ponentes.html`, `guia.html` (guía del visitante: hoteles/transporte/emergencias en Lima), `info.html`. El bottom tab bar es fijo con 5 ítems: Agenda / Salas / Ponentes / Guía / Info. Para volver a Inicio desde cualquier página se toca el logo/ícono de regreso del header — es una decisión deliberada, no un descuido de navegación.

### Capa de datos — `js/mock-data.js`
Fuente única de verdad. Exporta arrays (`TRACKS`, `SALAS`, `PONENTES`, `SESIONES`, `HOTELES`, `TOURS`, `TAXIS`, `EMERGENCIAS`) y funciones `async getX()` que los envuelven en `withCache()` (cachean en `localStorage` para resiliencia si falla el wifi del venue). Esta es la costura de migración: para conectar un backend real, solo se reemplaza el cuerpo de cada `getX()` por la consulta real, sin tocar a los llamadores. **Se decidió explícitamente no usar Supabase** — el volumen de contenido es chico y lo actualiza una sola persona técnica vía git push, así que edición directa del archivo + redeploy cumple el mismo objetivo de "contenido editable el mismo día" sin la complejidad operativa de una base de datos.

### Lógica "Ahora/Siguiente" — `js/now-next.js`
El evento no ancla a fecha calendario real dentro de la app: compara solo hora-del-día (`HH:MM` del dispositivo) contra `hora_inicio`/`hora_fin` de las sesiones del **día seleccionado manualmente** en las tabs (Día 1/Día 2), no el día calendario real del dispositivo. Puede haber varias sesiones simultáneas (tracks paralelos), por eso `findNowAndNext()` devuelve arreglos, no un solo resultado.

### `js/agenda.js`
Orquesta la pantalla de Agenda: tabs de día, bloque ahora/siguiente, timeline vertical con conector SVG topográfico. El conector se calcula **sincrónicamente** con `getBoundingClientRect()` justo después de renderizar — deliberadamente no usa `requestAnimationFrame`, porque los navegadores lo pausan en pestañas en segundo plano y el conector no aparecía.

Tipos de sesión (`tipo`): `registro`, `receso` (se renderizan como fila ligera `.timeline-break`, sin card ni favorito), `ceremonia`, `conferencia`, `panel`, `track` (usa `track_id` y color del track), `dialogo`. Los ponentes no confirmados van en `instituciones_pendientes: []` (array de nombres de institución) y se muestran inline como *"Ponente pendiente (Institución)"* — no se inventan nombres de personas no confirmadas.

Estado de día seleccionado se persiste en `localStorage` bajo la key `riesgird_selected_day` y lo leen también `home.js` y `salas.js` para mantenerse sincronizados entre páginas.

### Sistema de diseño — `css/styles.css` + `theme.json`
`theme.json` es la especificación original de tokens (color/tipografía/forma) — `styles.css` debe mantenerse fiel a ella. Reglas que no deben romperse:
- `--alert-active` (naranja) es **exclusivo** del marcador "ahora" en el cronograma — nunca decorativo, nunca repetido en otro lugar.
- Texto sobre fondo de color: blanco o un tono más oscuro de la misma familia — nunca negro puro. Por eso existen variantes `--track-N-fill` (más oscuras que `--track-N`) para garantizar contraste AA con texto blanco en las tarjetas de sesión de color sólido.
- 5 tracks temáticos reales (A–E, en `TRACKS`), cada uno mapeado a un `color_key` (`track-1`..`track-5`).

### `js/favorites.js`
Favoritos de sesiones — solo `localStorage`, sin backend, sin login.

## Estado actual y pendientes

*(Esta sección es la que se debe mantener actualizada en cada sesión — resume qué se hizo y qué falta, no arquitectura estable.)*

- Contenido real cargado desde el programa oficial del Foro (no hay datos ficticios en `mock-data.js`).
- Pendiente de organización: salas de los 5 tracks paralelos marcadas como `"por-confirmar"` (no hay asignación real de sala todavía).
- Varios ponentes aparecen como pendientes de confirmación (`instituciones_pendientes`) — actualizar sus IDs reales en `PONENTES` y mover su nombre a `ponente_ids` en la sesión correspondiente cuando se confirmen.
- El bloque "Café abierto" del Día 1 (15:00–15:30) se solapa en el documento fuente con las mesas paralelas (14:00–15:30) — tiene `horario_por_confirmar: true` y muestra un badge "Horario a confirmar" hasta que se resuelva con el organizador.
- Asamblea de Rectores (Día 2, sesión cerrada) se omite intencionalmente de la agenda pública.
- Repo ya subido a GitHub (`main`). **Pendiente**: conectar el repo a Vercel para el deploy en vivo (no se ha hecho todavía).
- No hay tests ni linter — cualquier cambio se verifica manualmente en el navegador (ver `serve.ps1`).
