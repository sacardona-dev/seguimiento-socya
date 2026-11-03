import { ORDEN_CENTRALES } from '../config/esquemaExcel';
import { claveNombre } from '../utils/texto';
import { Organizacion } from './Organizacion';

/**
 * Una hoja mensual del Excel con todas sus organizaciones.
 * Sabe agruparlas por central y municipio, y buscar una organización.
 */
export class Mes {
  /**
   * @param {object} datos          Hoja del mes ({ mm, label, nombre, rows })
   * @param {object} cambiosDelMes  Cambios guardados del mes ({ [rowId]: { [col]: { v, src } } })
   */
  constructor(datos, cambiosDelMes = {}) {
    this.mm = datos.mm;
    this.label = datos.label;
    this.nombreHoja = datos.nombre;
    this.organizaciones = datos.rows.map(fila => new Organizacion(fila, cambiosDelMes[fila.id]));
  }

  /** Centrales con su total de organizaciones. */
  centrales() {
    return Mes.#agrupar(this.organizaciones, o => o.central)
      .sort((a, b) => (Mes.#rangoCentral(a.nombre) - Mes.#rangoCentral(b.nombre)) || a.nombre.localeCompare(b.nombre));
  }

  municipios(central) {
    return Mes.#agrupar(this.organizacionesDeCentral(central), o => o.municipio)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  organizacionesDeCentral(central) {
    return this.organizaciones.filter(o => o.central === central);
  }

  organizacionesDe(central, municipio) {
    return this.organizaciones.filter(o => o.central === central && o.municipio === municipio);
  }

  buscarPorId(id) {
    return this.organizaciones.find(o => o.id === id) ?? null;
  }

  /**
   * Busca la organización que nombra un informe de visita.
   * Compara nombres sin palabras genéricas ("JAC", "vereda"...). Si hay varias
   * coincidencias, prefiere la de la misma central y municipio.
   */
  buscarOrganizacion(informe) {
    const buscada = claveNombre(informe.organizacion);
    if (!buscada) return null;

    const candidatas = this.organizaciones.filter(o => {
      const nombre = claveNombre(o.nombre);
      return nombre && (nombre === buscada || nombre.includes(buscada) || buscada.includes(nombre));
    });
    if (candidatas.length <= 1) return candidatas[0] ?? null;

    const mismaZona = candidatas.find(o =>
      claveNombre(o.central) === claveNombre(informe.central) &&
      claveNombre(o.municipio) === claveNombre(informe.municipio));
    return mismaZona ?? candidatas[0];
  }

  /** Agrupa las organizaciones y cuenta cuántas hay en cada grupo. */
  static #agrupar(organizaciones, criterio) {
    const grupos = new Map();
    organizaciones.forEach(o => {
      const nombre = criterio(o);
      const g = grupos.get(nombre) ?? { nombre, total: 0 };
      g.total += 1;
      grupos.set(nombre, g);
    });
    return [...grupos.values()];
  }

  static #rangoCentral(nombre) {
    const i = ORDEN_CENTRALES.indexOf(nombre);
    return i < 0 ? ORDEN_CENTRALES.length : i;
  }
}
