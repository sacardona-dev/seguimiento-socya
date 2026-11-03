import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

/** Extrae el texto de un PDF en el navegador, sin subirlo a ningún lado. */
export class LectorPdf {
  constructor() {
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  }

  /** @returns {Promise<string>} texto de la primera página, en una sola línea */
  async leerPrimeraPagina(archivo) {
    const datos = await archivo.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: datos }).promise;
    const pagina = await pdf.getPage(1);
    const contenido = await pagina.getTextContent();
    return contenido.items.map(i => i.str).join(' ').replace(/\s+/g, ' ');
  }
}
