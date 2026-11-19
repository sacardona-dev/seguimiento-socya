import { useId, useMemo, useState } from 'react';
import { useHistorial } from '../../hooks/useHistorial';
import Aviso from '../ui/Aviso';
import Boton from '../ui/Boton';
import BotonVolver from '../ui/BotonVolver';

const POR_PAGINA = 50;
const DIAS_POR_DEFECTO = 30;

/**
 * Historial de cambios (solo administradores): quién cambió qué, cuándo, y el valor de antes y después.
 * Se filtra por rango de fechas, por persona y con un buscador (organización, campo, valor...).
 * Solo se consulta: no se puede editar ni borrar desde aquí.
 */
export default function HistorialCambios({ meses, onVolver }) {
  const [desde, setDesde] = useState(() => isoDeHoy(-DIAS_POR_DEFECTO));
  const [hasta, setHasta] = useState(() => isoDeHoy(0));
  const [persona, setPersona] = useState('');
  const [texto, setTexto] = useState('');
  const [mostrar, setMostrar] = useState(POR_PAGINA);
  const ids = { desde: useId(), hasta: useId(), persona: useId(), buscar: useId() };

  const { cambios, cargando, error, recortado } = useHistorial(desde, hasta, meses);
  const personas = useMemo(() => [...new Set(cambios.map(c => c.persona))].sort(), [cambios]);
  const filtrados = cambios.filter(c => (!persona || c.persona === persona) && c.coincide(texto));
  const filtrar = cambiar => valor => { cambiar(valor); setMostrar(POR_PAGINA); };

  return (
    <section className="historial">
      <div className="barra-navegacion">
        <div className="barra-navegacion__ruta">
          <BotonVolver destino="Seguimiento" onClick={onVolver} />
          <h2 className="barra-navegacion__lugar">Historial de cambios</h2>
        </div>
      </div>
      <p className="texto-suave">Solo lo ven los administradores. Cada cambio queda anotado por la base de datos y no se puede editar ni borrar.</p>

      <div className="historial__filtros tarjeta">
        <div className="campo">
          <label htmlFor={ids.desde}>Desde</label>
          <input id={ids.desde} type="date" value={desde} max={hasta} onChange={e => e.target.value && filtrar(setDesde)(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor={ids.hasta}>Hasta</label>
          <input id={ids.hasta} type="date" value={hasta} min={desde} onChange={e => e.target.value && filtrar(setHasta)(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor={ids.persona}>Persona</label>
          <select id={ids.persona} value={persona} onChange={e => filtrar(setPersona)(e.target.value)}>
            <option value="">Todas</option>
            {personas.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="campo historial__buscar">
          <label htmlFor={ids.buscar}>Buscar</label>
          <input id={ids.buscar} type="search" placeholder="Organización, campo o valor…" value={texto} onChange={e => filtrar(setTexto)(e.target.value)} />
        </div>
      </div>

      {error && <Aviso tipo="error">{error}</Aviso>}
      {recortado && <Aviso tipo="alerta">Hay muchos cambios en estas fechas: mostramos los más recientes. Acorta el rango para ver los demás.</Aviso>}

      <p className="texto-suave" aria-live="polite">
        {cargando ? 'Cargando el historial…' : `${filtrados.length} ${filtrados.length === 1 ? 'cambio' : 'cambios'}`}
      </p>

      {!cargando && (
        <div className="tabla-contenedor">
          <table className="tabla historial__tabla">
            <thead>
              <tr>
                <th>Fecha y hora</th><th>Persona</th><th>Qué hizo</th>
                <th>Organización y mes</th><th>Campo</th><th>Antes</th><th>Después</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.slice(0, mostrar).map(c => {
                // "3. Capacitación… · Fecha (fecha 2)" → campo arriba y subgrupo en pequeño
                const partes = c.campo.split(' · ');
                const campo = partes.pop();
                return (
                <tr key={c.id}>
                  <td className="sin-salto">{formatoFecha(c.fecha)}</td>
                  <td className="historial__persona">{c.persona}</td>
                  <td><span className={`etiqueta ${c.accion.startsWith('Borró') ? 'etiqueta--alerta' : ''}`}>{c.accion}</span></td>
                  <td className="historial__donde">{c.organizacion}<small className="texto-suave">{c.mes}</small></td>
                  <td className="historial__donde">{campo}{partes.length > 0 && <small className="texto-suave">{partes.join(' · ')}</small>}</td>
                  <td className="historial__valor">{c.antes || <span className="texto-suave">(vacío)</span>}</td>
                  <td className="historial__valor">{c.despues || <span className="texto-suave">(vacío)</span>}</td>
                </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr><td colSpan={7} className="vacio">No hay cambios con estos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!cargando && filtrados.length > mostrar && (
        <div className="historial__mas">
          <Boton onClick={() => setMostrar(m => m + POR_PAGINA)}>Ver {Math.min(POR_PAGINA, filtrados.length - mostrar)} más</Boton>
        </div>
      )}
    </section>
  );
}

/** Hoy (o hoy ± días) en formato aaaa-mm-dd, con la hora de este computador. */
function isoDeHoy(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatoFecha(fecha) {
  return fecha.toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
