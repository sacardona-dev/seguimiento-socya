import { useState } from 'react';

/**
 * Zona para soltar archivos o hacer clic y elegirlos (uno o varios a la vez).
 * Siempre entrega una lista: onArchivos([archivo, ...]).
 */
export default function ZonaArchivo({ accept, multiple = false, ocupado, textoOcupado, texto, onArchivos }) {
  const [encima, setEncima] = useState(false);

  const tomar = lista => {
    const archivos = [...(lista ?? [])];
    if (archivos.length && !ocupado) onArchivos(multiple ? archivos : archivos.slice(0, 1));
  };

  return (
    <label
      className={`zona-archivo ${encima ? 'zona-archivo--encima' : ''}`}
      onDragOver={e => { e.preventDefault(); setEncima(true); }}
      onDragLeave={() => setEncima(false)}
      onDrop={e => { e.preventDefault(); setEncima(false); tomar(e.dataTransfer.files); }}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="oculto-visual"
        disabled={ocupado}
        onChange={e => { tomar(e.target.files); e.target.value = ''; }}
      />
      {ocupado ? (
        <strong>{textoOcupado}</strong>
      ) : (
        <>
          <strong>{texto}</strong>
          <span className="texto-suave">o haz clic para {multiple ? 'elegirlos' : 'elegirlo'}</span>
        </>
      )}
    </label>
  );
}
