/**
 * Mock data — mismo shape que las tablas futuras de Supabase.
 * Migrar consiste en reemplazar el cuerpo de getTracks/getSalas/getPonentes/getAgenda
 * por un `await supabase.from('tabla').select()`, sin tocar a los llamadores.
 *
 * Contenido real del "Foro Internacional 2026 RiesGIRD-ACC LAC" (2-3 sept 2026),
 * tomado del programa oficial de responsabilidades (versión 13 jul 2026).
 * Se excluyen del modelo: responsables de logística interna (registro, cafés),
 * códigos de seguimiento de cartas de invitación y notas de gestión — eso es
 * información de trabajo de los organizadores, no contenido para el asistente.
 * Los ponentes cuya participación aún no está confirmada (o que rechazaron)
 * aparecen como "Ponente pendiente" junto a la institución que los invitó.
 */

const TRACKS = [
  {
    id: "t_a",
    letra: "A",
    nombre: "Gobernanza del agua y seguridad hídrica",
    descripcion: "Modelos de gobernanza del agua y seguridad hídrica frente al riesgo de desastres y el cambio climático.",
    color_key: "track-1",
    icono: "assets/icons/agenda/track-a.png",
  },
  {
    id: "t_b",
    letra: "B",
    nombre: "Gestión del Riesgo de Desastres y Resiliencia Territorial",
    descripcion: "Enfoques integrados de gestión del riesgo orientados a la resiliencia territorial.",
    color_key: "track-2",
    icono: "assets/icons/agenda/track-b.png",
  },
  {
    id: "t_c",
    letra: "C",
    nombre: "Adaptación al Cambio Climático y Acción Climática Local",
    descripcion: "Adaptación climática y acción climática local en el ámbito subnacional.",
    color_key: "track-3",
    icono: "assets/icons/agenda/track-c.png",
  },
  {
    id: "t_d",
    letra: "D",
    nombre: "Territorios seguros y sostenibles",
    descripcion: "Ciudades sostenibles: gobernanza urbana, financiamiento e intervención territorial.",
    color_key: "track-5",
    icono: "assets/icons/agenda/track-d.png",
  },
  {
    id: "t_e",
    letra: "E",
    nombre: "Gestión de emergencias, preparación, respuesta y rehabilitación",
    descripcion: "Preparación, respuesta y rehabilitación ante emergencias y eventos extremos.",
    color_key: "track-4",
    icono: "assets/icons/agenda/track-e.png",
  },
];

const SALAS = [
  { id: "aud-principal", nombre: "Auditorio Principal", ubicacion: "Centro de Convenciones — Universidad ESAN", capacidad: null },
  { id: "por-confirmar", nombre: "Por confirmar", ubicacion: "Centro de Convenciones — Universidad ESAN", capacidad: null },
];

const PONENTES = [
  { id: "p1", nombre: "Dr. Jaime Serida Nishimura", cargo: "Rector — Presidencia de la Red RiesGIRD-ACC LAC y Perú", institucion: "Universidad ESAN", foto_url: null },
  { id: "p2", nombre: "Dr. Miguel Estrada", cargo: "Moderador", institucion: "Universidad Nacional de Ingeniería (UNI)", foto_url: null },
  { id: "p3", nombre: "Dra. Jeri Ramón Ruffner", cargo: "Rectora", institucion: "Universidad Nacional Mayor de San Marcos (UNMSM)", foto_url: "assets/ponentes/p3.png" },
  { id: "p4", nombre: "Dr. José Barrón López", cargo: "Rector", institucion: "Universidad Nacional Agraria La Molina (UNALM)", foto_url: "assets/ponentes/p4.png" },
  { id: "p5", nombre: "Dra. Mary Mollo Medina", cargo: "Secretaría Técnica de la Red RiesGIRD-ACC LAC", institucion: "Universidad ESAN", foto_url: "assets/ponentes/p5.png" },
  { id: "p6", nombre: "Dra. Mayra Arauco", cargo: "Moderadora — Track A", institucion: "Universidad ESAN", foto_url: "assets/ponentes/p6.png" },
  { id: "p7", nombre: "Edwin M. Pino", cargo: "Presentador — Track A", institucion: "Universidad Nacional Jorge Basadre Grohmann", foto_url: "assets/ponentes/p7.png" },
  { id: "p8", nombre: "Dr. David Ricardo Asencios Templo", cargo: "Presentador — Track A", institucion: "Universidad Nacional Agraria La Molina (UNALM)", foto_url: "assets/ponentes/p8.png" },
  { id: "p9", nombre: "Prof. Eden Atalaya", cargo: "Moderador — Track B", institucion: "Universidad Nacional de Ingeniería (UNI)", foto_url: "assets/ponentes/p9.png" },
  { id: "p10", nombre: "Dr. Rodrigo Alexis Cea", cargo: "Moderador — Track B", institucion: "Universidad de Concepción, Chile", foto_url: "assets/ponentes/p10.png" },
  { id: "p11", nombre: "Dra. Zully Vera de Molina", cargo: "Rectora — Moderadora, Track C", institucion: "Universidad Nacional de Asunción, Paraguay", foto_url: null },
  { id: "p12", nombre: "Sr. Eduardo Gutiérrez Gaslín", cargo: "Moderador — Track E", institucion: "Departamento de Estado de los Estados Unidos (RDAP)", foto_url: null },
  { id: "p13", nombre: "Sr. Tim Callaghan", cargo: "Presentador — Track E", institucion: "Departamento de Estado de los Estados Unidos (RDAP)", foto_url: null },
  { id: "p14", nombre: "Dr. Antonio Medina Calcaño", cargo: "Panelista", institucion: "Universidad Autónoma de Santo Domingo, Rep. Dominicana", foto_url: "assets/ponentes/p14.png" },
  { id: "p15", nombre: "José Ventura", cargo: "Moderador", institucion: "Universidad ESAN", foto_url: "assets/ponentes/p15.png" },
  { id: "p16", nombre: "Elizabeth Silvestre Espinoza", cargo: "Moderadora", institucion: "Universidad Nacional Agraria La Molina (UNALM)", foto_url: "assets/ponentes/p16.png" },
  { id: "p17", nombre: "Dr. René Cornejo Díaz", cargo: "Moderador — Track D", institucion: "Universidad ESAN", foto_url: "assets/ponentes/p17.png" },
  { id: "p18", nombre: "Dr. Luis Alberto Vargas Marín", cargo: "Panelista — Track D", institucion: "Universidad de Manizales, Colombia", foto_url: "assets/ponentes/p18.png" },
];

const SESIONES = [
  // ---------- DÍA 1 — Miércoles 2 de septiembre 2026 ----------
  {
    id: "s-d1-registro",
    dia: 1,
    hora_inicio: "08:00",
    hora_fin: "09:00",
    titulo: "Registro, acreditación y café",
    tipo: "registro",
    track_id: null,
    sala_id: "aud-principal",
    ponente_ids: [],
    instituciones_pendientes: [],
  },
  {
    id: "s-d1-inaugural",
    dia: 1,
    hora_inicio: "09:00",
    hora_fin: "09:45",
    titulo: "Sesión inaugural oficial",
    tipo: "ceremonia",
    track_id: null,
    sala_id: "aud-principal",
    ponente_ids: ["p1"],
    instituciones_pendientes: [
      "Oficina Regional UNDRR para América Latina y el Caribe",
      "Banco Interamericano de Desarrollo (BID) Perú",
      "JICA Perú",
      "GIZ Perú",
      "Presidencia de la República del Perú",
    ],
  },
  {
    id: "s-d1-magistral",
    dia: 1,
    hora_inicio: "09:45",
    hora_fin: "10:45",
    titulo: "Universidades como actores estratégicos del desarrollo sostenible: de la producción académica al valor público",
    tipo: "conferencia",
    track_id: null,
    sala_id: "aud-principal",
    ponente_ids: ["p2", "p1", "p3"],
    instituciones_pendientes: ["CAF — Banco de Desarrollo de América Latina", "Universidad Tecnológica Nacional de Chimborazo (UTNC)"],
  },
  {
    id: "s-d1-cafe1",
    dia: 1,
    hora_inicio: "10:45",
    hora_fin: "11:15",
    titulo: "Pausa — café de articulación",
    tipo: "receso",
    track_id: null,
    sala_id: null,
    ponente_ids: [],
    instituciones_pendientes: [],
  },
  {
    id: "s-d1-panel",
    dia: 1,
    hora_inicio: "11:15",
    hora_fin: "12:30",
    titulo: "Universidades, Estado y cooperación internacional frente a los riesgos de desastres y el cambio climático",
    tipo: "panel",
    track_id: null,
    sala_id: "aud-principal",
    ponente_ids: ["p4", "p5"],
    instituciones_pendientes: ["Ministerio del Ambiente del Perú (MINAM)", "Banco Interamericano de Desarrollo (BID)", "Universidad de São Paulo, Brasil"],
  },
  {
    id: "s-d1-almuerzo",
    dia: 1,
    hora_inicio: "12:30",
    hora_fin: "14:00",
    titulo: "Almuerzo libre",
    tipo: "receso",
    track_id: null,
    sala_id: null,
    ponente_ids: [],
    instituciones_pendientes: [],
  },
  {
    id: "s-d1-track-a",
    dia: 1,
    hora_inicio: "14:00",
    hora_fin: "15:30",
    titulo: "Gobernanza del agua y seguridad hídrica",
    tipo: "track",
    track_id: "t_a",
    sala_id: "por-confirmar",
    ponente_ids: ["p6", "p7", "p8"],
    instituciones_pendientes: ["Universidad Federal de Santa Catarina, Brasil", "Universidad Nacional Agraria La Molina (UNALM)"],
  },
  {
    id: "s-d1-track-b",
    dia: 1,
    hora_inicio: "14:00",
    hora_fin: "15:30",
    titulo: "Gestión del Riesgo de Desastres y Resiliencia Territorial",
    tipo: "track",
    track_id: "t_b",
    sala_id: "por-confirmar",
    ponente_ids: ["p9", "p10"],
    instituciones_pendientes: ["Banco Mundial", "Universidad de Tohoku, Japón", "JICA"],
  },
  {
    id: "s-d1-track-c",
    dia: 1,
    hora_inicio: "14:00",
    hora_fin: "15:30",
    titulo: "Adaptación al Cambio Climático y Acción Climática Local",
    tipo: "track",
    track_id: "t_c",
    sala_id: "por-confirmar",
    ponente_ids: ["p11"],
    instituciones_pendientes: [
      "Universidad Nacional de Colombia, sede Medellín",
      "Universidad San Gregorio de Portoviejo, Ecuador",
      "Universidad Pedagógica Nacional Francisco Morazán, Honduras",
    ],
  },
  {
    id: "s-d1-track-e",
    dia: 1,
    hora_inicio: "14:00",
    hora_fin: "15:30",
    titulo: "Gestión de emergencias, preparación, respuesta y rehabilitación",
    tipo: "track",
    track_id: "t_e",
    sala_id: "por-confirmar",
    ponente_ids: ["p12", "p13"],
    instituciones_pendientes: [
      "INDECI",
      "Ministerio de Salud del Perú",
      "Sedapal",
      "Especialista en Gestión del Riesgo y Crisis",
      "Universidad de Columbia, Paraguay",
      "Municipalidad de Lima",
    ],
  },
  {
    id: "s-d1-cafe2",
    dia: 1,
    hora_inicio: "15:00",
    hora_fin: "15:30",
    titulo: "Café abierto",
    tipo: "receso",
    track_id: null,
    sala_id: null,
    ponente_ids: [],
    instituciones_pendientes: [],
    horario_por_confirmar: true,
  },
  {
    id: "s-d1-dialogo",
    dia: 1,
    hora_inicio: "15:30",
    hora_fin: "17:30",
    titulo: "Diálogo multiactor: de la evidencia a la decisión pública",
    tipo: "dialogo",
    track_id: null,
    sala_id: "aud-principal",
    ponente_ids: ["p14", "p15", "p16"],
    instituciones_pendientes: [
      "Municipalidad de Chosica",
      "Cruz Roja Colombiana",
      "Universidad Nacional de Colombia",
      "GIZ Perú",
      "Ministerio de Vivienda, Construcción y Saneamiento del Perú",
      "Universidad de Concepción, Chile",
    ],
  },

  // ---------- DÍA 2 — Jueves 3 de septiembre 2026 ----------
  {
    id: "s-d2-recepcion",
    dia: 2,
    hora_inicio: "08:30",
    hora_fin: "09:00",
    titulo: "Recepción y café",
    tipo: "registro",
    track_id: null,
    sala_id: "aud-principal",
    ponente_ids: [],
    instituciones_pendientes: [],
  },
  {
    id: "s-d2-panel-financiamiento",
    dia: 2,
    hora_inicio: "09:00",
    hora_fin: "10:15",
    titulo: "Financiamiento climático, gestión del riesgo y desarrollo territorial: el rol del conocimiento",
    tipo: "panel",
    track_id: null,
    sala_id: "aud-principal",
    ponente_ids: [],
    instituciones_pendientes: [
      "Universidad Nacional de Colombia (IDEA), Manizales",
      "UNDRR",
      "Departamento de Estado de EE.UU. (RDAP)",
      "Banco Interamericano de Desarrollo (BID)",
      "Pacífico Seguros",
      "Ministerio de Economía y Finanzas del Perú (MEF)",
      "Institute for Hazard, Risk, and Resilience (IHRR)",
      "Universidad Federal de Santa Catarina, Brasil",
      "Universidad Autónoma de Santo Domingo, Rep. Dominicana",
    ],
  },
  {
    id: "s-d2-cafe",
    dia: 2,
    hora_inicio: "10:15",
    hora_fin: "10:30",
    titulo: "Pausa — café",
    tipo: "receso",
    track_id: null,
    sala_id: null,
    ponente_ids: [],
    instituciones_pendientes: [],
  },
  {
    id: "s-d2-track-d",
    dia: 2,
    hora_inicio: "10:30",
    hora_fin: "12:30",
    titulo: "Territorios seguros y sostenibles — Ciudades Sostenibles",
    tipo: "track",
    track_id: "t_d",
    sala_id: "por-confirmar",
    ponente_ids: ["p17", "p18"],
    instituciones_pendientes: [
      "Universidad Nacional de Colombia, sede Manizales",
      "Universidad Nacional Autónoma de México (UNAM)",
      "Municipalidad de Santiago de Surco",
      "Universidad de Buenos Aires (UBA), Argentina",
      "Universidad de Chile",
    ],
  },
  {
    id: "s-d2-magistral-clausura",
    dia: 2,
    hora_inicio: "12:40",
    hora_fin: "13:00",
    titulo: "Conferencia magistral de clausura",
    tipo: "conferencia",
    track_id: null,
    sala_id: "aud-principal",
    ponente_ids: [],
    instituciones_pendientes: ["Presidencia de la República del Perú"],
  },
  {
    id: "s-d2-cultural",
    dia: 2,
    hora_inicio: "13:00",
    hora_fin: "13:10",
    titulo: "Presentación cultural",
    tipo: "ceremonia",
    track_id: null,
    sala_id: "aud-principal",
    ponente_ids: [],
    instituciones_pendientes: [],
  },
  {
    id: "s-d2-declaratoria",
    dia: 2,
    hora_inicio: "13:10",
    hora_fin: "13:25",
    titulo: "Declaratoria del Foro Internacional RiesGIRD-ACC LAC 2026 — Rectores de las universidades coorganizadoras (ESAN, UNI, UNMSM, UNALM)",
    tipo: "ceremonia",
    track_id: null,
    sala_id: "aud-principal",
    ponente_ids: [],
    instituciones_pendientes: [],
  },
  {
    id: "s-d2-invitados",
    dia: 2,
    hora_inicio: "13:25",
    hora_fin: "13:45",
    titulo: "Palabras de invitados centrales",
    tipo: "ceremonia",
    track_id: null,
    sala_id: "aud-principal",
    ponente_ids: [],
    instituciones_pendientes: [],
  },
  {
    id: "s-d2-palabras-finales",
    dia: 2,
    hora_inicio: "13:45",
    hora_fin: "14:00",
    titulo: "Palabras finales de la Presidencia de la Red RiesGIRD-ACC LAC y Perú",
    tipo: "ceremonia",
    track_id: null,
    sala_id: "aud-principal",
    ponente_ids: ["p1"],
    instituciones_pendientes: [],
  },
  {
    id: "s-d2-coctel",
    dia: 2,
    hora_inicio: "14:00",
    hora_fin: "14:30",
    titulo: "Fotos protocolares y cóctel",
    tipo: "receso",
    track_id: null,
    sala_id: "aud-principal",
    ponente_ids: [],
    instituciones_pendientes: [],
  },
];

/**
 * Guía del visitante en Lima — hospedaje, transporte y emergencias.
 * Fuente: "Guía del Visitante — RiesGird/ACC" (PDF proporcionado por el organizador).
 */

const HOTELES = [
  { id: "h1", nombre: "JW Marriott Hotel Lima", cadena: "Marriott International", categoria: 5, distrito: "Miraflores", direccion: "Malecón de la Reserva 615, Miraflores", telefono: "01-217-7000", contacto: "Área de Ventas y Grupos (pedir Dpto. de Eventos)", email: "frontdesk.lima@marriott.com" },
  { id: "h2", nombre: "The Westin Lima Hotel & Convention Center", cadena: "Westin", categoria: 5, distrito: "San Isidro", direccion: "Calle Las Begonias 450, San Isidro", telefono: "01-201-5000", contacto: "Dpto. Ventas y Convenciones", email: "westin.lima.sales@westin.com" },
  { id: "h3", nombre: "Swissôtel Lima", cadena: "Accor / Swissôtel", categoria: 5, distrito: "San Isidro", direccion: "Av. Santo Toribio 173, Vía Central 150, San Isidro", telefono: "01-421-4400", contacto: "Dir. Ventas y Marketing — Ana Sofía Maldonado", email: "anasofia.maldonado@swissotel.com" },
  { id: "h4", nombre: "Hilton Lima Miraflores", cadena: "Hilton Hotels & Resorts", categoria: 5, distrito: "Miraflores", direccion: "Av. La Paz esq. Manco Cápac, Miraflores", telefono: "946 477 138", contacto: "Gerard Boulin", email: "Gerard.Boulin@hilton.com" },
  { id: "h5", nombre: "Hilton Garden Inn Lima Miraflores", cadena: "Hilton Hotels & Resorts", categoria: 4, distrito: "Miraflores", direccion: "Malecón Balta 770, Miraflores", telefono: "01-510-4000", contacto: "Ventas y Grupos", email: "sales.limagarden@hilton.com" },
  { id: "h6", nombre: "InterContinental Real Lima Miraflores", cadena: "IHG / Real Hotels", categoria: 5, distrito: "Miraflores", direccion: "Malecón de Miraflores s/n, Miraflores", telefono: "01-611-1000", contacto: "Director Comercial / Ventas", email: "sales.limaintercon@ihg.com" },
  { id: "h7", nombre: "Pullman Lima San Isidro", cadena: "Accor / Pullman", categoria: 5, distrito: "San Isidro", direccion: "Av. Jorge Basadre 595, San Isidro", telefono: "01-700-6000", contacto: "Gerencia Ventas Corporativas", email: "sales.pullmanlima@accor.com" },
  { id: "h8", nombre: "Hyatt Centric San Isidro Lima", cadena: "Hyatt Hotels Corporation", categoria: 5, distrito: "San Isidro", direccion: "Av. Jorge Basadre 367, San Isidro", telefono: "01-611-0000", contacto: "Ejecutivo Ventas y Eventos", email: "sanisidro@hyatt.com" },
  { id: "h9", nombre: "Hotel Límade", cadena: null, categoria: null, distrito: "Miraflores", direccion: "C. Bellavista 112, Miraflores 15074", telefono: "994 117 549", contacto: null, email: "recepcion@hotellimade.com" },
  { id: "h10", nombre: "Hotel El Polo", cadena: "Apart Hotel & Suites", categoria: null, distrito: "Surco", direccion: "Av. La Encalada 1515, Santiago de Surco 15023", telefono: "965 395 507", contacto: "Ana María Vicente", email: "avicente@hotelelpolo.com" },
  { id: "h11", nombre: "Hotel Innside", cadena: "Meliá Hotels International", categoria: null, distrito: "Miraflores", direccion: "Av. Ernesto Diez Canseco 344, Miraflores 15074", telefono: "954 812 415", contacto: null, email: "reservas.innside.lima@melia.com" },
  { id: "h12", nombre: "Hotel Ikonik", cadena: "Ikonik Miraflores", categoria: null, distrito: "Miraflores", direccion: "C. Atahualpa 130, Miraflores 15074", telefono: "920 074 167", contacto: null, email: "ventas@ikonikmiraflores.com" },
];

const TOURS = [
  {
    id: "tour1",
    nombre: "Net Travel",
    distrito: "Miraflores",
    telefono: "940 866 294",
    email: "jdiez@netravelperu.com",
    driveUrl: "https://drive.google.com/drive/folders/1O1V6kBIbTe1ttZJuv5-iPrB1tTww-5RH?usp=drive_link",
  },
];

const TAXIS = [
  {
    id: "uber",
    nombre: "Uber",
    recomendado: true,
    descripcion: "Pago con tarjeta de crédito, débito y efectivo. Disponible las 24 horas.",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.ubercab&hl=es&pli=1",
    appStoreUrl: "https://apps.apple.com/us/app/uber-request-aride/id368677368",
  },
  {
    id: "cabify",
    nombre: "Cabify",
    recomendado: true,
    descripcion: "Pago con tarjeta de crédito, débito y efectivo. Disponible las 24 horas.",
    playStoreUrl: "https://play.google.com/store/search?q=cabify&c=apps&hl=es",
    appStoreUrl: "https://apps.apple.com/us/app/cabify/id476087442",
  },
];

const EMERGENCIAS = [
  { id: "policia", nombre: "Policía Nacional", descripcion: "Emergencias de seguridad y asistencia policial", numero: "105" },
  { id: "samu", nombre: "SAMU", descripcion: "Atención médica de emergencias", numero: "106" },
  { id: "bomberos", nombre: "Bomberos", descripcion: "Emergencias de incendios y rescates", numero: "116" },
];

/**
 * Cachea el último dataset cargado exitosamente en localStorage. Si la red/WiFi
 * del venue falla momentáneamente, la app sigue mostrando el último dato conocido
 * en vez de romperse.
 */
async function withCache(cacheKey, fetchFn) {
  try {
    const data = await fetchFn();
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (e) {
      /* localStorage lleno o no disponible: seguimos sin cache */
    }
    return data;
  } catch (err) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    throw err;
  }
}

/**
 * Seam de migración a Supabase.
 * Hoy: retorna el mock (envuelto en cache local).
 * Mañana: reemplazar el `async () => TRACKS` por
 * `async () => { const { data } = await supabaseClient.from('tracks').select('*'); return data; }`
 * sin tocar a los llamadores.
 */
async function getTracks() {
  return withCache("riesgird_cache_tracks", async () => TRACKS);
}

async function getSalas() {
  return withCache("riesgird_cache_salas", async () => SALAS);
}

async function getPonentes() {
  return withCache("riesgird_cache_ponentes", async () => PONENTES);
}

async function getAgenda() {
  return withCache("riesgird_cache_agenda", async () => SESIONES);
}

async function getHoteles() {
  return withCache("riesgird_cache_hoteles", async () => HOTELES);
}

async function getTransporte() {
  return withCache("riesgird_cache_transporte", async () => ({ tours: TOURS, taxis: TAXIS }));
}

async function getEmergencias() {
  return withCache("riesgird_cache_emergencias", async () => EMERGENCIAS);
}
