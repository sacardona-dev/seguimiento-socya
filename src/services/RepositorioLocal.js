import { RepositorioRegistros } from './RepositorioRegistros';

/** Guarda en el navegador (localStorage). Solo sirve para probar en un computador. */
export class RepositorioLocal extends RepositorioRegistros {
  #clave;
  #claveMeses;

  constructor(clave = 'seguimiento_socya_v1') {
    super();
    this.#clave = clave;
    this.#claveMeses = `${clave}_meses`;
  }

  async cargarTodo() {
    return this.#leer(this.#clave, {});
  }

  async guardarCampo(cambio) {
    const registros = RepositorioRegistros.agregar(this.#leer(this.#clave, {}), cambio);
    localStorage.setItem(this.#clave, JSON.stringify(registros));
  }

  async cargarMeses() {
    return this.#leer(this.#claveMeses, []);
  }

  async guardarMes(mes) {
    const meses = this.#leer(this.#claveMeses, []);
    if (meses.some(m => m.clave === mes.clave)) throw new Error(`El mes ${mes.label} ya existe.`);
    localStorage.setItem(this.#claveMeses, JSON.stringify([...meses, mes]));
  }

  #leer(clave, vacio) {
    try {
      return JSON.parse(localStorage.getItem(clave) || 'null') ?? vacio;
    } catch {
      return vacio;
    }
  }
}
