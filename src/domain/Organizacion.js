import { COL } from '../config/esquemaExcel';
import { estaVacio } from '../utils/texto';

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

  /** De dónde salió el valor: 'pdf', 'manual' o null si es el original del Excel. */
  origen(col) {
    return this.#cambios[col]?.src ?? null;
  }

  /** Quién y cuándo cambió una columna por última vez: { autor, fecha } o null. */
  ultimoCambio(col) {
    const c = this.#cambios[col];
    return c?.autor ? { autor: c.autor, fecha: c.fecha } : null;
  }

  /** Cuántos campos de una sección tienen dato. */
  avanceSeccion(seccion) {
    const llenos = seccion.campos.filter(([col]) => !estaVacio(this.valor(col))).length;
    return { llenos, total: seccion.campos.length };
  }
}
