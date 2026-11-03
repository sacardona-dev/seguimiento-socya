// Quita tildes, mayúsculas y signos para comparar textos escritos de formas distintas
export function normalizar(s) {
  return (s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

const PALABRAS_GENERICAS = ['junta', 'accion', 'comunal', 'vereda', 'corregimiento', 'jac', 'de', 'del', 'la', 'el', 'sector', 'urbana', 'barrio'];

// Deja solo las palabras que distinguen un nombre ("JAC Vereda Cruces" -> "cruces")
export function claveNombre(s) {
  return normalizar(s).split(' ').filter(p => p && !PALABRAS_GENERICAS.includes(p)).join(' ');
}

export function estaVacio(valor) {
  return String(valor ?? '').trim() === '';
}
