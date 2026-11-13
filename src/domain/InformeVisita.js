import { COL, DESTINO_INFORME } from '../config/esquemaExcel';
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
   * Arma la lista de cambios para una organización, sin guardar nada.
   * @returns {{ cambios: {col, etiqueta, val, nota?}[], no: string[] }}
   */
  planearCambios(organizacion) {
    const cambios = [];
    const no = [];
    const agregar = ([col, etiqueta], val, nota) => { if (val) cambios.push({ col, etiqueta, val, nota }); };

    // Central y municipio solo se completan si estaban vacíos
    if (!organizacion.central) agregar([COL.CENTRAL, 'Central'], this.central);
    if (!organizacion.municipio) agregar([COL.MUNICIPIO, 'Municipio'], this.municipio);

    if (this.esAcompanamientoSocial()) {
      agregar(DESTINO_INFORME.tipoAsesoria, this.tipo, 'Acompañamiento social → sección E');
      agregar(DESTINO_INFORME.fecha, this.fecha);
      agregar(DESTINO_INFORME.participantes, this.asistentes);
      agregar(DESTINO_INFORME.medio, this.medio);
    } else if (this.tipo) {
      no.push(`Tipo de intervención "${this.tipo}": sin sección asignada, no se guarda`);
    }

    const observaciones = [];
    if (this.acciones) observaciones.push('Acciones: ' + this.acciones);
    if (this.recomendaciones) observaciones.push('Recomendaciones y compromisos: ' + this.recomendaciones);
    if (observaciones.length) {
      agregar(DESTINO_INFORME.observaciones, observaciones.join('\n'), 'Acciones y recomendaciones juntas: confirmar destino');
    }

    no.push('Lugar, responsable, cargo, objetivos y situación encontrada: no tienen columna en el Excel');
    return { cambios, no };
  }
}
