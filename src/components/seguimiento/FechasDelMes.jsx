import { useState } from 'react';
import { diaCorto } from '../../utils/fechas';
import Boton from '../ui/Boton';

/**
 * Fechas (visitas) de la organización en el mes, como pestañas arriba de la ficha. Cada fecha tiene su
 * propia información: al elegir una, todos los campos de abajo pasan a ser los de ese día, sin mover
 * la pantalla. "＋ Fecha" agrega una fecha nueva en blanco.
 *
 * fechas: [1, 2…] ya ordenadas. nuevas: las agregadas que aún no tienen datos. elegida: la que se ve.
 */
export default function FechasDelMes({ mes, organizacion, fechas, nuevas, elegida, onElegir, onAgregar, onQuitar }) {
  const [porQuitar, setPorQuitar] = useState(false);

  function elegir(n) {
    setPorQuitar(false);
    onElegir(n);
  }

  /** Flechas izquierda/derecha para pasar de una pestaña a otra con el teclado (patrón conocido). */
  function moverConTeclado(e) {
    const paso = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!paso) return;
    const i = fechas.indexOf(elegida);
    const siguiente = fechas[(i + paso + fechas.length) % fechas.length];
    elegir(siguiente);
    e.currentTarget.querySelector(`[data-fecha="${siguiente}"]`)?.focus();
  }

  return (
    <section className="fechas" aria-label="Fechas del mes">
      <h3 className="fechas__titulo">Fechas de {mes.label}</h3>

      <div className="fechas__pestanas" role="tablist" onKeyDown={moverConTeclado}>
        {fechas.map(n => {
          const activa = n === elegida;
          const dias = organizacion.diasDeFecha(n);
          const actividades = organizacion.actividadesDeFecha(n).map(g => sinNumero(g.nombre)).join(', ');
          const sinDia = nuevas.includes(n) ? 'Nueva fecha' : 'Sin fecha';
          return (
            <button
              key={n}
              type="button"
              role="tab"
              data-fecha={n}
              aria-selected={activa}
              tabIndex={activa ? 0 : -1}
              className={`fechas__pestana ${activa ? 'fechas__pestana--activa' : ''}`}
              title={actividades}
              onClick={() => elegir(n)}
            >
              <span className="fechas__dia">
                {dias.length ? diaCorto(dias[0]) : sinDia}
                {dias.length > 1 && <small> y {dias.length - 1} más</small>}
              </span>
              <span className="fechas__actividad">{actividades || 'Sin actividades con fecha'}</span>
            </button>
          );
        })}
        {onAgregar && (
          <button type="button" className="fechas__pestana fechas__pestana--agregar" onClick={() => { setPorQuitar(false); onAgregar(); }}>
            ＋ Fecha
          </button>
        )}
      </div>

      <div className="fechas__pie">
        <span className="texto-suave">
          {fechas.length > 1
            ? 'Lo que llenes abajo queda solo en la fecha elegida.'
            : 'Si la organización tuvo otra visita este mes, agrégala con "＋ Fecha".'}
        </span>
        {fechas.length > 1 && (
          porQuitar ? (
            <span className="fechas__confirmar" role="alert">
              ¿Quitamos esta fecha y todos sus datos?
              <Boton variante="secundario" onClick={() => { setPorQuitar(false); onQuitar(elegida); }}>Sí, quitar</Boton>
              <Boton variante="texto" onClick={() => setPorQuitar(false)}>Cancelar</Boton>
            </span>
          ) : (
            <Boton variante="texto" className="fechas__quitar" onClick={() => setPorQuitar(true)}>Quitar esta fecha</Boton>
          )
        )}
      </div>
    </section>
  );
}

/** '3. Capacitación y asesoría' → 'Capacitación y asesoría' (en la pestaña el número no dice nada). */
function sinNumero(nombre) {
  return nombre.replace(/^[\d.]+\s*/, '');
}
