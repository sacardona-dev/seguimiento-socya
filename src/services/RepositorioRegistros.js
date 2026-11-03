/**
 * Contrato para guardar y leer los cambios del equipo.
 * Las subclases deciden dónde (Supabase o el navegador); el resto de la app
 * no sabe ni le importa cuál está usando.
 *
 * Formato de los registros: { [mes]: { [rowId]: { [col]: { v, src, autor?, fecha? } } } }
 */
export class RepositorioRegistros {
  /** true si los datos se comparten con el equipo. */
  get esCompartido() {
    return false;
  }

  /** @returns {Promise<object>} todos los registros */
  async cargarTodo() {
    throw new Error(`${this.constructor.name} debe implementar cargarTodo()`);
  }

  /** @param {{ mes, rowId, col, valor, origen }} cambio */
  async guardarCampo(cambio) { // eslint-disable-line no-unused-vars
    throw new Error(`${this.constructor.name} debe implementar guardarCampo()`);
  }

  /** Inserta un valor en la estructura de registros, creando los niveles que falten. */
  static agregar(registros, { mes, rowId, col, valor, origen, autor, fecha }) {
    registros[mes] ??= {};
    registros[mes][rowId] ??= {};
    registros[mes][rowId][col] = { v: valor ?? '', src: origen, ...(autor && { autor }), ...(fecha && { fecha }) };
    return registros;
  }
}
