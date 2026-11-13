/**
 * Controles para pasar de una página a otra (ej. de 5 en 5).
 * Muestra Anterior / números / Siguiente y cuántos elementos se están viendo.
 * No aparece si todo cabe en una sola página.
 */
export default function Paginacion({ pagina, totalElementos, porPagina, nombre = 'elementos', onCambiar }) {
  const totalPaginas = Math.ceil(totalElementos / porPagina);
  if (totalPaginas <= 1) return null;

  const desde = (pagina - 1) * porPagina + 1;
  const hasta = Math.min(pagina * porPagina, totalElementos);

  return (
    <nav className="paginacion" aria-label={`Páginas de ${nombre}`}>
      <div className="paginacion__controles">
        <button type="button" className="paginacion__boton" onClick={() => onCambiar(pagina - 1)} disabled={pagina === 1}>
          ‹ Anterior
        </button>
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            type="button"
            className="paginacion__numero"
            aria-current={n === pagina ? 'page' : undefined}
            aria-label={`Página ${n}`}
            onClick={() => onCambiar(n)}
          >
            {n}
          </button>
        ))}
        <button type="button" className="paginacion__boton" onClick={() => onCambiar(pagina + 1)} disabled={pagina === totalPaginas}>
          Siguiente ›
        </button>
      </div>
      <p className="paginacion__texto">{nombre.charAt(0).toUpperCase() + nombre.slice(1)} {desde} a {hasta} de {totalElementos}</p>
    </nav>
  );
}
