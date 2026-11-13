/**
 * Contrato para guardar y leer lo que hace el equipo: los cambios en los campos, los meses
 * abiertos desde la app y las reuniones de equipo registradas desde la app. Las subclases deciden dónde (Supabase o el navegador); el resto
 * de la app no sabe ni le importa cuál está usando.
 *
 * Formato de los registros: { [mes]: { [rowId]: { [col]: { v, src, autor?, fecha? } } } }
 * Formato de un mes: { clave, anio, numero, label, nombreHoja, rows }
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

  /** @returns {Promise<object[]>} meses abiertos desde la app (no incluye los del Excel original) */
  async cargarMeses() {
    throw new Error(`${this.constructor.name} debe implementar cargarMeses()`);
  }

  /** Guarda un mes nuevo. Falla si ya existe uno con la misma clave. */
  async guardarMes(mes) { // eslint-disable-line no-unused-vars
    throw new Error(`${this.constructor.name} debe implementar guardarMes()`);
  }

  /** @returns {Promise<object[]>} reuniones registradas desde la app (filas de la tabla `reuniones`) */
  async cargarReuniones() {
    throw new Error(`${this.constructor.name} debe implementar cargarReuniones()`);
  }

  /**
   * Guarda una reunión nueva y la devuelve como quedó guardada (con su id).
   * @param {{ central, lugar, fecha: 'aaaa-mm-dd', asistentes: number, isagen: boolean, objetivo }} reunion
   */
  async guardarReunion(reunion) { // eslint-disable-line no-unused-vars
    throw new Error(`${this.constructor.name} debe implementar guardarReunion()`);
  }

  /** Cambia una reunión registrada en la app y la devuelve como quedó. */
  async actualizarReunion(id, cambios) { // eslint-disable-line no-unused-vars
    throw new Error(`${this.constructor.name} debe implementar actualizarReunion()`);
  }

  /** Borra una reunión registrada en la app. */
  async borrarReunion(id) { // eslint-disable-line no-unused-vars
    throw new Error(`${this.constructor.name} debe implementar borrarReunion()`);
  }

  /**
   * Avisa cuando otra persona cambia algo. Devuelve la función para dejar de escuchar.
   * Por defecto no avisa nada (ej. en modo local no hay otras personas).
   * Solo se escucha lo que se pida: cada oyente es opcional.
   * @param {{ alCambiarCampo?, alCrearMes?, alCrearReunion?, alCambiarReunion?, alBorrarReunion? }} oyentes
   */
  escuchar(oyentes) { // eslint-disable-line no-unused-vars
    return () => {};
  }

  /** Inserta un valor en la estructura de registros, creando los niveles que falten. */
  static agregar(registros, { mes, rowId, col, valor, origen, autor, fecha }) {
    registros[mes] ??= {};
    registros[mes][rowId] ??= {};
    registros[mes][rowId][col] = { v: valor ?? '', src: origen, ...(autor && { autor }), ...(fecha && { fecha }) };
    return registros;
  }
}
