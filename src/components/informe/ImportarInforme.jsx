import { useId, useState } from 'react';
import { InformeVisita } from '../../domain/InformeVisita';
import { ErrorInforme, LoteInformes } from '../../domain/LoteInformes';
import { lectorPdf } from '../../services';
import Aviso from '../ui/Aviso';
import Boton from '../ui/Boton';
import Modal from '../ui/Modal';
import ZonaArchivo from '../ui/ZonaArchivo';

/**
 * Sube de 1 a 3 informes de visita (PDF) de una misma organización y mes, en dos pasos:
 * 1) elegir los archivos, 2) revisar qué se guarda y corregir el resumen de observaciones.
 * Nada se guarda sin confirmar.
 */
export default function ImportarInforme({ meses, onConfirmar, onCerrar }) {
  const [archivos, setArchivos] = useState([]);
  const [leyendo, setLeyendo] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState(null);
  const [resumen, setResumen] = useState('');
  const idResumen = useId();

  function agregarArchivos(nuevos) {
    setError('');
    const pdfs = nuevos.filter(a => a.type === 'application/pdf' || /\.pdf$/i.test(a.name));
    if (pdfs.length < nuevos.length) setError('Solo se pueden subir archivos PDF.');
    const sinRepetir = pdfs.filter(a => !archivos.some(x => x.name === a.name && x.size === a.size));
    const todos = [...archivos, ...sinRepetir];
    if (todos.length > LoteInformes.MAXIMO) setError(`Puedes subir hasta ${LoteInformes.MAXIMO} informes a la vez. Dejamos los primeros ${LoteInformes.MAXIMO}.`);
    setArchivos(todos.slice(0, LoteInformes.MAXIMO));
  }

  async function revisar() {
    setError('');
    setLeyendo(true);
    try {
      const informes = [];
      for (const archivo of archivos) {
        try {
          informes.push(InformeVisita.desdeTexto(await lectorPdf.leerPrimeraPagina(archivo)));
        } catch {
          throw new ErrorInforme(`No pudimos leer “${archivo.name}”. Revisa que sea el informe de visita con texto, no una foto escaneada.`);
        }
      }
      const lote = new LoteInformes(informes);
      const { mes, organizacion } = lote.ubicar(meses);
      const textoResumen = lote.resumenObservaciones(organizacion);
      setPlan({ mes, organizacion, informes: lote.informes, observacionesAntes: organizacion.valor(LoteInformes.columnaObservaciones[0]), ...lote.planearCambios(organizacion) });
      setResumen(textoResumen);
    } catch (e) {
      setError(e instanceof ErrorInforme ? e.message : 'No pudimos leer los informes. Intenta de nuevo.');
    } finally {
      setLeyendo(false);
    }
  }

  if (!plan) {
    const plural = archivos.length === 1 ? 'informe' : 'informes';
    return (
      <Modal
        titulo="Subir informes de visita"
        onCerrar={onCerrar}
        pie={
          <>
            <Boton variante="texto" onClick={onCerrar}>Cancelar</Boton>
            <Boton variante="primario" disabled={archivos.length === 0 || leyendo} onClick={revisar}>
              {leyendo ? 'Leyendo…' : archivos.length ? `Revisar ${archivos.length} ${plural}` : 'Revisar informes'}
            </Boton>
          </>
        }
      >
        <p className="texto-suave">
          Sube de 1 a {LoteInformes.MAXIMO} informes de <strong>la misma organización y el mismo mes</strong>.
          Los leemos en este computador y te mostramos qué pasa al seguimiento antes de guardar.
        </p>
        {archivos.length < LoteInformes.MAXIMO && (
          <ZonaArchivo
            accept="application/pdf"
            multiple
            ocupado={leyendo}
            textoOcupado="Leyendo los informes…"
            texto={archivos.length ? 'Arrastra aquí otro informe' : 'Arrastra aquí los PDF de los informes'}
            onArchivos={agregarArchivos}
          />
        )}
        {archivos.length > 0 && (
          <ul className="lista-archivos">
            {archivos.map((a, i) => (
              <li key={a.name + a.size}>
                <span>📄 {a.name}</span>
                <button
                  type="button"
                  className="btn btn--icono"
                  aria-label={`Quitar ${a.name}`}
                  disabled={leyendo}
                  onClick={() => setArchivos(archivos.filter((_, j) => j !== i))}
                >×</button>
              </li>
            ))}
          </ul>
        )}
        {error && <Aviso tipo="error">{error}</Aviso>}
      </Modal>
    );
  }

  const { mes, organizacion, informes, cambios, no, observacionesAntes } = plan;
  const cambiaResumen = resumen.trim() !== String(observacionesAntes ?? '').trim();
  const [colObs, etiquetaObs] = LoteInformes.columnaObservaciones;
  const total = cambios.length + (cambiaResumen ? 1 : 0);

  function guardar() {
    const finales = cambiaResumen ? [...cambios, { col: colObs, etiqueta: etiquetaObs, val: resumen.trim() }] : cambios;
    onConfirmar(mes, organizacion, finales, informes.length);
  }

  return (
    <Modal
      titulo="Revisa antes de guardar"
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="texto" onClick={() => setPlan(null)}>Volver a los archivos</Boton>
          <Boton variante="primario" disabled={total === 0} onClick={guardar}>
            Guardar {total} {total === 1 ? 'campo' : 'campos'}
          </Boton>
        </>
      }
    >
      <p><strong>{organizacion.nombre}</strong></p>
      <p className="texto-suave">{mes.label} · {organizacion.central} · {organizacion.municipio}</p>

      <h3 className="subtitulo">{informes.length === 1 ? 'Informe' : `${informes.length} informes`}</h3>
      <ul className="lista-informes">
        {informes.map((inf, i) => (
          <li key={i}>
            <strong>{inf.fecha || 'Sin fecha'}</strong>
            {inf.asistentes && <span className="texto-suave"> · {inf.asistentes} {inf.asistentes === '1' ? 'participante' : 'participantes'}</span>}
            {inf.tipo && <span className="texto-suave"> · {inf.tipo}</span>}
          </li>
        ))}
      </ul>

      <h3 className="subtitulo">Se guarda</h3>
      {cambios.length === 0 ? (
        <p className="vacio">Los informes no traen fechas ni participantes que existan en el Excel.</p>
      ) : (
        <dl className="lista-plan">
          {cambios.map(c => (
            <div key={c.col}>
              <dt>{c.etiqueta}</dt>
              <dd>{c.val}{c.nota && <small className="texto-suave">{c.nota}</small>}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="campo">
        <label htmlFor={idResumen}>Resumen de observaciones (puedes corregirlo)</label>
        <small className="campo__ayuda">
          {informes.length > 1
            ? `Juntamos las observaciones de los ${informes.length} informes, ordenadas por fecha. Se guarda en “${etiquetaObs}”.`
            : `Se guarda en “${etiquetaObs}”.`}
          {observacionesAntes && ' Arriba queda lo que ya estaba escrito.'}
        </small>
        <textarea id={idResumen} className="resumen-informes" value={resumen} onChange={e => setResumen(e.target.value)} />
      </div>

      <h3 className="subtitulo">No se guarda</h3>
      <ul className="lista-no">
        {no.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    </Modal>
  );
}
