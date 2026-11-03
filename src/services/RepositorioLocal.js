import { RepositorioRegistros } from './RepositorioRegistros';

/** Guarda en el navegador (localStorage). Solo sirve para probar en un computador. */
export class RepositorioLocal extends RepositorioRegistros {
  #clave;

  constructor(clave = 'seguimiento_socya_v1') {
    super();
    this.#clave = clave;
  }

  async cargarTodo() {
    return this.#leer();
  }

  async guardarCampo(cambio) {
    const registros = RepositorioRegistros.agregar(this.#leer(), cambio);
    localStorage.setItem(this.#clave, JSON.stringify(registros));
  }

  #leer() {
    try {
      return JSON.parse(localStorage.getItem(this.#clave) || '{}');
    } catch {
      return {};
    }
  }
}
