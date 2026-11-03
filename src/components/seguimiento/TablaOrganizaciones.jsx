import { useId, useState } from 'react';
import { normalizar } from '../../utils/texto';

const MINIMO_PARA_BUSCAR = 8;

/** Organizaciones de un municipio. Con muchas filas aparece un buscador. */
export default function TablaOrganizaciones({ organizaciones, onElegir }) {
  const [filtro, setFiltro] = useState('');
  const idBuscar = useId();
  const buscado = normalizar(filtro);
  const visibles = buscado ? organizaciones.filter(o => normalizar(o.nombre).includes(buscado)) : organizaciones;

  return (
    <>
      {organizaciones.length >= MINIMO_PARA_BUSCAR && (
        <div className="buscador">
          <label htmlFor={idBuscar} className="oculto-visual">Buscar organización</label>
          <input id={idBuscar} type="search" placeholder="Buscar organización…" value={filtro} onChange={e => setFiltro(e.target.value)} />
        </div>
      )}

      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr><th>Organización</th><th>Vigencia</th><th>Tipo</th></tr>
          </thead>
          <tbody>
            {visibles.map(o => (
              <tr key={o.id} className="tabla__fila-clic" onClick={() => onElegir(o)}>
                <td><button type="button" className="enlace" onClick={e => { e.stopPropagation(); onElegir(o); }}>{o.nombre}</button></td>
                <td>{o.vigencia}</td>
                <td>{o.tipo}</td>
              </tr>
            ))}
            {visibles.length === 0 && (
              <tr><td colSpan={3} className="vacio">Ninguna organización coincide con “{filtro}”.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
