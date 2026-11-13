import { IconoFlechaIzquierda } from './Iconos';

/** Enlace pequeño para regresar un nivel. Al pasar el mouse dice a dónde regresa. */
export default function BotonVolver({ destino, onClick }) {
  return (
    <button type="button" className="boton-volver" onClick={onClick} title={`Volver a ${destino}`} aria-label={`Volver a ${destino}`}>
      <IconoFlechaIzquierda /> Volver
    </button>
  );
}
