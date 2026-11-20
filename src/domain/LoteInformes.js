import { DESTINO_INFORME, MAX_ACTIVIDADES } from '../config/esquemaExcel';
import { excelAIso } from '../utils/fechas';

/** Error con un mensaje pensado para mostrarle a la persona. */
export class ErrorInforme extends Error {}

const COL_OBSERVACIONES = DESTINO_INFORME.observaciones[0];

/**
 * De 1 a 3 informes de visita de UNA organización en UN mes, que se suben juntos.
 * - Cada informe llena su propia fecha de la organización (informe del 20/10 → fecha 1, del 26/10 → fecha 2).
 * - Las observaciones de todos se juntan en un solo texto, ordenado por fecha, que la persona
 *   revisa y corrige antes de guardar. Se juntan, no se reescriben: no se usa IA.
 */
export class LoteInformes {
  static MAXIMO = 3;
  #informes;

  /** @param {import('./InformeVisita').InformeVisita[]} informes */
  constructor(informes) {
    if (informes.length === 0) throw new ErrorInforme('Elige al menos un informe.');
    if (informes.length > LoteInformes.MAXIMO) throw new ErrorInforme(`Puedes subir hasta ${LoteInformes.MAXIMO} informes a la vez.`);
    this.#informes = [...informes].sort((a, b) => (excelAIso(a.fecha) || '').localeCompare(excelAIso(b.fecha) || ''));
  }

  get informes() {
    return this.#informes;
  }

  /**
   * Mes y organización de los informes. Todos deben ser de los mismos; si no, dice cuál no coincide.
   * @returns {{ mes, organizacion }}
   */
  ubicar(meses) {
    const ubicaciones = this.#informes.map(informe => {
      const mes = meses.find(m => m.numero === informe.numeroMes && m.anio === informe.anio);
      if (!mes) throw new ErrorInforme(`El informe con fecha ${informe.fecha || 'vacía'} no tiene un mes cargado en la app.`);
      const organizacion = mes.buscarOrganizacion(informe);
      if (!organizacion) throw new ErrorInforme(`No encontramos “${informe.organizacion || 'sin nombre'}” en ${mes.label}. Revisa el nombre de la organización en el informe.`);
      return { mes, organizacion };
    });

    const [primera] = ubicaciones;
    const distinta = ubicaciones.find(u => u.mes !== primera.mes || u.organizacion.id !== primera.organizacion.id);
    if (distinta) {
      throw new ErrorInforme(
        'Los informes deben ser de la misma organización y del mismo mes. ' +
        `Uno es de ${primera.organizacion.nombre} (${primera.mes.label}) y otro de ${distinta.organizacion.nombre} (${distinta.mes.label}).`);
    }
    return primera;
  }

  /**
   * Qué se guarda, sin guardar nada. Si ya hay una fecha igual a la del informe, se actualiza esa;
   * si no, el informe ocupa la siguiente fecha libre de la organización.
   * @returns {{ cambios: {col, etiqueta, val, nota?}[], no: string[] }}
   */
  planearCambios(organizacion) {
    const cambios = [...this.#informes[0].cambiosDeUbicacion(organizacion)];
    const no = [];
    const usadas = organizacion.fechasUsadas();
    const libres = Array.from({ length: MAX_ACTIVIDADES }, (_, i) => i + 1).filter(n => !usadas.includes(n));
    const porFecha = new Map(); // dos informes del mismo día van a la misma fecha

    this.#informes.forEach(informe => {
      if (!informe.esAcompanamientoSocial()) {
        no.push(...informe.cambiosDeActividad(1).no);
        return;
      }
      if (porFecha.has(informe.fecha)) {
        no.push(`Hay dos informes del ${informe.fecha}: guardamos la fecha y participantes del primero (las observaciones de ambos van al resumen)`);
        return;
      }
      const n = organizacion.buscarFecha(informe.fecha) ?? libres.shift();
      porFecha.set(informe.fecha, n);
      if (!n) {
        no.push(`Informe del ${informe.fecha}: la organización ya tiene ${MAX_ACTIVIDADES} fechas en el mes`);
        return;
      }
      cambios.push(...informe.cambiosDeActividad(n).cambios);
    });

    no.push('Lugar, responsable, cargo, objetivos y situación encontrada: no tienen columna en el Excel');
    return { cambios, no };
  }

  /**
   * Resumen de observaciones para editar: lo que ya había en el campo, más lo de cada informe
   * (con su fecha y en orden). Si un informe ya se había subido, no se repite.
   */
  resumenObservaciones(organizacion) {
    const actual = String(organizacion.valor(COL_OBSERVACIONES) ?? '').trim();
    const nuevos = [...new Set(this.#informes.map(i => i.textoObservaciones()))].filter(t => t && !actual.includes(t));
    return [actual, ...nuevos].filter(Boolean).join('\n\n');
  }

  static get columnaObservaciones() {
    return DESTINO_INFORME.observaciones;
  }
}
