// Convierte la letra de una columna de Excel en su posición (A -> 0, Z -> 25, AA -> 26)
export function indiceColumna(letras) {
  let n = 0;
  for (const ch of letras) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}
