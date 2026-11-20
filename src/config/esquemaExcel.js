// Columnas del Excel que la app lee y escribe.
// La letra es la columna real de la hoja mensual; la etiqueta es el nombre que se muestra.
// Si el Excel cambia, este es el único archivo que hay que tocar.

// Columnas fijas con nombre, para no escribir letras sueltas en el resto del código
export const COL = {
  CENTRAL: 'A',
  MUNICIPIO: 'B',
  VIGENCIA: 'C',
  NOMBRE: 'D',
  TIPO: 'E',
};

// Grupo "Datos generales de las organizaciones comunitarias" (columnas A a E).
// Central y municipio no van aquí: se eligen al navegar.
export const DATOS = [
  ['C', 'Vigencia'],
  ['D', 'Nombre de la organización'],
  ['E', 'Tipo (J.A.C., asociación, otra)'],
];

// Columnas de fecha: se muestran con selector de fecha y se guardan como dd/mm/aaaa
export const FECHAS = ['K', 'N', 'Q', 'T', 'W', 'Z', 'AD', 'AJ', 'AM', 'AQ'];

// Columnas numéricas: solo aceptan números (participantes y duración en meses)
export const NUMEROS = ['J', 'L', 'O', 'R', 'U', 'X', 'AA', 'AE', 'AK', 'AN', 'AR'];

// Máximo de fechas (visitas) de una organización en un mes. Se pidió de 2 a 4, pero el Excel ya tiene
// una organización con 5 (junio), así que se deja en 5 para no perder ese dato.
export const MAX_ACTIVIDADES = 5;

// Cada fecha del mes tiene su PROPIA información (pedido de la usuaria: "cada una debe contener su
// información"). Solo estas columnas son de la organización y son iguales en todas las fechas:
// datos del proyecto, resultados ICO y observaciones generales. Para cambiar cuáles, solo esta lista.
export const COLUMNAS_DE_LA_ORGANIZACION = ['H', 'I', 'J', 'AG', 'AH', 'AI', 'AU'];

// Secciones en el mismo orden y con los mismos nombres que los grupos del Excel.
// Cada sección tiene subgrupos (ej. "1. Talleres…", "2. Comité técnico…") como en el encabezado del Excel.
// Campo: [columna, etiqueta, ayuda opcional]. Grupo sin nombre (null) = la sección no tiene subgrupos.
const seccion = (id, nombre, grupos) => {
  // Cada subgrupo sabe de qué sección es (las pestañas de fechas lo muestran) y tiene una clave única,
  // porque hay nombres repetidos ("2. Comité técnico…" está en B y en C).
  grupos.forEach((g, i) => Object.assign(g, { clave: `${id}-${i}`, seccion: nombre }));
  return {
    id, nombre, grupos,
    campos: grupos.flatMap(g => g.campos), // lista plana, para contar avance y exportar
  };
};
// En el Excel, si la organización tiene varias fechas, su fila se parte en sub-filas, una por fecha.
// Lo de la fecha 1 va en la columna del Excel ("Z"); lo de las fechas 2, 3… en "Z_2", "Z_3"… (utils/columnas.js).
// colFecha: la columna de fecha del subgrupo (si tiene). comun: es igual para todas las fechas.
const grupo = (nombre, campos) => ({
  nombre,
  campos,
  colFecha: campos.find(([c]) => FECHAS.includes(c))?.[0] ?? null,
  comun: campos.every(([c]) => COLUMNAS_DE_LA_ORGANIZACION.includes(c)),
});

export const SECCIONES = [
  seccion('A', 'A. Escuela de desarrollo comunitario', [
    grupo('1. Participación en Escuela', [
      ['F', '¿Se realizó Escuela en el periodo?'],
      ['G', '¿Cuál módulo?'],
    ]),
  ]),
  seccion('GP', 'Generalidades del proyecto', [
    grupo(null, [
      ['H', 'Nombre del proyecto'],
      ['I', 'Línea de inversión'],
      ['J', 'Duración del proyecto (meses)'],
    ]),
  ]),
  seccion('B', 'B. Formulación y evaluación de proyectos', [
    grupo('1. Talleres para la formulación de proyectos', [
      ['K', 'Fecha'],
      ['L', 'N.º de participantes'],
      ['M', 'Temáticas y aspectos a resaltar'],
    ]),
    grupo('2. Comité técnico de apoyo municipal', [
      ['N', 'Fecha'],
      ['O', 'N.º de participantes'],
      ['P', 'Instituciones, temáticas y acuerdos'],
    ]),
    grupo('3. Capacitación y asesoría', [
      ['Q', 'Fecha'],
      ['R', 'N.º de participantes'],
      ['S', 'Resumen de los avances en la formulación',
        'Acciones realizadas, situación encontrada, recomendaciones y aspectos relevantes. Se diligencia cada mes en todas las organizaciones que estén en formulación de proyectos.'],
    ]),
  ]),
  seccion('C', 'C. Seguimiento a la ejecución de proyectos', [
    grupo('1. Talleres de concertación y seguimiento', [
      ['T', 'Fecha'],
      ['U', 'N.º de participantes'],
      ['V', 'Temáticas y aspectos a resaltar'],
    ]),
    grupo('2. Comité técnico de apoyo municipal', [
      ['W', 'Fecha'],
      ['X', 'N.º de participantes'],
      ['Y', 'Instituciones, temáticas y acuerdos'],
    ]),
    grupo('3. Capacitación y asesoría a las organizaciones comunitarias en ejecución de proyectos', [
      ['Z', 'Fecha'],
      ['AA', 'N.º de participantes'],
      ['AB', 'Resumen de los avances en la ejecución',
        'Acciones realizadas, situación encontrada, motivos de atraso, recomendaciones y aspectos relevantes. Se diligencia cada mes en todas las organizaciones que estén en ejecución de proyectos.'],
    ]),
  ]),
  seccion('D', 'D. Acompañamiento a fondos rotatorios', [
    grupo('1. Acompañamiento y asesoría para el buen funcionamiento de los fondos rotatorios', [
      ['AC', 'Tipo de asesoría'],
      ['AD', 'Fecha'],
      ['AE', 'N.º de participantes'],
      ['AF', 'Avances y compromisos'],
    ]),
  ]),
  seccion('E', 'E. Acompañamiento y seguimiento a organizaciones comunitarias', [
    grupo('Resultados ICO (rango)', [
      ['AG', 'ICO I'],
      ['AH', 'ICO II'],
      ['AI', 'ICO III'],
    ]),
    grupo('1.1 Reuniones veredales: socialización y devolución de resultados ICO', [
      ['AJ', 'Fecha'],
      ['AK', 'N.º de participantes'],
      ['AL', 'Medio utilizado'],
    ]),
    grupo('1.2 Construcción y/o ajustes de los Planes de Fortalecimiento Comunitario', [
      ['AM', 'Fecha'],
      ['AN', 'N.º de participantes'],
      ['AO', 'Medio utilizado'],
    ]),
    grupo('2. Acompañamiento a la ejecución de los Planes de Fortalecimiento Comunitario', [
      ['AP', 'Tipo de asesoría'],
      ['AQ', 'Fecha'],
      ['AR', 'N.º de participantes'],
      ['AS', 'Medio utilizado'],
    ]),
  ]),
  seccion('F', 'F. Participación en espacios de relacionamiento con las comunidades', [
    grupo(null, [
      ['AT', '¿Participó en espacios de relacionamiento?',
        'En las áreas de influencia, en el marco de los proyectos de la gestión ambiental. Si aplica, coloca la observación.'],
    ]),
  ]),
  seccion('OBS', 'Observaciones', [
    grupo(null, [
      ['AU', 'Observaciones',
        'Aspectos generales del funcionamiento de la organización y su avance en otras actividades complementarias relacionadas con el Acompañamiento Social.'],
    ]),
  ]),
];

// Subgrupos con columna de fecha (de ahí sale el día que se ve en cada pestaña)
export const GRUPOS_CON_FECHA = SECCIONES.flatMap(s => s.grupos).filter(g => g.colFecha);

// Columnas que cada fecha guarda por separado (todas las de las secciones, menos las de la organización)
export const COLUMNAS_POR_FECHA = SECCIONES.flatMap(s => s.campos.map(([c]) => c))
  .filter(c => !COLUMNAS_DE_LA_ORGANIZACION.includes(c));

// Columnas que se copian al abrir un mes nuevo (en los datos reales se repiten de un mes a otro
// en más del 85 % de los casos): organización, módulo de escuela, proyecto y resultados ICO.
// Todo lo demás (fechas, participantes, resúmenes, observaciones) empieza en blanco.
export const COLUMNAS_QUE_SE_CONSERVAN = ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J', 'AG', 'AH', 'AI'];

// Listas desplegables (columna -> opciones)
const NIVELES_ICO = ['Experta', 'Avanzado', 'Funcional', 'Básico', 'En riesgo', 'Pendiente aplicación', 'No aplica'];
export const OPCIONES = {
  F: ['Sí', 'No', 'Módulo terminado', 'Módulo consolidado', 'Sin Escuela en el mes'],
  AG: NIVELES_ICO,
  AH: NIVELES_ICO,
  AI: NIVELES_ICO,
  AT: ['Sí', 'No', 'No aplica'],
};

// Columnas de texto largo
export const AREAS = ['M', 'P', 'S', 'V', 'Y', 'AB', 'AF', 'AU'];

// Dónde cae cada dato del informe de visita (PDF) dentro del Excel
export const DESTINO_INFORME = {
  tipoAsesoria: ['AP', 'Tipo de asesoría'],
  fecha: ['AQ', 'Fecha'],
  participantes: ['AR', 'N.º de participantes'],
  medio: ['AS', 'Medio utilizado'],
  observaciones: ['AU', 'Observaciones'],
};

// Encabezados al exportar el Excel de las columnas que no están en SECCIONES
export const ETIQUETAS_EXCEL_FIJAS = {
  A: 'Central', B: 'Municipio', C: 'Vigencia', D: 'Nombre de la organización',
  E: 'Tipo',
};
// (Las demás columnas toman su encabezado de SECCIONES.)

// Nombre legible de cada columna, con su subgrupo ("3. Capacitación… · Fecha")
const ETIQUETAS_COLUMNA = {
  ...ETIQUETAS_EXCEL_FIJAS,
  ...Object.fromEntries(SECCIONES.flatMap(s => s.grupos.flatMap(g =>
    g.campos.map(([c, l]) => [c, g.nombre ? `${g.nombre} · ${l}` : l])))),
};

/** Nombre de una columna para mostrar (ej. en el historial). "Z_2" → "… · Fecha (fecha 2)". */
export function etiquetaDeColumna(col) {
  const [base, n] = String(col).split('_');
  const etiqueta = ETIQUETAS_COLUMNA[base] ?? base;
  return n ? `${etiqueta} (fecha ${n})` : etiqueta;
}

// Cuántas columnas tiene la hoja mensual (A..AU)
export const ANCHO_HOJA = 47;

// Orden en que se muestran las centrales; las que no estén aquí van al final en orden alfabético
export const ORDEN_CENTRALES = ['Jaguas', 'Calderas', 'San Carlos', 'Miel I', 'Sogamoso', 'Pequeñas Centrales Hidroeléctricas'];
