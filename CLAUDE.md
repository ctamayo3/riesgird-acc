# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este proyecto

App móvil-first de orientación para el asistente del **Foro Internacional 2026 RiesGIRD-ACC LAC** (2–3 sept 2026, Centro de Convenciones de la Universidad ESAN, Surco, Lima). Responde solo "qué está pasando ahora, dónde, y quién habla" — **no** es un sistema de registro/inscripción ni emite certificados; eso se maneja por fuera. Sin login, acceso público total.

Repo: https://github.com/ctamayo3/riesgird-acc (rama `main`). Deploy objetivo: Vercel (deploy estático directo).

## Stack y comandos

HTML + CSS + JavaScript vanilla. **Sin build tools, sin npm, sin framework.** No hay `package.json`, ni linter, ni test runner configurados.

- **Previsualizar en local**: no hay Node/Python garantizados en todos los entornos de desarrollo de este proyecto (de hecho, en el entorno donde se hizo el rediseño de Agenda/Salas, ni Python ni ImageMagick estaban disponibles — ver nota de íconos IA más abajo). Si faltan, usar el servidor estático mínimo incluido:
  ```powershell
  powershell -File serve.ps1
  ```
  Sirve la carpeta en `http://localhost:8791`. Si Node o Python están disponibles, cualquier servidor estático (`npx serve`, `python -m http.server`) funciona igual. Si el puerto 8791 ya está tomado (típico si hay otra sesión de Claude Code con su propio servidor corriendo), no hace falta matarlo — como es un servidor de archivos estáticos sin estado, cualquier pestaña que ya apunte a `localhost:8791` sirve para verificar cambios, total sirve los mismos archivos del disco.
- **Publicar cambios**: no hay CI/CD ni pipeline de build. El flujo es `git add -A && git commit -m "..." && git push` — Vercel redespliega automáticamente desde `main` una vez conectado el repo.
- **Editar contenido del evento** (ponentes, horarios, salas, hoteles): todo vive en `js/mock-data.js`, no hay CMS ni base de datos. Ver "Capa de datos" abajo.

## Arquitectura

### Páginas (6, todas hojas planas en la raíz)
`index.html` (Inicio — hub de tarjetas), `agenda.html` (cronograma), `salas.html`, `ponentes.html`, `guia.html` (guía del visitante: hoteles/transporte/emergencias en Lima), `info.html`. El bottom tab bar (`js/nav.js`) es una píldora flotante con 5 ítems: Inicio / Agenda / Salas / Ponentes / Más (este último apunta a `info.html`; Guía no tiene ítem propio en la barra, se llega a ella desde la tarjeta en Inicio). Se muestra en todas las páginas, incluida Inicio. El logo/ícono de casa del header también vuelve a Inicio — es intencional tener ambos caminos, no un descuido.

### Capa de datos — `js/mock-data.js`
Fuente única de verdad. Exporta arrays (`TRACKS`, `SALAS`, `PONENTES`, `SESIONES`, `HOTELES`, `TOURS`, `TAXIS`, `EMERGENCIAS`) y funciones `async getX()` que los envuelven en `withCache()` (cachean en `localStorage` para resiliencia si falla el wifi del venue). Esta es la costura de migración: para conectar un backend real, solo se reemplaza el cuerpo de cada `getX()` por la consulta real, sin tocar a los llamadores. **Se decidió explícitamente no usar Supabase** — el volumen de contenido es chico y lo actualiza una sola persona técnica vía git push, así que edición directa del archivo + redeploy cumple el mismo objetivo de "contenido editable el mismo día" sin la complejidad operativa de una base de datos.

### Lógica "Ahora/Siguiente" — `js/now-next.js`
El evento no ancla a fecha calendario real dentro de la app: compara solo hora-del-día (`HH:MM` del dispositivo) contra `hora_inicio`/`hora_fin` de las sesiones del **día seleccionado manualmente** en las tabs (Día 1/Día 2), no el día calendario real del dispositivo. Puede haber varias sesiones simultáneas (tracks paralelos), por eso `findNowAndNext()` devuelve arreglos, no un solo resultado.

### `js/agenda.js`
Orquesta la pantalla de Agenda: tabs de día, bloque ahora/siguiente, timeline vertical con conector SVG topográfico. El conector se calcula **sincrónicamente** con `getBoundingClientRect()` justo después de renderizar — deliberadamente no usa `requestAnimationFrame`, porque los navegadores lo pausan en pestañas en segundo plano y el conector no aparecía.

Tipos de sesión (`tipo`): `registro`, `receso` (se renderizan como fila ligera `.timeline-break`, sin card ni favorito), `ceremonia`, `conferencia`, `panel`, `track` (usa `track_id` y color del track), `dialogo`. Los ponentes no confirmados van en `instituciones_pendientes: []` (array de nombres de institución) y se muestran inline como *"Ponente pendiente (Institución)"* — no se inventan nombres de personas no confirmadas.

Cada tarjeta de sesión (`.now-card`/`.next-card`/`.session-card`) muestra un ícono circular ilustrado a la izquierda vía `sessionIconSrc()` en `agenda.js`: para `tipo: "track"` usa el campo `icono` del track correspondiente en `TRACKS` (`js/mock-data.js`); para el resto, el mapa `TIPO_ICONS` (uno por `registro`/`ceremonia`/`conferencia`/`panel`/`dialogo`/`receso`). La sesión `s-d1-almuerzo` es un caso especial hardcodeado por `id` (no por `tipo`, que sigue siendo `receso` como los demás recesos): usa `assets/icons/agenda/almuerzo.png` también como ilustración grande sangrando en la tarjeta "Ahora" (`.now-card-illustration`) cuando está en curso.

Estado de día seleccionado se persiste en `localStorage` bajo la key `riesgird_selected_day` y lo leen también `home.js` y `salas.js` para mantenerse sincronizados entre páginas.

### Sistema de diseño — `css/styles.css` + `theme.json`
`theme.json` es la especificación original de tokens (color/tipografía/forma) — `styles.css` debe mantenerse fiel a ella para Agenda/Salas/Ponentes/Guía/Info. Reglas que no deben romperse ahí:
- `--alert-active` (naranja) es **exclusivo** del marcador "ahora" en el cronograma — nunca decorativo, nunca repetido en otro lugar.
- Texto sobre fondo de color: blanco o un tono más oscuro de la misma familia — nunca negro puro. Las variantes `--track-N-fill` (más oscuras que `--track-N`) quedaron de cuando las tarjetas de sesión eran de color sólido; ya no se usan como fondo de `.session-card` (ver abajo), pero se mantienen porque `.session-tag.on-light` sigue usándolas como fondo de la pastilla de track.
- 5 tracks temáticos reales (A–E, en `TRACKS`), cada uno mapeado a un `color_key` (`track-1`..`track-5`).
- Las tarjetas de sesión (`.session-card`, `.next-card`, `.now-card`) son **todas** blancas con franja de color (`border-left`) según `data-track` — no hay ninguna tarjeta con fondo sólido oscuro. `.now-card` (la de "ahora") se distingue de las demás con un borde de 2px en `--alert-active` (naranja) y un badge "AHORA" en pastilla naranja, no con un fondo oscuro. Esto fue una decisión explícita del cliente: al haber varios tracks paralelos, varias tarjetas "ahora" oscuras a la vez se sentían muy apretadas en celular — ver "Estado actual".

**Rediseño "vívido" en curso (solo Inicio por ahora):** a pedido del cliente, Inicio se separó de la paleta institucional de `theme.json` hacia una paleta más saturada y con ilustraciones (tokens `--vivid-*` en `:root`: azul, rojo, verde, naranja, teal, morado + sus variantes `-tint`). Esto es una decisión deliberada de este rediseño, no una inconsistencia — pero significa que **Inicio y el resto de la app hoy se ven visualmente distintos a propósito**, mientras se decide si el estilo vívido se extiende al resto de páginas. Si tocas Inicio, usa los tokens `--vivid-*`; si tocas cualquier otra página, sigue con los tokens institucionales de siempre.

Los íconos circulares de color de Inicio (Ahora/Agenda/Salas/Ponentes/Guía/Info) y las ilustraciones grandes de las tarjetas y del saludo son PNG reales en `assets/icons/` y `assets/illustrations/` (assets proporcionados por el cliente, no generados por Claude) — no son SVG inline como el resto de íconos de la app.

Los íconos de `assets/icons/agenda/` (5 tracks + registro/ceremonia/conferencia/panel/dialogo/receso/almuerzo) sí son generados por IA — ver "Flujo para íconos generados por IA" en la sección de modo de trabajo, al final de este archivo.

### `js/favorites.js`
Favoritos de sesiones — solo `localStorage`, sin backend, sin login.

### Croquis del campus — `salas.html` / `js/salas.js`
`assets/mapa-campus.png` es una ilustración plana (basada en el plano real de Universidad ESAN, **no** el mapa 3D isométrico final — ver "Estado actual") con dos zonas tocables superpuestas en `%` (`.campus-hotspot--convention` y `.campus-hotspot--edificio-a`), mapeadas a `sala.id` (`aud-principal` → Convention & Sport Center, `por-confirmar` → Edificio A, por eliminación — son los dos únicos edificios donde se dictan charlas). Cada hotspot contiene un `.campus-pin` (marcador tipo gota, morado o naranja según edificio — la forma vive en `::before` rotado 45°, dejando el `.campus-pin` sin rotar para que el `.pulse-dot` de "sesión activa" se pueda anclar a una esquina sin heredar la rotación del pin). Sobre el mapa flota una `.campus-legend` (caja con los dos pines + nombre de edificio) y una `.campus-compass` decorativa. Tocar un pin hace scroll y resalta (`.sala-card-flash`) la tarjeta correspondiente en la lista de abajo — la lógica de scroll/flash vive en `wireCampusMap()` (`js/salas.js`), que además decide si mostrar el `.pulse-dot` según si hay sesión en curso en esa sala. Si se confirman salas específicas dentro de Edificio A (hoy son varias, todas "por-confirmar"), este mapeo 1:1 por edificio dejará de alcanzar y habrá que revisar la lógica.

Las tarjetas de sala (`.sala-card`) usan un ícono circular vía el mapa `SALA_ICONS` en `salas.js` (uno por `sala.id`) — hoy son SVG inline simples (placeholder), no ilustraciones generadas por IA como las de Agenda; "Por confirmar" se queda como SVG simple a propósito (es un ícono demasiado simple para justificar el flujo de generación). Cuando no hay sesión en curso en una sala, se muestra el badge `.sala-status--free` (pastilla teal); cuando sí, `.sala-status--now` (texto con `.pulse-dot`, sin pastilla — mismo patrón que "Ahora" en Agenda antes del rediseño a claro).

## Estado actual y pendientes

*(Esta sección es la que se debe mantener actualizada en cada sesión — resume qué se hizo y qué falta, no arquitectura estable.)*

**Contenido/datos:**
- Contenido real cargado desde el programa oficial del Foro (no hay datos ficticios en `mock-data.js`).
- Pendiente de organización: salas de los 5 tracks paralelos marcadas como `"por-confirmar"` (no hay asignación real de sala todavía). El croquis de campus asume que "por-confirmar" = Edificio A (ver arriba) hasta que se sepa el aula exacta.
- Varios ponentes aparecen como pendientes de confirmación (`instituciones_pendientes`) — actualizar sus IDs reales en `PONENTES` y mover su nombre a `ponente_ids` en la sesión correspondiente cuando se confirmen.
- 14 de 18 ponentes en `PONENTES` ya tienen foto real (`foto_url` → `assets/ponentes/pN.png`); los 4 restantes (Miguel Estrada, Zully Vera de Molina, Eduardo Gutiérrez Gaslín, Tim Callaghan) siguen con avatar de iniciales porque no llegó foto de ellos.
- El bloque "Café abierto" del Día 1 (15:00–15:30) se solapa en el documento fuente con las mesas paralelas (14:00–15:30) — tiene `horario_por_confirmar: true` y muestra un badge "Horario a confirmar" hasta que se resuelva con el organizador.
- Asamblea de Rectores (Día 2, sesión cerrada) se omite intencionalmente de la agenda pública.

**Diseño visual — rediseño grande en curso, orden real: Inicio → Agenda → Salas. Ponentes/Guía/Info todavía no:**

- **Inicio** (`index.html`): rediseño completo con paleta "vívida" (ver sección de diseño arriba). Header en blanco liso (se probaron blobs de color rojo/azul, el cliente los rechazó). Tarjeta "Ahora" con degradado navy→rojo (esta sí sigue oscura — Inicio nunca tuvo el problema de "varias tarjetas ahora a la vez" que forzó a aclarar las de Agenda, porque en Inicio solo hay una tarjeta "Ahora" posible). Tarjeta Agenda celeste. Tarjetas Salas/Ponentes/Guía/Info con ícono circular ilustrado + ilustración grande al costado, sangrando hacia la esquina inferior-derecha (no encimada con el texto — eso costó dos rondas de ajuste: primero achicar/agrandar el ícono descuidó el ancho de la columna de texto y truncaba palabras como "Ponentes"/"organizadores"; la solución final fue `hyphens: auto` + `overflow-wrap: break-word` en `.home-card-title`/`.home-card-desc`, más acortar las descripciones reales del texto en vez de solo ajustar CSS — cuidado si se vuelve a tocar el layout de esas 4 tarjetas). Las 5 ilustraciones grandes (`assets/illustrations/*.png`) pesan 1.2–1.9 MB cada una a 1890×1890px — **pendiente comprimir/redimensionar** antes de un lanzamiento real (la app está pensada para funcionar con el wifi del venue).

- **Agenda** (`agenda.html`): rediseño completo a pedido explícito del cliente con captura de referencia (dos rondas — primero estructura, después el cliente mandó una captura real de celular mostrando el resultado y pidió más ajustes). Cambios estructurales:
  - Tarjetas de sesión pasaron de fondo sólido de color a blanco + franja de color (`border-left` según `data-track`) + pastilla de track + ícono circular por track/tipo + botón de flecha de navegación (decorativo, no hay página de detalle de sesión todavía).
  - **Ninguna tarjeta es oscura**, ni siquiera "Ahora" — ver arriba en Sistema de diseño. Decisión explícita del cliente tras ver que, con tracks paralelos, 5 tarjetas "ahora" oscuras seguidas se sentían muy apretadas en celular.
  - Lista de ponentes recortada a 2 líneas con `-webkit-line-clamp` en `.session-speakers` (el dato completo se sigue generando, solo se recorta visualmente) — el cliente prefirió esto sobre truncar el string a "N nombres + y M más".
  - 12 íconos nuevos en `assets/icons/agenda/` (5 tracks + registro/ceremonia/conferencia/panel/dialogo/receso/almuerzo) generados por IA — ver flujo al final de este archivo. Ninguno optimizado todavía (~100–165 KB cada uno).
  - Usa los tokens institucionales `--track-N` (no `--vivid-*`) — es un rediseño estructural (forma de la tarjeta), no una migración a la paleta vívida de Inicio.

- **Salas** (`salas.html`): rediseño con captura de referencia del cliente que mostraba un mapa 3D isométrico del campus. **El mapa sigue siendo la ilustración plana anterior** (`assets/mapa-campus.png`) — el cliente todavía no consiguió/generó el mapa 3D real, así que por ahora solo se aplicó la capa de UI encima (leyenda flotante, pines de mapa visibles morado/naranja, brújula, íconos de sala circulares, badge "Sin sesión en curso"). **Pendiente crítico**: cuando llegue el mapa 3D nuevo, hay que (a) reemplazar el `src` de la imagen y (b) reposicionar los `%` de `.campus-hotspot--convention`/`.campus-hotspot--edificio-a` porque los edificios van a estar en otro lugar de la imagen.
- **Pendiente explícito**: decidir si Ponentes/Guía/Info adoptan también el tratamiento de tarjeta clara + acento + ícono (patrón ya usado en Agenda y Salas), o si quedan con la paleta institucional plana de siempre. No asumir una respuesta — preguntar antes de replicar el estilo al resto (ya se preguntó y confirmó explícitamente para Agenda y Salas por separado; no generalizar esas respuestas a las páginas que faltan).
- Se agregaron varias animaciones de marca en Agenda/Info (conector del cronograma y bordes de tarjeta que se "dibujan" al hacer scroll, ondas de agua en el track hídrico, constelación LAC en Info, ícono de lupa animado en estados vacíos) — todas respetan `prefers-reduced-motion`.

**Infraestructura:**
- Repo ya subido a GitHub (`main`) y **Vercel ya está conectado** — cada push a `main` redespliega solo. `git push` puede fallar por corte de conexión intermitente; reintentar antes de asumir que algo está mal configurado.
- No hay tests ni linter — cualquier cambio se verifica manualmente en el navegador (ver `serve.ps1` y "Modo de trabajo" abajo).

## Modo de trabajo con Claude

*(Bitácora de cómo se trabajó en este proyecto hasta ahora — para que la próxima sesión no repita las mismas vueltas.)*

**Cuando el cliente manda una captura de pantalla como referencia**: no asumir que es una captura del estado actual de la app. Puede ser un mockup/diseño objetivo (ej. Figma, o una imagen generada aparte) que todavía no existe en el código. Buscar evidencia concreta antes de asumir: por ejemplo, una captura de Inicio con blobs de color en el header es claramente un mockup, porque el header real es blanco liso (los blobs ya se probaron y el cliente los rechazó — ver arriba). Si hay ambigüedad real, preguntar directamente si es la referencia a igualar o el estado actual a corregir, en vez de adivinar — un round-trip perdido rehaciendo algo mal interpretado sale más caro que preguntar.

**Antes de rediseños grandes** (cambiar de tarjeta de color sólido a tarjeta clara + acento, aplicar el estilo de una página a otra, etc.), preguntar el alcance concreto con `AskUserQuestion` en vez de asumir "aplicar todo lo que se ve en la referencia". Ejemplos de este proyecto: se preguntó explícitamente si las tarjetas "ahora" debían seguir siendo oscuras cuando hay varias en paralelo (Agenda), y de dónde salía el mapa 3D antes de intentar generarlo con IA (Salas — un generador de IA no va a reproducir el campus real de ESAN con precisión geográfica, así que había que confirmar si el cliente ya tenía/iba a conseguir el mapa real primero).

**Verificar cambios de layout con medición real, no solo a ojo**: antes de confiar en que un ajuste de CSS "se ve bien", medir con `getBoundingClientRect()` vía consola del navegador (ancho de columna de texto disponible, si el texto se recorta comparando `scrollWidth` vs `clientWidth`, si dos elementos se solapan) — así se detectó que la columna de texto de las tarjetas de Inicio (~59–73px según la iteración) no alcanzaba para palabras como "organizadores" (96px medido con `canvas.measureText()`), algo que no era obvio solo mirando el código. La captura de pantalla del navegador confirma el resultado visual, pero la medición numérica encuentra los bugs de recorte/solape antes de gastar una vuelta de "no, así no".

**Flujo para íconos generados por IA** (usado para los 12 íconos de `assets/icons/agenda/`, reutilizable para cualquier ícono nuevo):
1. Claude escribe un bloque de "ADN de estilo" reusable (flat vector, ícono circular sobre fondo pastel del color de acento, sin contorno, sombra suave mínima, sin texto, 1:1, fondo transparente fuera del círculo) + un prompt corto por ícono (sujeto + color de acento + color de fondo del círculo).
2. El cliente corre los prompts en su herramienta de generación (ChatGPT/DALL-E en este proyecto) — todos en la misma conversación para que la IA mantenga coherencia visual entre íconos, idealmente como una sola hoja en grilla en vez de una imagen por separado.
3. El cliente manda la hoja resultante como archivo local (ej. `C:\Users\...\Downloads\...png`).
4. Claude la recorta en piezas individuales. **En este entorno no hay Python ni ImageMagick** (`python`/`magick`/`convert` no están instalados) — se usa `System.Drawing` de PowerShell vía el tool de PowerShell. Recortar con una grilla pareja a ojo (ancho/alto de imagen ÷ columnas/filas) da resultados descentrados si el modelo no espació los íconos perfectamente parejos; el método que funcionó fue detectar los límites reales de cada ícono escaneando el canal alfa (`LockBits` + `Marshal.Copy` a un array de bytes, buscando qué filas/columnas tienen algún píxel con alfa > 15) para encontrar las bandas de columna/fila reales antes de cortar.
5. Verificar cada recorte individual con el tool `Read` (se ve como imagen) antes de integrarlo — un recorte mal centrado se nota ahí, no hace falta abrir el archivo en otro programa.

**Verificar en navegador antes de dar por terminado un cambio visual**: usar el Browser pane (`preview_start` con `{url: "http://localhost:8791/..."}` o el nombre del launch config), revisar `read_console_messages` con `onlyErrors:true`, y tomar screenshot. El tool de screenshot a veces falla con "the Browser pane is not displayed" si el usuario no tiene el panel abierto de su lado — en ese caso, seguir verificando con `read_page`/`javascript_tool`/mediciones de geometría (ver arriba) y avisar al usuario que no se pudo confirmar visualmente, en vez de asumir que quedó bien.

**Commits**: uno por cambio lógico coherente, no un commit gigante al final de la sesión — permite revertir un ajuste puntual sin perder los demás. Mensaje en español, cuerpo explicando el *por qué* del cambio (qué problema real resolvía), no solo qué archivos tocó. Solo hacer `git push` cuando el usuario lo pide explícitamente (ej. "dale push"), no automáticamente después de cada commit.
