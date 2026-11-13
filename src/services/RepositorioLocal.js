import { RepositorioRegistros } from './RepositorioRegistros';

/** Guarda en el navegador (localStorage). Solo sirve para probar en un computador. */
export class RepositorioLocal extends RepositorioRegistros {
  #clave;
  #claveMeses;
  #claveReuniones;

  constructor(clave = 'seguimiento_socya_v1') {
    super();
    this.#clave = clave;
    this.#claveMeses = `${clave}_meses`;
    this.#claveReuniones = `${clave}_reuniones`;
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

  async cargarReuniones() {
    return this.#leer(this.#claveReuniones, []);
  }

  async guardarReunion(reunion) {
    const guardada = { ...reunion, id: `local-${Date.now()}` };
    localStorage.setItem(this.#claveReuniones, JSON.stringify([...this.#leer(this.#claveReuniones, []), guardada]));
    return guardada;
  }

  async actualizarReunion(id, cambios) {
    const reuniones = this.#leer(this.#claveReuniones, []).map(r => (r.id === id ? { ...r, ...cambios } : r));
    localStorage.setItem(this.#claveReuniones, JSON.stringify(reuniones));
    return reuniones.find(r => r.id === id);
  }

  async borrarReunion(id) {
    localStorage.setItem(this.#claveReuniones, JSON.stringify(this.#leer(this.#claveReuniones, []).filter(r => r.id !== id)));
  }

  #leer(clave, vacio) {
    try {
      return JSON.parse(localStorage.getItem(clave) || 'null') ?? vacio;
    } catch {
      return vacio;
    }
  }
}
