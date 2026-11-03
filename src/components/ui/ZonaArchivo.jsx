import { useState } from 'react';

/** Zona para soltar un archivo o hacer clic y elegirlo. */
export default function ZonaArchivo({ accept, ocupado, textoOcupado, onArchivo }) {
  const [encima, setEncima] = useState(false);

  const tomar = archivos => {
    const archivo = archivos?.[0];
    if (archivo && !ocupado) onArchivo(archivo);
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
        className="oculto-visual"
        disabled={ocupado}
        onChange={e => { tomar(e.target.files); e.target.value = ''; }}
      />
      {ocupado ? (
        <strong>{textoOcupado}</strong>
      ) : (
        <>
          <strong>Arrastra aquí el PDF del informe</strong>
          <span className="texto-suave">o haz clic para elegirlo</span>
        </>
      )}
    </label>
  );
}
