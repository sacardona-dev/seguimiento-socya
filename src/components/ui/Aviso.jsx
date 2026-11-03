/** Mensaje destacado. tipo: 'alerta' | 'error' | 'exito'. */
export default function Aviso({ tipo = 'alerta', children, onCerrar }) {
  return (
    <div className={`aviso aviso--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <span>{children}</span>
      {onCerrar && (
        <button type="button" className="btn btn--icono" aria-label="Cerrar mensaje" onClick={onCerrar}>×</button>
      )}
    </div>
  );
}
