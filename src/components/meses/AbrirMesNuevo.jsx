import { useState } from 'react';
import Aviso from '../ui/Aviso';
import Boton from '../ui/Boton';
import Modal from '../ui/Modal';

/** Confirma antes de abrir un mes nuevo y explica qué se copia y qué empieza en blanco. */
export default function AbrirMesNuevo({ mesSiguiente, onAbrir, onCerrar }) {
  const [abriendo, setAbriendo] = useState(false);
  const [error, setError] = useState('');

  async function abrir() {
    setAbriendo(true);
    setError('');
    try {
      await onAbrir();
    } catch {
      setError(`No pudimos agregar ${mesSiguiente.label}. Puede que otra persona ya lo haya agregado: recarga la página. Si sigue fallando, revisa que la tabla "meses" exista en Supabase.`);
      setAbriendo(false);
    }
  }

  return (
    <Modal
      titulo={`Agregar ${mesSiguiente.label}`}
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="texto" onClick={onCerrar}>Cancelar</Boton>
          <Boton variante="primario" onClick={abrir} disabled={abriendo}>
            {abriendo ? 'Agregando…' : 'Agregar mes'}
          </Boton>
        </>
      }
    >
      <p>Creamos el mes con las mismas organizaciones de {mesSiguiente.desde}.</p>
      <h3 className="subtitulo">Se copia</h3>
      <ul className="lista-no">
        <li>Central, municipio, vigencia, nombre y tipo de la organización</li>
        <li>Módulo de escuela y generalidades del proyecto</li>
        <li>Resultados ICO</li>
      </ul>
      <h3 className="subtitulo">Empieza en blanco</h3>
      <ul className="lista-no">
        <li>Fechas, participantes, temáticas y resúmenes de cada actividad</li>
        <li>Participación en escuela y en espacios de relacionamiento</li>
        <li>Observaciones</li>
      </ul>
      <p className="texto-suave">Lo ve todo el equipo. Un mes abierto no se puede borrar desde la app.</p>
      {error && <Aviso tipo="error">{error}</Aviso>}
    </Modal>
  );
}
