/** Ruta de navegación: Centrales › Jaguas › Alejandría › Organización. El último paso es donde estás. */
export default function Migas({ pasos }) {
  return (
    <nav className="migas" aria-label="Ruta">
      <ol>
        {pasos.map((p, i) => {
          const actual = i === pasos.length - 1;
          return (
            <li key={i}>
              {actual
                ? <span aria-current="page">{p.texto}</span>
                : <button type="button" onClick={p.onClick}>{p.texto}</button>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
