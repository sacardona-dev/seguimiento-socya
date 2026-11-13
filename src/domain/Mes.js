import { COLUMNAS_QUE_SE_CONSERVAN, ORDEN_CENTRALES } from '../config/esquemaExcel';
import { excelAIso, NOMBRES_MES } from '../utils/fechas';
import { claveNombre, normalizar } from '../utils/texto';
import { Organizacion } from './Organizacion';

/**
 * Una hoja mensual del Excel con todas sus organizaciones.
 * Sabe agruparlas por central y municipio, buscar una organización y preparar el mes siguiente.
 */
export class Mes {
  /**
   * @param {object} datos  { clave, anio, numero, label, nombreHoja, rows }
   *   clave: identificador con el que se guardan los cambios ('10' en los meses del Excel original,
   *          '2026-11' en los meses abiertos desde la app, para no chocar entre años).
   * @param {object} cambiosDelMes  Cambios guardados del mes ({ [rowId]: { [col]: { v, src } } })
   */
  constructor(datos, cambiosDelMes = {}) {
    this.clave = datos.clave;
    this.anio = datos.anio;
    this.numero = datos.numero;
    this.label = datos.label;
    this.nombreHoja = datos.nombreHoja;
    this.organizaciones = datos.rows.map(fila => new Organizacion(fila, cambiosDelMes[fila.id]));
  }

  /** Convierte una hoja de meses.json ({ mm, label, nombre, rows }) al formato de Mes. */
  static desdeHojaExcel(hoja) {
    return {
      clave: hoja.mm,
      anio: Number(hoja.label.match(/\d{4}/)[0]),
      numero: Number(hoja.mm),
      label: hoja.label,
      nombreHoja: hoja.nombre,
      rows: hoja.rows,
    };
  }

  /** Número para ordenar meses en el tiempo (2026-11 → 24323). */
  get orden() {
    return this.anio * 12 + this.numero;
  }

  /** ¿Una fecha dd/mm/aaaa cae en este mes? null si no es una fecha válida. */
  contieneFecha(fechaExcel) {
    const iso = excelAIso(fechaExcel);
    if (!iso) return null;
    const [a, m] = iso.split('-').map(Number);
    return a === this.anio && m === this.numero;
  }

  /**
   * Prepara el mes siguiente: mismas organizaciones, copiando solo los datos que se repiten
   * cada mes (organización, proyecto, módulo, ICO). Las actividades quedan en blanco.
   */
  datosMesSiguiente() {
    const numero = this.numero === 12 ? 1 : this.numero + 1;
    const anio = this.numero === 12 ? this.anio + 1 : this.anio;
    const nombre = NOMBRES_MES[numero - 1];
    const consecutivo = Number(this.nombreHoja.match(/Mes#(\d+)/)?.[1] ?? 0) + 1;

    return {
      clave: `${anio}-${String(numero).padStart(2, '0')}`,
      anio,
      numero,
      label: `${nombre} ${anio}`,
      nombreHoja: `Mes#${consecutivo}_${nombre}_${anio}`,
      rows: this.organizaciones.map(o => {
        const fila = { id: o.id };
        COLUMNAS_QUE_SE_CONSERVAN.forEach(col => {
          const valor = o.valor(col);
          if (valor !== '') fila[col] = valor;
        });
        return fila;
      }),
    };
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

  /** Organizaciones cuyo nombre contiene el texto (sin importar tildes ni mayúsculas). */
  buscarPorTexto(texto, limite = 8) {
    const buscado = normalizar(texto);
    if (buscado.length < 2) return [];
    return this.organizaciones.filter(o => normalizar(o.nombre).includes(buscado)).slice(0, limite);
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
