import { useId, useState } from 'react';
import { IconoLupa } from '../ui/Iconos';

/**
 * Busca una organización por nombre en todo el mes, sin pasar por central y municipio.
 * Se maneja con mouse o teclado: flechas para moverse, Enter para abrir, Escape para cerrar.
 */
export default function BuscadorOrganizaciones({ mes, onElegir }) {
  const [texto, setTexto] = useState('');
  const [activo, setActivo] = useState(0);
  const idLista = useId();
  const resultados = mes.buscarPorTexto(texto);
  const abierto = texto.trim().length >= 2;

  function elegir(org) {
    onElegir(org);
    setTexto('');
    setActivo(0);
  }

  function alPresionar(e) {
    if (!abierto) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActivo(i => Math.min(i + 1, resultados.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActivo(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && resultados[activo]) { e.preventDefault(); elegir(resultados[activo]); }
    if (e.key === 'Escape') setTexto('');
  }

  return (
    <div className="buscador-global">
      <span className="buscador-global__icono"><IconoLupa /></span>
      <input
        type="search"
        placeholder="Buscar organización por nombre…"
        aria-label="Buscar organización por nombre"
        role="combobox"
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-activedescendant={abierto && resultados[activo] ? `${idLista}-${activo}` : undefined}
        value={texto}
        onChange={e => { setTexto(e.target.value); setActivo(0); }}
        onKeyDown={alPresionar}
      />
      {abierto && (
        <ul className="buscador-global__lista" id={idLista} role="listbox">
          {resultados.length === 0 && <li className="buscador-global__vacio">Ninguna organización coincide en {mes.label}.</li>}
          {resultados.map((o, i) => (
            <li
              key={o.id}
              id={`${idLista}-${i}`}
              role="option"
              aria-selected={i === activo}
              className="buscador-global__opcion"
              onMouseDown={e => { e.preventDefault(); elegir(o); }}
              onMouseEnter={() => setActivo(i)}
            >
              <strong>{o.nombre}</strong>
              <span className="texto-suave">{o.central} · {o.municipio}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
