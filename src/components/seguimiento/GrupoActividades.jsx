import { useState } from 'react';
import { FECHAS, MAX_ACTIVIDADES, NUMEROS } from '../../config/esquemaExcel';
import { columnaActividad } from '../../utils/columnas';
import { estaVacio } from '../../utils/texto';
import Boton from '../ui/Boton';
import CampoEditable from './CampoEditable';

const TODAS = Array.from({ length: MAX_ACTIVIDADES }, (_, i) => i + 1);

/**
 * Subgrupo con fecha que puede repetirse en el mes (en el Excel: la fila partida en sub-filas).
 * Cada fecha es una línea corta ("20/10/2026 · 7 participantes"); al dar clic se abren sus campos.
 * Solo una abierta a la vez, para que no quede una lista larga (Miller). Si hay una sola, ya viene abierta.
 */
export default function GrupoActividades({ grupo, mes, organizacion, onEditar }) {
  const conDatos = organizacion.actividades(grupo);
  const [nuevas, setNuevas] = useState([]); // agregadas con el botón que aún no tienen datos
  const visibles = TODAS.filter(n => conDatos.includes(n) || nuevas.includes(n));
  if (visibles.length === 0) visibles.push(1);

  const [abierta, setAbierta] = useState(visibles.length === 1 ? visibles[0] : null);
  const [porQuitar, setPorQuitar] = useState(null);

  const colFecha = grupo.campos.find(([c]) => FECHAS.includes(c))?.[0];
  const colNumero = grupo.campos.find(([c]) => NUMEROS.includes(c))?.[0];
  const valor = (col, n) => organizacion.valor(columnaActividad(col, n));

  function agregar() {
    const libre = TODAS.find(n => !visibles.includes(n));
    setNuevas(prev => [...prev, libre]);
    setAbierta(libre);
    setPorQuitar(null);
  }

  /** Quitar = dejar en blanco todos los campos de esa fecha (así queda también en el historial). */
  function quitar(n) {
    grupo.campos.forEach(([c]) => {
      if (!estaVacio(valor(c, n))) onEditar(columnaActividad(c, n), '');
    });
    setNuevas(prev => prev.filter(x => x !== n));
    setPorQuitar(null);
    setAbierta(null);
  }

  return (
    <div className="actividades">
      {visibles.map(n => {
        const estaAbierta = abierta === n;
        const fecha = valor(colFecha, n);
        const participantes = colNumero ? valor(colNumero, n) : '';
        const tieneDatos = conDatos.includes(n);
        return (
          <div className={`actividad ${estaAbierta ? 'actividad--abierta' : ''}`} key={n}>
            <button
              type="button"
              className="actividad__linea"
              aria-expanded={estaAbierta}
              onClick={() => { setAbierta(estaAbierta ? null : n); setPorQuitar(null); }}
            >
              <span className="actividad__fecha">{estaVacio(fecha) ? 'Sin fecha' : fecha}</span>
              {!estaVacio(participantes) && (
                <span className="texto-suave">· {participantes} {participantes === '1' ? 'participante' : 'participantes'}</span>
              )}
            </button>

            {estaAbierta && (
              <div className="actividad__cuerpo">
                <div className="seccion__cuerpo">
                  {grupo.campos.map(([c, etiqueta, ayuda]) => {
                    const col = columnaActividad(c, n);
                    return (
                      <CampoEditable
                        key={col}
                        columna={c}
                        etiqueta={etiqueta}
                        ayuda={ayuda}
                        mes={mes}
                        valor={organizacion.valor(col)}
                        origen={organizacion.origen(col)}
                        ultimoCambio={organizacion.ultimoCambio(col)}
                        onGuardar={v => onEditar(col, v)}
                      />
                    );
                  })}
                </div>

                {(visibles.length > 1 || tieneDatos) && (
                  porQuitar === n ? (
                    <div className="actividad__confirmar" role="alert">
                      <span>¿Quitamos esta fecha y todos sus datos?</span>
                      <Boton variante="secundario" onClick={() => quitar(n)}>Sí, quitar</Boton>
                      <Boton variante="texto" onClick={() => setPorQuitar(null)}>Cancelar</Boton>
                    </div>
                  ) : (
                    <Boton variante="texto" className="actividad__quitar" onClick={() => setPorQuitar(n)}>
                      Quitar esta fecha
                    </Boton>
                  )
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Solo cuando todas las fechas tienen datos: así no se amontonan fechas vacías */}
      {visibles.length < MAX_ACTIVIDADES && visibles.every(n => conDatos.includes(n)) && (
        <Boton variante="texto" className="actividades__agregar" onClick={agregar}>＋ Agregar otra fecha</Boton>
      )}
    </div>
  );
}
