import { useEffect, useId, useRef } from 'react';

/** Ventana encima de la pantalla. Se cierra con Escape, con la X o haciendo clic afuera. */
export default function Modal({ titulo, onCerrar, children, pie }) {
  const idTitulo = useId();
  const caja = useRef(null);
  const cerrar = useRef(onCerrar);
  cerrar.current = onCerrar;

  useEffect(() => {
    const anterior = document.activeElement;
    caja.current?.focus();
    const alPresionar = e => { if (e.key === 'Escape') cerrar.current(); };
    document.addEventListener('keydown', alPresionar);
    return () => {
      document.removeEventListener('keydown', alPresionar);
      anterior?.focus?.();
    };
  }, []);

  return (
    <div className="modal" onMouseDown={e => e.target === e.currentTarget && cerrar.current()}>
      <div className="modal__caja" role="dialog" aria-modal="true" aria-labelledby={idTitulo} tabIndex={-1} ref={caja}>
        <header className="modal__encabezado">
          <h2 id={idTitulo}>{titulo}</h2>
          <button type="button" className="btn btn--icono" aria-label="Cerrar" onClick={() => cerrar.current()}>×</button>
        </header>
        <div className="modal__cuerpo">{children}</div>
        {pie && <footer className="modal__pie">{pie}</footer>}
      </div>
    </div>
  );
}
