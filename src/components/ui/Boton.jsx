/**
 * Botón con las variantes de la marca.
 * - primario: la acción principal de la pantalla (solo uno por zona)
 * - secundario: acciones de apoyo
 * - texto: acciones de poco peso (Salir, Cancelar)
 */
export default function Boton({ variante = 'secundario', className = '', type = 'button', ...props }) {
  return <button type={type} className={`btn btn--${variante} ${className}`.trim()} {...props} />;
}
