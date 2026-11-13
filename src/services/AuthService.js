/**
 * Inicio y cierre de sesión con Supabase Auth, y recuperación de contraseña por correo.
 * Sin Supabase (modo local) no pide login y devuelve una sesión local.
 */
export class AuthService {
  static SESION_LOCAL = Object.freeze({ local: true });
  #cliente;

  #vieneDeRecuperacion;

  /**
   * @param {object|null} cliente  cliente de Supabase (null = modo local)
   * @param {boolean} vieneDeRecuperacion  true si la página se abrió desde el enlace de "olvidé mi contraseña"
   */
  constructor(cliente, vieneDeRecuperacion = false) {
    this.#cliente = cliente;
    this.#vieneDeRecuperacion = vieneDeRecuperacion;
  }

  get vieneDeRecuperacion() {
    return this.#vieneDeRecuperacion;
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

  /**
   * Avisa cada vez que alguien entra o sale. Devuelve la función para dejar de escuchar.
   * @param {(sesion: object|null, evento: string) => void} alCambiar  evento 'PASSWORD_RECOVERY' = llegó del enlace del correo
   */
  escucharCambios(alCambiar) {
    if (!this.#cliente) return () => {};
    const { data } = this.#cliente.auth.onAuthStateChange((evento, sesion) => alCambiar(sesion ?? null, evento));
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

  /** Envía al correo un enlace para crear una contraseña nueva. El enlace vuelve a esta misma app. */
  async enviarRecuperacion(correo) {
    const { error } = await this.#cliente.auth.resetPasswordForEmail(correo, { redirectTo: window.location.origin });
    if (error) {
      console.error('Error al enviar recuperación:', error);
      throw new Error(AuthService.#mensajeDeError(error));
    }
  }

  /** Cambia la contraseña de quien tiene la sesión (después de abrir el enlace del correo). */
  async cambiarContrasena(nueva) {
    const { error } = await this.#cliente.auth.updateUser({ password: nueva });
    if (error) {
      console.error('Error al cambiar contraseña:', error);
      throw new Error(AuthService.#mensajeDeError(error));
    }
    this.#vieneDeRecuperacion = false;
  }

  /** Traduce el error de Supabase a un mensaje claro, sin ocultar la causa real. */
  static #mensajeDeError(error) {
    const texto = `${error.code ?? ''} ${error.message ?? ''}`.toLowerCase();
    if (texto.includes('invalid_credentials') || texto.includes('invalid login')) return 'Correo o contraseña incorrectos.';
    if (texto.includes('email_not_confirmed') || texto.includes('not confirmed')) return 'Tu correo aún no está confirmado. Pide que confirmen tu usuario en Supabase.';
    if (texto.includes('api key')) return 'La app no está bien conectada a Supabase (clave inválida). Revisa el archivo .env.';
    if (texto.includes('rate limit') || texto.includes('over_email_send_rate')) return 'Se enviaron muchos correos en poco tiempo. Espera unos minutos e intenta de nuevo.';
    if (texto.includes('same_password') || texto.includes('different from the old')) return 'La contraseña nueva debe ser distinta a la anterior.';
    if (texto.includes('weak_password')) return 'La contraseña es muy débil. Usa mínimo 8 caracteres con mayúsculas y números.';
    if (texto.includes('fetch') || texto.includes('network')) return 'No pudimos conectar con el servidor. Revisa tu conexión a internet.';
    return `Algo falló: ${error.message}`;
  }

  async cerrarSesion() {
    if (this.#cliente) await this.#cliente.auth.signOut();
  }
}
