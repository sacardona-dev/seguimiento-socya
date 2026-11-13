import { IconoBorrar, IconoEditar } from '../ui/Iconos';

/**
 * Una reunión de equipo en forma de tarjeta: se lee mejor que una tabla con textos largos.
 * Si quien usa la app la registró, muestra Editar y Borrar.
 */
export default function TarjetaReunion({ reunion, editable, onEditar, onBorrar }) {
  return (
    <article className="tarjeta reunion">
      <header className="reunion__encabezado">
        <div className="reunion__titulo">
          <strong className="reunion__fecha">{reunion.fecha || 'Sin fecha'}</strong>
          <span className="texto-suave">{[reunion.central, reunion.lugar].filter(Boolean).join(' · ')}</span>
        </div>
        {editable && (
          <div className="reunion__acciones">
            <button type="button" className="boton-icono-texto" onClick={onEditar}><IconoEditar /> Editar</button>
            <button type="button" className="boton-icono-texto boton-icono-texto--peligro" onClick={onBorrar}><IconoBorrar /> Borrar</button>
          </div>
        )}
      </header>
      <div className="reunion__datos">
        {reunion.asistentes && <span className="etiqueta">{reunion.asistentes} asistentes</span>}
        <span className={`etiqueta ${reunion.conIsagen ? 'etiqueta--exito' : ''}`}>ISAGEN: {reunion.isagen || 'Sin dato'}</span>
        {reunion.desdeApp && <span className="etiqueta">Registrada en la app</span>}
      </div>
      {reunion.objetivo && <p className="reunion__objetivo">{reunion.objetivo}</p>}
    </article>
  );
}
