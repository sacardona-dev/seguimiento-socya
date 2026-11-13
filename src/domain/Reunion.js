import { normalizar } from '../utils/texto';
import { excelAIso, isoAExcel } from '../utils/fechas';

/**
 * Una reunión de equipo de promotores.
 * Puede venir del Excel original (fecha escrita a mano, ej. "26 - 27/02/2026")
 * o registrarse desde la app (fecha elegida en el calendario).
 */
export class Reunion {
  /**
   * @param {object} datos  { id, central, lugar, fecha, asistentes, isagen, objetivo, desdeApp, creadoPor }
   *   fecha: texto dd/mm/aaaa (o como venga del Excel); isagen: 'Sí' | 'No' | texto del Excel
   */
  constructor(datos) {
    this.id = datos.id;
    this.central = datos.central ?? '';
    this.lugar = datos.lugar ?? '';
    this.fecha = datos.fecha ?? '';
    this.asistentes = datos.asistentes ?? '';
    this.isagen = datos.isagen ?? '';
    this.objetivo = datos.objetivo ?? '';
    this.desdeApp = Boolean(datos.desdeApp);
    this.creadoPor = datos.creadoPor ?? null;
  }

  /** Reunión de la hoja del Excel (ya con la ortografía corregida). */
  static desdeExcel(r) {
    return new Reunion({
      id: `excel-${r.id}`, central: r.central, lugar: r.municipio, fecha: r.fecha,
      asistentes: r.asistentes, isagen: r.isagen, objetivo: r.objetivo,
    });
  }

  /** Reunión guardada desde la app (tabla `reuniones`; la fecha llega como aaaa-mm-dd). */
  static desdeTabla(fila) {
    return new Reunion({
      id: fila.id, central: fila.central, lugar: fila.lugar, fecha: isoAExcel(fila.fecha),
      asistentes: String(fila.asistentes ?? ''), isagen: fila.isagen ? 'Sí' : 'No',
      objetivo: fila.objetivo, desdeApp: true, creadoPor: fila.creado_por ?? null,
    });
  }

  /**
   * Mes, año y primer día, tomados de la fecha. En el Excel las fechas vienen escritas de muchas
   * formas ("21, 22, 23 /04/2026", "16 -18/07/2026"); el mes y el año siempre van al final.
   */
  get #partesFecha() {
    const final = this.fecha.match(/(\d{1,2})\s*\/\s*(\d{4})\s*$/);
    const primerDia = this.fecha.match(/^\s*(\d{1,2})/);
    return final
      ? { numeroMes: Number(final[1]), anio: Number(final[2]), dia: Number(primerDia?.[1] ?? 1) }
      : { numeroMes: null, anio: null, dia: null };
  }

  get numeroMes() { return this.#partesFecha.numeroMes; }
  get anio() { return this.#partesFecha.anio; }

  /** Para ordenar de la más reciente a la más antigua. */
  get orden() {
    const { anio, numeroMes, dia } = this.#partesFecha;
    return anio ? anio * 10000 + numeroMes * 100 + dia : 0;
  }

  get conIsagen() {
    return normalizar(this.isagen) === 'si';
  }

  /**
   * Solo se editan o borran las reuniones registradas en la app, y solo por quien las registró.
   * @param {string|null} usuarioId  id del usuario con sesión; null en modo local (ahí todo es de quien usa el navegador)
   */
  puedeEditar(usuarioId) {
    if (!this.desdeApp) return false;
    return usuarioId === null || this.creadoPor === usuarioId;
  }

  /** Datos para llenar el formulario al editar. */
  aFormulario() {
    return {
      central: this.central, lugar: this.lugar, fecha: excelAIso(this.fecha),
      asistentes: String(this.asistentes), isagen: this.conIsagen ? 'si' : 'no', objetivo: this.objetivo,
    };
  }

  esDelMes(mes) {
    return this.anio === mes.anio && this.numeroMes === mes.numero;
  }

  /**
   * Revisa los datos del formulario antes de guardar.
   * @returns {object} { campo: mensaje } con los errores; vacío si todo está bien
   */
  static validar({ central, lugar, fecha, asistentes, objetivo }) {
    const errores = {};
    if (!central?.trim()) errores.central = 'Escribe o elige la central.';
    if (!lugar?.trim()) errores.lugar = 'Escribe dónde fue (municipio o "Videoconferencia").';
    if (!fecha) errores.fecha = 'Elige la fecha de la reunión.';
    if (!(Number(asistentes) > 0)) errores.asistentes = 'Escribe cuántas personas asistieron (mínimo 1).';
    if (!objetivo?.trim()) errores.objetivo = 'Escribe el objetivo de la reunión.';
    return errores;
  }
}
