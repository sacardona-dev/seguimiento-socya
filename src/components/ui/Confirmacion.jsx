import { useState } from 'react';
import Aviso from './Aviso';
import Boton from './Boton';
import Modal from './Modal';

/**
 * Pregunta antes de una acción que no se puede deshacer (ej. borrar).
 * Si la acción falla, muestra el error y deja la ventana abierta.
 */
export default function Confirmacion({ titulo, mensaje, textoConfirmar, onConfirmar, onCerrar }) {
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState('');

  async function confirmar() {
    setTrabajando(true);
    setError('');
    try {
      await onConfirmar();
    } catch (e) {
      setError(e.message || 'No se pudo completar. Revisa la conexión e intenta de nuevo.');
      setTrabajando(false);
    }
  }

  return (
    <Modal
      titulo={titulo}
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="texto" onClick={onCerrar}>Cancelar</Boton>
          <Boton variante="peligro" onClick={confirmar} disabled={trabajando}>{trabajando ? 'Un momento…' : textoConfirmar}</Boton>
        </>
      }
    >
      <p>{mensaje}</p>
      {error && <Aviso tipo="error">{error}</Aviso>}
    </Modal>
  );
}
