// Reglas para crear o cambiar una contraseña (no aplican al iniciar sesión con una que ya existe).
const REGLAS = [
  { cumple: c => c.length >= 8, mensaje: 'Mínimo 8 caracteres' },
  { cumple: c => /[A-ZÁÉÍÓÚÑ]/.test(c), mensaje: 'Al menos una letra mayúscula' },
  { cumple: c => /\d/.test(c), mensaje: 'Al menos un número' },
];

/** @returns {{ mensaje: string, cumple: boolean }[]} cada regla con si se cumple o no */
export function revisarContrasena(clave) {
  return REGLAS.map(r => ({ mensaje: r.mensaje, cumple: r.cumple(clave) }));
}
