import { useState } from 'react';
import { InformeVisita } from '../../domain/InformeVisita';
import { lectorPdf } from '../../services';
import Aviso from '../ui/Aviso';
import Boton from '../ui/Boton';
import Modal from '../ui/Modal';
import ZonaArchivo from '../ui/ZonaArchivo';

/**
 * Sube un informe de visita en PDF en dos pasos:
 * 1) elegir el archivo, 2) revisar qué se guarda. Nada se guarda sin confirmar.
 */
export default function ImportarInforme({ meses, onConfirmar, onCerrar }) {
  const [leyendo, setLeyendo] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState(null);

  async function procesar(archivo) {
    setError('');
    setLeyendo(true);
    try {
      const texto = await lectorPdf.leerPrimeraPagina(archivo);
      setPlan(armarPlan(InformeVisita.desdeTexto(texto), meses));
    } catch (e) {
      setError(e instanceof ErrorInforme ? e.message
        : 'No pudimos leer el PDF. Revisa que sea el informe de visita con texto, no una foto escaneada.');
    } finally {
      setLeyendo(false);
    }
  }

  if (!plan) {
    return (
      <Modal titulo="Subir informe de visita" onCerrar={onCerrar} pie={<Boton variante="texto" onClick={onCerrar}>Cancelar</Boton>}>
        <p className="texto-suave">Leemos el PDF en este computador y te mostramos qué datos pasan al seguimiento antes de guardar.</p>
        <ZonaArchivo accept="application/pdf" ocupado={leyendo} textoOcupado="Leyendo el informe…" onArchivo={procesar} />
        {error && <Aviso tipo="error">{error}</Aviso>}
      </Modal>
    );
  }

  const { mes, organizacion, cambios, no } = plan;
  return (
    <Modal
      titulo="Revisa antes de guardar"
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="texto" onClick={() => setPlan(null)}>Elegir otro PDF</Boton>
          <Boton variante="primario" disabled={cambios.length === 0} onClick={() => onConfirmar(mes, organizacion, cambios)}>
            Guardar {cambios.length} {cambios.length === 1 ? 'campo' : 'campos'}
          </Boton>
        </>
      }
    >
      <p><strong>{organizacion.nombre}</strong></p>
      <p className="texto-suave">{mes.label} · {organizacion.central} · {organizacion.municipio}</p>

      <h3 className="subtitulo">Se guarda</h3>
      {cambios.length === 0 ? (
        <p className="vacio">Este informe no trae campos que existan en el Excel.</p>
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

      <h3 className="subtitulo">No se guarda</h3>
      <ul className="lista-no">
        {no.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    </Modal>
  );
}

/** Error con un mensaje pensado para mostrarle a la persona. */
class ErrorInforme extends Error {}

function armarPlan(informe, meses) {
  const mes = meses.find(m => m.numero === informe.numeroMes && m.anio === informe.anio);
  if (!mes) throw new ErrorInforme(`El informe tiene fecha ${informe.fecha || 'vacía'} y no hay un mes cargado para esa fecha.`);

  const organizacion = mes.buscarOrganizacion(informe);
  if (!organizacion) throw new ErrorInforme(`No encontramos “${informe.organizacion || 'sin nombre'}” en ${mes.label}. Revisa el nombre de la organización en el informe.`);

  return { mes, organizacion, ...informe.planearCambios(organizacion) };
}
