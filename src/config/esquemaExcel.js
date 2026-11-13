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

// Secciones en el mismo orden y con los mismos nombres que los grupos del Excel.
// Cada sección tiene subgrupos (ej. "1. Talleres…", "2. Comité técnico…") como en el encabezado del Excel.
// Campo: [columna, etiqueta, ayuda opcional]. Grupo sin nombre (null) = la sección no tiene subgrupos.
const seccion = (id, nombre, grupos) => ({
  id, nombre, grupos,
  campos: grupos.flatMap(g => g.campos), // lista plana, para contar avance y exportar
});
const grupo = (nombre, campos) => ({ nombre, campos });

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
      ['L', 'No. de participantes'],
      ['M', 'Temáticas y aspectos a resaltar'],
    ]),
    grupo('2. Comité técnico de apoyo municipal', [
      ['N', 'Fecha'],
      ['O', 'No. de participantes'],
      ['P', 'Instituciones, temáticas y acuerdos'],
    ]),
    grupo('3. Capacitación y asesoría', [
      ['Q', 'Fecha'],
      ['R', 'No. de participantes'],
      ['S', 'Resumen de los avances en la formulación',
        'Acciones realizadas, situación encontrada, recomendaciones y aspectos relevantes. Se diligencia cada mes en todas las organizaciones que estén en formulación de proyectos.'],
    ]),
  ]),
  seccion('C', 'C. Seguimiento a la ejecución de proyectos', [
    grupo('1. Talleres de concertación y seguimiento', [
      ['T', 'Fecha'],
      ['U', 'No. de participantes'],
      ['V', 'Temáticas y aspectos a resaltar'],
    ]),
    grupo('2. Comité técnico de apoyo municipal', [
      ['W', 'Fecha'],
      ['X', 'No. de participantes'],
      ['Y', 'Instituciones, temáticas y acuerdos'],
    ]),
    grupo('3. Capacitación y asesoría a las organizaciones comunitarias en ejecución de proyectos', [
      ['Z', 'Fecha'],
      ['AA', 'No. de participantes'],
      ['AB', 'Resumen de los avances en la ejecución',
        'Acciones realizadas, situación encontrada, motivos de atraso, recomendaciones y aspectos relevantes. Se diligencia cada mes en todas las organizaciones que estén en ejecución de proyectos.'],
    ]),
  ]),
  seccion('D', 'D. Acompañamiento a fondos rotatorios', [
    grupo('1. Acompañamiento y asesoría para el buen funcionamiento de los fondos rotatorios', [
      ['AC', 'Tipo de asesoría'],
      ['AD', 'Fecha'],
      ['AE', 'No. de participantes'],
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
      ['AK', 'No. de participantes'],
      ['AL', 'Medio utilizado'],
    ]),
    grupo('1.2 Construcción y/o ajustes de los Planes de Fortalecimiento Comunitario', [
      ['AM', 'Fecha'],
      ['AN', 'No. de participantes'],
      ['AO', 'Medio utilizado'],
    ]),
    grupo('2. Acompañamiento a la ejecución de los Planes de Fortalecimiento Comunitario', [
      ['AP', 'Tipo de asesoría'],
      ['AQ', 'Fecha'],
      ['AR', 'No. de participantes'],
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

// Columnas que se copian al abrir un mes nuevo (en los datos reales se repiten de un mes a otro
// en más del 85 % de los casos): organización, módulo de escuela, proyecto y resultados ICO.
// Todo lo demás (fechas, participantes, resúmenes, observaciones) empieza en blanco.
export const COLUMNAS_QUE_SE_CONSERVAN = ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J', 'AG', 'AH', 'AI'];

// Listas desplegables (columna -> opciones)
const NIVELES_ICO = ['Experta', 'Avanzado', 'Funcional', 'Básico', 'No aplica'];
export const OPCIONES = {
  F: ['Si', 'No', 'Módulo terminado', 'Módulo Consolidado', 'Sin Escuela en el mes'],
  AG: NIVELES_ICO,
  AH: NIVELES_ICO,
  AI: NIVELES_ICO,
  AT: ['Si', 'No', 'No aplica'],
};

// Columnas de texto largo
export const AREAS = ['M', 'P', 'S', 'V', 'Y', 'AB', 'AF', 'AU'];

// Columnas numéricas: solo aceptan números (participantes y duración en meses)
export const NUMEROS = ['J', 'L', 'O', 'R', 'U', 'X', 'AA', 'AE', 'AK', 'AN', 'AR'];

// Columnas de fecha: se muestran con selector de fecha y se guardan como dd/mm/aaaa
export const FECHAS = ['K', 'N', 'Q', 'T', 'W', 'Z', 'AD', 'AJ', 'AM', 'AQ'];

// Dónde cae cada dato del informe de visita (PDF) dentro del Excel
export const DESTINO_INFORME = {
  tipoAsesoria: ['AP', 'Tipo de asesoría'],
  fecha: ['AQ', 'Fecha'],
  participantes: ['AR', 'No. de participantes'],
  medio: ['AS', 'Medio utilizado'],
  observaciones: ['AU', 'Observaciones'],
};

// Encabezados al exportar el Excel de las columnas que no están en SECCIONES
export const ETIQUETAS_EXCEL_FIJAS = {
  A: 'Central', B: 'Municipio', C: 'Vigencia', D: 'Nombre de la organización',
  E: 'Tipo',
};
// (Las demás columnas toman su encabezado de SECCIONES.)

// Cuántas columnas tiene la hoja mensual (A..AU)
export const ANCHO_HOJA = 47;

// Orden en que se muestran las centrales; las que no estén aquí van al final en orden alfabético
export const ORDEN_CENTRALES = ['Jaguas', 'CALDERAS', 'SAN CARLOS', 'Miel I', 'Sogamoso', 'Pequeñas Centrales Hidroeléctricas'];
