import { useId } from 'react';
import Boton from '../ui/Boton';
import EstadoGuardado from '../ui/EstadoGuardado';

/**
 * Barra superior. Una sola acción primaria (Subir informe) para que destaque;
 * el resto queda como secundaria o de texto.
 */
export default function Encabezado({ meses, mesActual, onCambiarMes, onSubirInforme, onDescargarExcel, onSalir, modoLocal, estadoGuardado }) {
  const idMes = useId();

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
          <select id={idMes} value={mesActual.mm} onChange={e => onCambiarMes(e.target.value)}>
            {meses.map(m => <option key={m.mm} value={m.mm}>{m.label}</option>)}
          </select>
        </div>
        <Boton onClick={onDescargarExcel}>Descargar Excel</Boton>
        <Boton variante="primario" onClick={onSubirInforme}>Subir informe de visita</Boton>
        {onSalir && <Boton variante="texto" onClick={onSalir}>Salir</Boton>}
      </div>
    </header>
  );
}
