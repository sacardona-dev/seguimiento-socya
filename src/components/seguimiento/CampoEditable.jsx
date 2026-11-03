import { useEffect, useId, useState } from 'react';
import { AREAS, FECHAS, OPCIONES } from '../../config/esquemaExcel';
import { excelAIso, isoAExcel } from '../../utils/fechas';

const ETIQUETA_ORIGEN = {
  pdf: <span className="etiqueta etiqueta--exito">Del informe</span>,
  manual: <span className="etiqueta">Manual</span>,
};

/**
 * Un campo del Excel. Elige solo el control adecuado (lista, fecha, texto largo o texto corto).
 * Las listas guardan al elegir; fechas y textos guardan al salir del campo, no en cada tecla.
 */
export default function CampoEditable({ columna, etiqueta, valor, origen, ultimoCambio, onGuardar }) {
  const id = useId();
  const [borrador, setBorrador] = useState(valor);
  useEffect(() => setBorrador(valor), [valor]);

  const guardarSiCambio = () => { if (borrador !== valor) onGuardar(borrador); };
  const opciones = OPCIONES[columna];
  const esArea = AREAS.includes(columna);

  let control;
  if (opciones) {
    control = (
      <select id={id} value={borrador} onChange={e => { setBorrador(e.target.value); onGuardar(e.target.value); }}>
        <option value="">Sin dato</option>
        {opciones.map(o => <option key={o}>{o}</option>)}
        {borrador && !opciones.includes(borrador) && <option>{borrador}</option>}
      </select>
    );
  } else if (FECHAS.includes(columna)) {
    // Si el valor guardado no es una fecha válida (ej. "No aplica"), se muestra abajo
    // para que no se pierda; solo cambia si la persona elige una fecha.
    const noEsFecha = borrador && !excelAIso(borrador);
    control = (
      <>
        <input
          id={id}
          type="date"
          value={excelAIso(borrador)}
          onChange={e => {
            // Una fecha escrita a medias llega vacía con badInput; se ignora para no borrar lo anterior
            if (e.target.value || !e.target.validity.badInput) setBorrador(isoAExcel(e.target.value));
          }}
          onBlur={guardarSiCambio}
        />
        {noEsFecha && <small className="campo__nota">Valor actual: “{borrador}”. Elige una fecha para reemplazarlo.</small>}
      </>
    );
  } else if (esArea) {
    control = <textarea id={id} value={borrador} onChange={e => setBorrador(e.target.value)} onBlur={guardarSiCambio} />;
  } else {
    control = <input id={id} value={borrador} onChange={e => setBorrador(e.target.value)} onBlur={guardarSiCambio} />;
  }

  return (
    <div className={`campo ${esArea ? 'campo--ancho' : ''}`}>
      <label htmlFor={id}>{etiqueta}{ETIQUETA_ORIGEN[origen]}</label>
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
