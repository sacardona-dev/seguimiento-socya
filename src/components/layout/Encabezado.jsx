import { useId } from 'react';
import Boton from '../ui/Boton';
import EstadoGuardado from '../ui/EstadoGuardado';

const OPCION_MES_NUEVO = '__mes_nuevo__';

/**
 * Barra superior. Una sola acción primaria (Subir informe) para que destaque;
 * el resto queda como secundaria o de texto. Abrir un mes nuevo va dentro del selector
 * de mes, que es donde la persona lo busca.
 */
export default function Encabezado({
  meses, mesActual, mesSiguiente, onCambiarMes, onAbrirMesNuevo,
  onSubirInforme, onDescargarExcel, onSalir, modoLocal, estadoGuardado,
}) {
  const idMes = useId();

  function alElegir(valor) {
    if (valor === OPCION_MES_NUEVO) onAbrirMesNuevo();
    else onCambiarMes(valor);
  }

  return (
    <header className="encabezado">
      <div className="encabezado__marca">
        <h1>Seguimiento mensual</h1>
        {modoLocal && <span className="etiqueta etiqueta--alerta">Modo local: solo este navegador</span>}
      </div>

      <div className="encabezado__acciones">
        <EstadoGuardado estado={estadoGuardado} />
        <div className="campo-en-linea">
          <label htmlFor={idMes}>Mes</label>
          <select id={idMes} value={mesActual.clave} onChange={e => alElegir(e.target.value)}>
            {meses.map(m => <option key={m.clave} value={m.clave}>{m.label}</option>)}
            {mesSiguiente && <option value={OPCION_MES_NUEVO}>＋ Abrir {mesSiguiente.label}…</option>}
          </select>
        </div>
        <Boton onClick={onDescargarExcel}>Descargar Excel</Boton>
        <Boton variante="primario" onClick={onSubirInforme}>Subir informe de visita</Boton>
        {onSalir && <Boton variante="texto" onClick={onSalir}>Salir</Boton>}
      </div>
    </header>
  );
}
