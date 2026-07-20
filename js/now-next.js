/**
 * Detección de sesión "ahora" / "siguiente".
 * Compara solo hora del día (HH:MM) del dispositivo contra las sesiones
 * del día seleccionado en las tabs — el congreso aún no tiene fecha calendario
 * confirmada, así que el "día" activo lo decide el asistente, no el reloj.
 */

function getCurrentHHMM(date) {
  const d = date || new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Puede haber varias sesiones simultáneas (hasta 4 tracks a la vez), por eso
 * "now" y "next" son arreglos: todas las sesiones activas / todas las que
 * arrancan juntas en el próximo horario.
 *
 * @param {Array} sesionesDelDia - sesiones ya filtradas por día, sin ordenar necesariamente
 * @param {string} nowHHMM - hora actual en formato "HH:MM"
 * @returns {{ now: object[], next: object[] }}
 */
function findNowAndNext(sesionesDelDia, nowHHMM) {
  const nowMin = timeToMinutes(nowHHMM);
  const ordenadas = [...sesionesDelDia].sort(
    (a, b) => timeToMinutes(a.hora_inicio) - timeToMinutes(b.hora_inicio)
  );

  const now = ordenadas.filter((s) => {
    const inicio = timeToMinutes(s.hora_inicio);
    const fin = timeToMinutes(s.hora_fin);
    return nowMin >= inicio && nowMin < fin;
  });

  const proximoInicio = ordenadas
    .map((s) => timeToMinutes(s.hora_inicio))
    .find((inicio) => inicio > nowMin);

  const next =
    proximoInicio === undefined
      ? []
      : ordenadas.filter((s) => timeToMinutes(s.hora_inicio) === proximoInicio);

  return { now, next };
}

function isSessionNow(sesion, nowHHMM) {
  const nowMin = timeToMinutes(nowHHMM);
  const inicio = timeToMinutes(sesion.hora_inicio);
  const fin = timeToMinutes(sesion.hora_fin);
  return nowMin >= inicio && nowMin < fin;
}
