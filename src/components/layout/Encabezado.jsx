import { useId } from 'react';
import Boton from '../ui/Boton';
import EstadoGuardado from '../ui/EstadoGuardado';

/**
 * Herramientas de trabajo, en dos grupos (ley de proximidad):
 * - izquierda, lo del mes: selector y "Agregar mes" (solo cuando ya empezó un mes que no se ha agregado);
 * - derecha, la acción principal: Subir informe. (Descargar Excel va junto al lugar donde está la
 *   persona, porque descarga justo eso.)
 */
export default function Encabezado({
  meses, mesActual, onCambiarMes, onAgregarMes,
  onSubirInforme, estadoGuardado,
}) {
  const idMes = useId();

  return (
    <header className="encabezado">
      <div className="encabezado__grupo">
        <label htmlFor={idMes} className="encabezado__etiqueta">Mes</label>
        <select id={idMes} className="encabezado__mes" value={mesActual.clave} onChange={e => onCambiarMes(e.target.value)}>
          {meses.map(m => <option key={m.clave} value={m.clave}>{m.label}</option>)}
        </select>
        {onAgregarMes && <Boton variante="texto" onClick={onAgregarMes}>＋ Agregar mes</Boton>}
      </div>

      <div className="encabezado__grupo">
        <EstadoGuardado estado={estadoGuardado} />
        <Boton variante="primario" onClick={onSubirInforme}>Subir informe de visita</Boton>
      </div>
    </header>
  );
}
