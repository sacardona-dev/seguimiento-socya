/** Tarjetas de centrales o municipios, con su número de organizaciones. */
export default function TarjetasGrupo({ grupos, textoSinNombre, onElegir }) {
  if (grupos.length === 0) return <p className="vacio">No hay registros en este mes.</p>;

  return (
    <ul className="rejilla">
      {grupos.map(g => (
        <li key={g.nombre}>
          <button type="button" className="tarjeta tarjeta--clic" onClick={() => onElegir(g.nombre)}>
            <span className="tarjeta__titulo">{g.nombre || textoSinNombre}</span>
            <span className="texto-suave">{g.total} {g.total === 1 ? 'organización' : 'organizaciones'}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
