// Convierte la letra de una columna de Excel en su posición (A -> 0, Z -> 25, AA -> 26)
export function indiceColumna(letras) {
  let n = 0;
  for (const ch of letras) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

// Columna de la fecha n de un subgrupo que se repite en el mes.
// La fecha 1 usa la columna del Excel ("Z"); las demás, "Z_2", "Z_3"... (las sub-filas del Excel).
export function columnaActividad(col, n) {
  return n === 1 ? col : `${col}_${n}`;
}

// Columna del Excel a la que pertenece una columna de actividad ("Z_2" -> "Z")
export function columnaBase(col) {
  return col.split('_')[0];
}
