import { etiquetaDeColumna } from '../config/esquemaExcel';
import { estaVacio, normalizar } from '../utils/texto';

/**
 * Un cambio del historial, listo para mostrar: quién, cuándo, qué hizo, dónde y los valores.
 * Traduce lo técnico (mes '10', fila 9, columna 'Z_2') a lo que entiende la persona
 * (Octubre 2026, JAC Vereda Cruces, "3. Capacitación… · Fecha (fecha 2)").
 */
export class CambioHistorial {
  /**
   * @param {object} fila  fila de la tabla `historial`
   * @param {import('./Mes').Mes[]} meses  para poner nombre al mes y a la organización
   */
  constructor(fila, meses) {
    const mes = meses.find(m => m.clave === fila.mes);
    const organizacion = mes && fila.row_id != null ? mes.buscarPorId(fila.row_id) : null;

    this.id = fila.id;
    this.fecha = new Date(fila.fecha);
    this.persona = fila.correo || 'Desconocido';
    this.mes = mes?.label ?? fila.mes ?? '';
    this.esMes = fila.tabla === 'meses';
    this.organizacion = this.esMes ? '—' : (organizacion?.nombre ?? `Fila ${fila.row_id}`);
    this.campo = this.esMes ? 'Mes' : etiquetaDeColumna(fila.col);

    // El primer cambio de un campo no trae "antes" en la base de datos: era el valor del Excel
    const antesDelExcel = fila.operacion === 'INSERT' && organizacion ? organizacion.valorOriginal(fila.col) : '';
    this.antes = fila.valor_antes ?? antesDelExcel ?? '';
    this.despues = fila.valor_despues ?? '';
    this.accion = CambioHistorial.#accion(fila.operacion, this.antes, this.despues, this.esMes);
  }

  /** ¿Contiene el texto buscado (sin importar tildes ni mayúsculas)? */
  coincide(texto) {
    const buscado = normalizar(texto);
    if (!buscado) return true;
    return [this.persona, this.organizacion, this.campo, this.mes, this.antes, this.despues, this.accion]
      .some(v => normalizar(v).includes(buscado));
  }

  static #accion(operacion, antes, despues, esMes) {
    if (esMes) return operacion === 'DELETE' ? 'Borró un mes' : 'Agregó un mes';
    if (operacion === 'DELETE' || estaVacio(despues)) return 'Borró';
    if (estaVacio(antes)) return 'Llenó';
    return 'Cambió';
  }
}
