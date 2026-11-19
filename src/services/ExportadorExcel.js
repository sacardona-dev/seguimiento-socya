import { ANCHO_HOJA, ETIQUETAS_EXCEL_FIJAS, GRUPOS_REPETIBLES, SECCIONES } from '../config/esquemaExcel';
import { columnaActividad, indiceColumna } from '../utils/columnas';
import { normalizar } from '../utils/texto';

// Columnas de los subgrupos que pueden tener varias fechas (van en sub-filas)
const COLUMNAS_REPETIBLES = new Set(GRUPOS_REPETIBLES.flatMap(g => g.campos.map(([c]) => c)));

/**
 * Genera un Excel con las columnas que maneja la app, en su misma posición.
 * La librería xlsx se descarga solo la primera vez que se exporta, para que la app abra rápido.
 */
export class ExportadorExcel {
  static #TIPO = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  /**
   * @param {import('../domain/Mes').Mes} mes
   * @param {import('../domain/Organizacion').Organizacion[]} organizaciones  las que se van a exportar
   * @param {string[]} alcance  dónde está la persona, para el nombre del archivo (ej. ['Jaguas', 'Alejandría'])
   */
  async descargar(mes, organizaciones, alcance = []) {
    const XLSX = await import('xlsx');
    const etiquetas = ExportadorExcel.#etiquetas();
    const columnas = Object.keys(etiquetas);

    const cabecera = ExportadorExcel.#filaVacia();
    columnas.forEach(c => { cabecera[indiceColumna(c)] = etiquetas[c]; });

    // Como en el Excel original: si una organización tiene varias fechas, su fila se parte en
    // sub-filas (una por fecha) y las demás columnas quedan combinadas a lo alto.
    const filas = [];
    const combinadas = [];
    organizaciones.forEach(org => {
      const bloque = ExportadorExcel.#bloqueOrganizacion(org, columnas);
      if (bloque.length > 1) {
        const inicio = filas.length + 1; // +1 por la cabecera
        columnas.filter(c => !COLUMNAS_REPETIBLES.has(c)).forEach(c => {
          const col = indiceColumna(c);
          combinadas.push({ s: { r: inicio, c: col }, e: { r: inicio + bloque.length - 1, c: col } });
        });
      }
      filas.push(...bloque);
    });

    const hoja = XLSX.utils.aoa_to_sheet([cabecera, ...filas]);
    hoja['!merges'] = combinadas;
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, mes.nombreHoja.slice(0, 31));
    const bytes = XLSX.write(libro, { type: 'array', bookType: 'xlsx' });
    ExportadorExcel.#bajar(new Blob([bytes], { type: ExportadorExcel.#TIPO }), ExportadorExcel.#nombreArchivo(mes, alcance));
  }

  /** Seguimiento_Octubre_2026_Jaguas_Alejandria.xlsx (sin tildes ni signos, seguro en cualquier sistema). */
  static #nombreArchivo(mes, alcance) {
    const partes = ['Seguimiento', mes.label, ...alcance]
      .map(p => normalizar(p).replace(/ /g, '_'))
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .filter(Boolean);
    return `${partes.join('_').slice(0, 120)}.xlsx`;
  }

  static #etiquetas() {
    const etiquetas = { ...ETIQUETAS_EXCEL_FIJAS };
    // "1. Talleres… · Fecha": con el subgrupo, para no tener varias columnas que digan solo "Fecha"
    SECCIONES.forEach(s => s.grupos.forEach(g => g.campos.forEach(([c, l]) => {
      etiquetas[c] = g.nombre ? `${g.nombre} · ${l}` : l;
    })));
    return etiquetas;
  }

  /**
   * Filas de una organización: la primera con todos sus datos y, si algún subgrupo tiene varias
   * fechas, una sub-fila más por cada fecha extra (solo con las columnas de ese subgrupo).
   */
  static #bloqueOrganizacion(org, columnas) {
    const porGrupo = GRUPOS_REPETIBLES.map(g => ({ g, fechas: org.actividades(g) }));
    const alto = Math.max(1, ...porGrupo.map(x => x.fechas.length));
    const bloque = Array.from({ length: alto }, () => ExportadorExcel.#filaVacia());

    columnas.filter(c => !COLUMNAS_REPETIBLES.has(c)).forEach(c => { bloque[0][indiceColumna(c)] = org.valor(c); });
    porGrupo.forEach(({ g, fechas }) => fechas.forEach((n, i) => g.campos.forEach(([c]) => {
      bloque[i][indiceColumna(c)] = org.valor(columnaActividad(c, n));
    })));
    return bloque;
  }

  static #filaVacia() {
    return Array.from({ length: ANCHO_HOJA }, () => '');
  }

  static #bajar(blob, nombre) {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
