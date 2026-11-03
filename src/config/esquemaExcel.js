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

// Secciones en el mismo orden y con los mismos nombres que los grupos del Excel
export const SECCIONES = [
  { id: 'A', nombre: 'A. Escuela de desarrollo comunitario', campos: [
    ['F', '¿Se realizó Escuela en el periodo?'], ['G', '¿Cuál módulo?'],
  ]},
  { id: 'GP', nombre: 'Generalidades del proyecto', campos: [
    ['H', 'Nombre del proyecto'], ['I', 'Línea de inversión'], ['J', 'Duración del proyecto (meses)'],
  ]},
  { id: 'B', nombre: 'B. Formulación y evaluación de proyectos', campos: [
    ['K', 'Fecha taller'], ['L', 'Participantes taller'], ['M', 'Temáticas taller'],
    ['N', 'Fecha comité técnico'], ['O', 'No participantes comité'], ['P', 'Instituciones y acuerdos comité'],
    ['Q', 'Fecha capacitación'], ['R', 'Participantes capacitación'], ['S', 'Resumen avances formulación'],
  ]},
  { id: 'C', nombre: 'C. Seguimiento a la ejecución de proyectos', campos: [
    ['T', 'Fecha taller'], ['U', 'Participantes taller'], ['V', 'Temáticas taller'],
    ['W', 'Fecha comité técnico'], ['X', 'No participantes comité'], ['Y', 'Instituciones y acuerdos comité'],
    ['Z', 'Fecha capacitación'], ['AA', 'Participantes capacitación'], ['AB', 'Resumen avances ejecución'],
  ]},
  { id: 'D', nombre: 'D. Acompañamiento a fondos rotatorios', campos: [
    ['AC', 'Tipo de asesoría'], ['AD', 'Fecha'], ['AE', 'No de participantes'], ['AF', 'Avances y compromisos'],
  ]},
  { id: 'E', nombre: 'E. Acompañamiento y seguimiento a organizaciones comunitarias', campos: [
    ['AG', 'Resultado ICO I'], ['AH', 'Resultado ICO II'], ['AI', 'Resultado ICO III'],
    ['AJ', 'Socialización: fecha'], ['AK', 'Socialización: participantes'], ['AL', 'Socialización: medio'],
    ['AM', 'Planes de fortalecimiento: fecha'], ['AN', 'Planes de fortalecimiento: participantes'], ['AO', 'Planes de fortalecimiento: medio'],
    ['AP', 'Tipo de asesoría'], ['AQ', 'Fecha'], ['AR', 'No de participantes'], ['AS', 'Medio utilizado'],
  ]},
  { id: 'F', nombre: 'F. Participación en espacios de relacionamiento con las comunidades', campos: [
    ['AT', 'Participación en espacios de relacionamiento con las comunidades en las áreas'],
  ]},
  { id: 'OBS', nombre: 'Observaciones', campos: [
    ['AU', 'Aspectos generales del funcionamiento de la organización y su avance en otras actividades del acompañamiento social'],
  ]},
];

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
export const AREAS = ['S', 'AB', 'AF', 'AU'];

// Columnas de fecha: se muestran con selector de fecha y se guardan como dd/mm/aaaa
export const FECHAS = ['K', 'N', 'Q', 'T', 'W', 'Z', 'AD', 'AJ', 'AM', 'AQ'];

// Dónde cae cada dato del informe de visita (PDF) dentro del Excel
export const DESTINO_INFORME = {
  tipoAsesoria: ['AP', 'Tipo de asesoría'],
  fecha: ['AQ', 'Fecha'],
  participantes: ['AR', 'No de participantes'],
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
