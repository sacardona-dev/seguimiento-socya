import { COL, COLUMNAS_POR_FECHA, GRUPOS_CON_FECHA, MAX_ACTIVIDADES } from '../config/esquemaExcel';
import { columnaActividad } from '../utils/columnas';
import { excelAIso } from '../utils/fechas';
import { estaVacio } from '../utils/texto';

const NUMEROS_ACTIVIDAD = Array.from({ length: MAX_ACTIVIDADES }, (_, i) => i + 1); // [1, 2, 3, 4, 5]

/**
 * Una organización dentro de un mes.
 * Une la fila original del Excel con los cambios que hizo el equipo en la app.
 * Los cambios siempre ganan sobre el dato original.
 */
export class Organizacion {
  #fila;
  #cambios;

  /**
   * @param {object} fila     Fila del Excel ({ id, A, B, C, ... })
   * @param {object} cambios  Cambios guardados para esta fila ({ [col]: { v, src } })
   */
  constructor(fila, cambios = {}) {
    this.#fila = fila;
    this.#cambios = cambios;
  }

  get id() { return this.#fila.id; }
  get nombre() { return this.valor(COL.NOMBRE); }
  get central() { return this.valor(COL.CENTRAL); }
  get municipio() { return this.valor(COL.MUNICIPIO); }
  get vigencia() { return this.valor(COL.VIGENCIA); }
  get tipo() { return this.valor(COL.TIPO); }

  /** Valor vigente de una columna: el cambio guardado o, si no hay, el del Excel. */
  valor(col) {
    const cambio = this.#cambios[col];
    return cambio ? cambio.v : (this.#fila[col] ?? '');
  }

  /** Valor que traía el Excel, sin los cambios del equipo (para el historial: "antes" del primer cambio). */
  valorOriginal(col) {
    return this.#fila[col] ?? '';
  }

  /** De dónde salió el valor: 'pdf', 'manual' o null si es el original del Excel. */
  origen(col) {
    return this.#cambios[col]?.src ?? null;
  }

  /** Quién y cuándo cambió una columna por última vez: { autor, fecha } o null. */
  ultimoCambio(col) {
    const c = this.#cambios[col];
    return c?.autor ? { autor: c.autor, fecha: c.fecha } : null;
  }

  /**
   * Dónde se guarda una columna en la fecha n. Cada fecha tiene su propia información ("Z", "Z_2"…),
   * menos los datos generales y las columnas de la organización, que son uno solo para todas las fechas.
   */
  static columnaEnFecha(col, n) {
    return COLUMNAS_POR_FECHA.includes(col) ? columnaActividad(col, n) : col;
  }

  /** Días escritos en la fecha n (de cualquier actividad), sin repetir. Ej. ['20/10/2026']. */
  diasDeFecha(n) {
    return [...new Set(GRUPOS_CON_FECHA
      .map(g => String(this.valor(columnaActividad(g.colFecha, n)) ?? '').trim())
      .filter(Boolean))];
  }

  /** Actividades que tienen día escrito en la fecha n (para el texto pequeño de la pestaña). */
  actividadesDeFecha(n) {
    return GRUPOS_CON_FECHA.filter(g => !estaVacio(this.valor(columnaActividad(g.colFecha, n))));
  }

  /**
   * Fechas (1, 2, 3…) que están en uso. La 1 cuenta solo si tiene un día escrito: en el Excel muchas
   * traen "Sin actividad en el mes" sin fecha, y eso no es una visita. Las demás, con cualquier dato.
   */
  fechasUsadas() {
    return NUMEROS_ACTIVIDAD.filter(n => (n === 1
      ? this.diasDeFecha(1).length > 0
      : COLUMNAS_POR_FECHA.some(c => !estaVacio(this.valor(columnaActividad(c, n))))));
  }

  /**
   * Fechas que se muestran como pestañas, ordenadas por día: [1, 2…]. La 1 siempre está, porque
   * guarda lo que trae la fila del Excel. Las que no tienen día escrito van al final.
   */
  fechasDelMes() {
    const dia = n => this.diasDeFecha(n).map(excelAIso).filter(Boolean).sort()[0] ?? '9999';
    return [...new Set([1, ...this.fechasUsadas()])].sort((a, b) => dia(a).localeCompare(dia(b)) || a - b);
  }

  /** En qué fecha (1, 2…) está escrito ese día, o undefined si en ninguna. */
  buscarFecha(texto) {
    return this.fechasUsadas().find(n => this.diasDeFecha(n).includes(texto));
  }

  /** Cuántos campos de una sección tienen dato en la fecha n. */
  avanceSeccion(seccion, n = 1) {
    const llenos = seccion.campos.filter(([col]) => !estaVacio(this.valor(Organizacion.columnaEnFecha(col, n)))).length;
    return { llenos, total: seccion.campos.length };
  }
}
