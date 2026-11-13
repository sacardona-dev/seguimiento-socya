// El Excel guarda fechas como dd/mm/aaaa; el selector de fecha del navegador usa aaaa-mm-dd.
// Estas funciones convierten entre los dos formatos.

export const NOMBRES_MES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/** '27/04/2026' -> '2026-04-27'. Devuelve '' si el texto no es una fecha real. */
export function excelAIso(texto) {
  const m = String(texto ?? '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return '';
  const [, d, mes, a] = m.map(Number);
  const fecha = new Date(a, mes - 1, d);
  const existe = a >= 1900 && fecha.getFullYear() === a && fecha.getMonth() === mes - 1 && fecha.getDate() === d;
  return existe ? `${a}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}` : '';
}

/** '2026-04-27' -> '27/04/2026'. Vacío si viene vacío. */
export function isoAExcel(iso) {
  if (!iso) return '';
  const [a, mes, d] = iso.split('-');
  return `${d}/${mes}/${a}`;
}
