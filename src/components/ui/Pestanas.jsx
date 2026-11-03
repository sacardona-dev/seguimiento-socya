/** Pestañas para cambiar entre vistas principales. */
export default function Pestanas({ opciones, valor, onCambiar }) {
  return (
    <div className="pestanas" role="tablist">
      {opciones.map(o => (
        <button
          key={o.valor}
          type="button"
          role="tab"
          aria-selected={o.valor === valor}
          className="pestanas__item"
          onClick={() => onCambiar(o.valor)}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}
