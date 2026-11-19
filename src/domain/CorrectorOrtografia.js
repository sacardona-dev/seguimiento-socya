import { normalizar } from '../utils/texto';
import { columnaBase } from '../utils/columnas';

/**
 * Corrige la ortografía de los datos que vienen del Excel al cargarlos, sin tocar el archivo original.
 * Criterios (norma de la RAE):
 * - Nombres propios (centrales, municipios, organizaciones, módulos y líneas de inversión):
 *   mayúscula inicial en las palabras importantes ("San Carlos", no "SAN CARLOS").
 * - Valores comunes de las listas: solo la primera letra en mayúscula ("En riesgo", no "En Riesgo").
 * - Tildes que faltan ("Sí" afirmativo, "Río", "Chucurí") y espacios dobles o sobrantes.
 * Los textos libres (resúmenes, observaciones) solo se limpian de espacios: no se cambia lo que
 * escribió cada persona.
 */
export class CorrectorOrtografia {
  // Correcciones exactas por columna: clave = texto normalizado (sin tildes, minúsculas) → texto correcto
  static #POR_COLUMNA = {
    A: {
      'calderas': 'Calderas',
      'san carlos': 'San Carlos',
    },
    B: {
      'san vicente de chucuri': 'San Vicente de Chucurí',
    },
    D: {
      'asociacion de pescadores y agricultores del pedral asoped': 'Asociación de Pescadores y Agricultores del Pedral (ASOPED)',
      'junta de accion comunal santa helena vereda cantarranas': 'Junta de Acción Comunal Santa Helena Vereda Cantarranas',
    },
    F: {
      'si': 'Sí',
      'si modulo sensibilizado': 'Sí, módulo sensibilizado',
      'modulo consolidado': 'Módulo consolidado',
      'modulo consolidado sin escuela en el mes': 'Módulo consolidado, sin Escuela en el mes',
    },
    G: {
      'formulacion y elaboracion de proyectos': 'Formulación y Elaboración de Proyectos',
    },
    I: {
      'fortalecimiento productivo': 'Fortalecimiento Productivo',
      'estimulo a la recreacion cultura y deporte': 'Estímulo a la Recreación, Cultura y Deporte',
    },
    AC: {
      'asesoria financiera': 'Asesoría financiera',
      'seguimiento funcionalidad': 'Seguimiento funcionalidad',
      'n a sin fondo rotatorio': 'N/A. Sin fondo rotatorio',
    },
    AP: {
      'seguimiento profesional social': 'Seguimiento profesional social',
    },
    AG: { 'en riesgo': 'En riesgo' },
    AH: { 'en riesgo': 'En riesgo' },
    AI: { 'en riesgo': 'En riesgo' },
    AT: { 'si': 'Sí' },
  };

  // Palabras sueltas sin tilde dentro de nombres propios
  static #PALABRAS = [
    [/\bRio\b/g, 'Río'],
  ];

  // Columnas de nombres propios donde se corrigen palabras sueltas
  static #NOMBRES_PROPIOS = ['A', 'B', 'D'];

  /** Devuelve una copia de la fila con la ortografía corregida. */
  static corregirFila(fila) {
    const corregida = { ...fila };
    for (const [col, valor] of Object.entries(fila)) {
      if (typeof valor === 'string') corregida[col] = CorrectorOrtografia.corregir(col, valor);
    }
    return corregida;
  }

  /** Corrige un valor de una columna. Si no hay nada que corregir, lo devuelve igual (solo sin espacios de más). */
  static corregir(columna, valor) {
    const col = columnaBase(columna); // "AC_2" (segunda fecha) se corrige igual que "AC"
    let texto = CorrectorOrtografia.#limpiarEspacios(valor);
    const exacta = CorrectorOrtografia.#POR_COLUMNA[col]?.[normalizar(texto)];
    if (exacta) return exacta;
    if (CorrectorOrtografia.#NOMBRES_PROPIOS.includes(col)) {
      for (const [patron, reemplazo] of CorrectorOrtografia.#PALABRAS) texto = texto.replace(patron, reemplazo);
    }
    return texto;
  }

  /** Quita espacios dobles y sobrantes, respetando los saltos de línea. */
  static #limpiarEspacios(texto) {
    return texto.split('\n').map(linea => linea.replace(/[ \t]{2,}/g, ' ').trim()).join('\n').trim();
  }
}
