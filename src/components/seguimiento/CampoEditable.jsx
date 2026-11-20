import { useEffect, useId, useState } from 'react';
import { AREAS, FECHAS, NUMEROS, OPCIONES } from '../../config/esquemaExcel';
import { excelAIso, isoAExcel } from '../../utils/fechas';

// Solo se marca lo que vino del informe en PDF. "Manual" se quitó a pedido de la usuaria.
const ETIQUETA_ORIGEN = {
  pdf: <span className="etiqueta etiqueta--exito">Del informe</span>,
};

/**
 * Un campo del Excel. Elige solo el control adecuado (lista, fecha, número, texto largo o texto corto).
 * Las listas guardan al elegir; fechas y textos guardan al salir del campo, no en cada tecla.
 */
export default function CampoEditable({ columna, etiqueta, ayuda, mes, valor, origen, ultimoCambio, onGuardar }) {
  const id = useId();
  const idAyuda = useId();
  const [borrador, setBorrador] = useState(valor);
  useEffect(() => setBorrador(valor), [valor]);

  const guardarSiCambio = () => { if (borrador !== valor) onGuardar(borrador); };
  const opciones = OPCIONES[columna];
  const esArea = AREAS.includes(columna);
  const comunes = { id, 'aria-describedby': ayuda ? idAyuda : undefined };

  let control;
  if (opciones) {
    control = (
      <select {...comunes} value={borrador} onChange={e => { setBorrador(e.target.value); onGuardar(e.target.value); }}>
        <option value="">Sin dato</option>
        {opciones.map(o => <option key={o}>{o}</option>)}
        {borrador && !opciones.includes(borrador) && <option>{borrador}</option>}
      </select>
    );
  } else if (FECHAS.includes(columna)) {
    // Si el valor guardado no es una fecha válida (ej. "No aplica"), se muestra abajo
    // para que no se pierda; solo cambia si la persona elige una fecha.
    const noEsFecha = borrador && !excelAIso(borrador);
    // Aviso (no bloquea): una fecha de otro mes suele ser un error de digitación
    const fueraDelMes = !noEsFecha && borrador && mes?.contieneFecha(borrador) === false;
    control = (
      <>
        <input
          {...comunes}
          type="date"
          value={excelAIso(borrador)}
          onChange={e => {
            // Una fecha escrita a medias llega vacía con badInput; se ignora para no borrar lo anterior
            if (e.target.value || !e.target.validity.badInput) setBorrador(isoAExcel(e.target.value));
          }}
          onBlur={guardarSiCambio}
        />
        {noEsFecha && <small className="campo__nota">Valor actual: “{borrador}”. Elige una fecha para reemplazarlo.</small>}
        {fueraDelMes && <small className="campo__nota">Esta fecha no es de {mes.label}. Revisa que sea correcta.</small>}
      </>
    );
  } else if (NUMEROS.includes(columna)) {
    // Solo dígitos: lo que no sea número se quita mientras se escribe.
    // Si ya había un valor que no es número (ej. "No aplica"), se avisa abajo y solo cambia si se escribe encima.
    const noEsNumero = borrador && !/^\d+$/.test(String(borrador).trim());
    control = (
      <>
        <input
          {...comunes}
          inputMode="numeric"
          pattern="[0-9]*"
          value={noEsNumero ? '' : borrador}
          placeholder={noEsNumero ? 'Escribe un número' : undefined}
          onChange={e => setBorrador(e.target.value.replace(/\D/g, ''))}
          onBlur={() => { if (!noEsNumero) guardarSiCambio(); }}
        />
        {noEsNumero && <small className="campo__nota">Valor actual: “{borrador}”. Escribe un número para reemplazarlo.</small>}
      </>
    );
  } else if (esArea) {
    control = <textarea {...comunes} value={borrador} onChange={e => setBorrador(e.target.value)} onBlur={guardarSiCambio} />;
  } else {
    control = <input {...comunes} value={borrador} onChange={e => setBorrador(e.target.value)} onBlur={guardarSiCambio} />;
  }

  return (
    <div className={`campo ${esArea ? 'campo--ancho' : ''}`}>
      <label htmlFor={id}>{etiqueta}{ETIQUETA_ORIGEN[origen]}</label>
      {ayuda && <small id={idAyuda} className="campo__ayuda">{ayuda}</small>}
      {control}
      {ultimoCambio && (
        <small className="campo__autor">
          Editado por {ultimoCambio.autor}{ultimoCambio.fecha && ` · ${formatoFecha(ultimoCambio.fecha)}`}
        </small>
      )}
    </div>
  );
}

function formatoFecha(iso) {
  return new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
