import { COL, DESTINO_INFORME } from '../config/esquemaExcel';
import { columnaActividad } from '../utils/columnas';
import { claveNombre } from '../utils/texto';

/**
 * Datos leídos de un informe de visita en PDF.
 * Decide qué entra al Excel y qué no. Regla: solo entra lo que existe en el Excel.
 */
export class InformeVisita {
  // Cómo encontrar cada dato dentro del texto del PDF
  static #PATRONES = {
    lugar: /Lugar\/Medio\s+(.*?)\s+Fecha\s/,
    fecha: /Fecha\s+(\d{2}\/\d{2}\/\d{4})/,
    municipio: /Municipio\s+(.*?)\s+Organizaci[oó]n\s/,
    organizacion: /Organizaci[oó]n\s+(.*?)\s+Tipo de intervenci[oó]n/,
    tipo: /Tipo de intervenci[oó]n\s+(.*?)\s+No\. Participantes/,
    central: /Central\s+(.*?)\s+No\. de\s+asistentes/,
    asistentes: /No\. de\s+asistentes\s+(\d+)/,
    acciones: /ACCIONES REALIZADAS\s+(.*?)\s+RECOMENDACIONES Y COMPROMISOS/,
    recomendaciones: /RECOMENDACIONES Y COMPROMISOS\s+(.*?)\s+FIRMA DEL REPRESENTANTE/,
  };

  /** Crea el informe a partir del texto plano de la primera página del PDF. */
  static desdeTexto(texto) {
    const datos = {};
    for (const [campo, patron] of Object.entries(InformeVisita.#PATRONES)) {
      const m = texto.match(patron);
      datos[campo] = m ? m[1].trim() : '';
    }
    return new InformeVisita(datos);
  }

  constructor(datos) {
    Object.assign(this, datos);
  }

  /** Mes del informe (1 a 12), tomado de la fecha dd/mm/aaaa. */
  get numeroMes() {
    return this.fecha ? Number(this.fecha.substring(3, 5)) : null;
  }

  get anio() {
    return this.fecha ? Number(this.fecha.substring(6, 10)) : null;
  }

  /** Medio de la visita: lo que va después de la barra en "Lugar/Medio". */
  get medio() {
    return (this.lugar.split('/').pop() || '').trim();
  }

  esAcompanamientoSocial() {
    return claveNombre(this.tipo) === 'acompanamiento social';
  }

  /**
   * Campos de la actividad del informe, guardados en la fecha número `n` del subgrupo
   * (1 = la columna del Excel; 2, 3… = sub-filas). Sin guardar nada.
   * @returns {{ cambios: {col, etiqueta, val, nota?}[], no: string[] }}
   */
  cambiosDeActividad(n) {
    const cambios = [];
    const no = [];
    const agregar = ([col, etiqueta], val, nota) => {
      if (val) cambios.push({ col: columnaActividad(col, n), etiqueta: `${etiqueta} (${this.fecha})`, val, nota });
    };

    if (this.esAcompanamientoSocial()) {
      agregar(DESTINO_INFORME.tipoAsesoria, this.tipo, 'Acompañamiento social → sección E');
      agregar(DESTINO_INFORME.fecha, this.fecha);
      agregar(DESTINO_INFORME.participantes, this.asistentes);
      agregar(DESTINO_INFORME.medio, this.medio);
    } else if (this.tipo) {
      no.push(`Informe del ${this.fecha}: tipo de intervención "${this.tipo}" sin sección asignada, no se guarda`);
    }
    return { cambios, no };
  }

  /** Central y municipio del informe, solo si la organización no los tiene. */
  cambiosDeUbicacion(organizacion) {
    const cambios = [];
    if (!organizacion.central && this.central) cambios.push({ col: COL.CENTRAL, etiqueta: 'Central', val: this.central });
    if (!organizacion.municipio && this.municipio) cambios.push({ col: COL.MUNICIPIO, etiqueta: 'Municipio', val: this.municipio });
    return cambios;
  }

  /**
   * Observaciones del informe con su fecha al inicio, para el resumen de varios informes.
   * Acciones y recomendaciones van juntas (destino por confirmar con la organización).
   */
  textoObservaciones() {
    const partes = [];
    if (this.acciones) partes.push('Acciones: ' + this.acciones);
    if (this.recomendaciones) partes.push('Recomendaciones y compromisos: ' + this.recomendaciones);
    return partes.length ? `${this.fecha || 'Sin fecha'}\n${partes.join('\n')}` : '';
  }
}
