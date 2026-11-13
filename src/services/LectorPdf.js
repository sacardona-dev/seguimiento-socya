/**
 * Extrae el texto de un PDF en el navegador, sin subirlo a ningún lado.
 * La librería (pdfjs, ~1 MB) se descarga solo la primera vez que se lee un PDF,
 * para que la app abra rápido.
 */
export class LectorPdf {
  #pdfjs = null;

  /** @returns {Promise<string>} texto de la primera página, en una sola línea */
  async leerPrimeraPagina(archivo) {
    const pdfjs = await this.#cargarLibreria();
    const datos = await archivo.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: datos }).promise;
    const pagina = await pdf.getPage(1);
    const contenido = await pagina.getTextContent();
    return contenido.items.map(i => i.str).join(' ').replace(/\s+/g, ' ');
  }

  async #cargarLibreria() {
    if (!this.#pdfjs) {
      const [pdfjs, { default: workerUrl }] = await Promise.all([
        import('pdfjs-dist'),
        import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
      ]);
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      this.#pdfjs = pdfjs;
    }
    return this.#pdfjs;
  }
}
