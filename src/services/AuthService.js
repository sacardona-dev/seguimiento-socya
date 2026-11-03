/**
 * Inicio y cierre de sesión con Supabase Auth.
 * Sin Supabase (modo local) no pide login y devuelve una sesión local.
 */
export class AuthService {
  static SESION_LOCAL = Object.freeze({ local: true });
  #cliente;

  constructor(cliente) {
    this.#cliente = cliente;
  }

  get requiereLogin() {
    return Boolean(this.#cliente);
  }

  /** @returns {Promise<object|null>} la sesión activa o null si no hay */
  async obtenerSesion() {
    if (!this.#cliente) return AuthService.SESION_LOCAL;
    const { data } = await this.#cliente.auth.getSession();
    return data.session ?? null;
  }

  /** Avisa cada vez que alguien entra o sale. Devuelve la función para dejar de escuchar. */
  escucharCambios(alCambiar) {
    if (!this.#cliente) return () => {};
    const { data } = this.#cliente.auth.onAuthStateChange((_evento, sesion) => alCambiar(sesion ?? null));
    return () => data.subscription.unsubscribe();
  }

  async iniciarSesion(correo, clave) {
    let error;
    try {
      ({ error } = await this.#cliente.auth.signInWithPassword({ email: correo, password: clave }));
    } catch (e) {
      error = e;
    }
    if (error) {
      console.error('Error de inicio de sesión:', error); // detalle técnico para revisar en F12 > Consola
      throw new Error(AuthService.#mensajeDeError(error));
    }
  }

  /** Traduce el error de Supabase a un mensaje claro, sin ocultar la causa real. */
  static #mensajeDeError(error) {
    const texto = `${error.code ?? ''} ${error.message ?? ''}`.toLowerCase();
    if (texto.includes('invalid_credentials') || texto.includes('invalid login')) return 'Correo o contraseña incorrectos.';
    if (texto.includes('email_not_confirmed') || texto.includes('not confirmed')) return 'Tu correo aún no está confirmado. Pide que confirmen tu usuario en Supabase.';
    if (texto.includes('api key')) return 'La app no está bien conectada a Supabase (clave inválida). Revisa el archivo .env.';
    if (texto.includes('fetch') || texto.includes('network')) return 'No pudimos conectar con el servidor. Revisa tu conexión a internet.';
    return `No pudimos iniciar sesión: ${error.message}`;
  }

  async cerrarSesion() {
    if (this.#cliente) await this.#cliente.auth.signOut();
  }
}
