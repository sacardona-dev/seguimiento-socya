import { useId, useState } from 'react';
import { authService } from '../services';
import Aviso from '../components/ui/Aviso';
import Boton from '../components/ui/Boton';
import CampoContrasena from '../components/ui/CampoContrasena';

/** Inicio de sesión. Desde aquí también se pide el enlace para recuperar la contraseña. */
export default function Login() {
  const [modo, setModo] = useState('entrar'); // 'entrar' | 'recuperar'
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const idCorreo = useId();
  const idClave = useId();

  function cambiarModo(nuevo) {
    setModo(nuevo);
    setError('');
    setEnviado(false);
  }

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      if (modo === 'entrar') {
        await authService.iniciarSesion(correo, clave);
        return; // al entrar, la app cambia de pantalla sola
      }
      await authService.enviarRecuperacion(correo);
      setEnviado(true);
    } catch (err) {
      setError(err.message);
    }
    setEnviando(false);
  }

  const recuperar = modo === 'recuperar';

  return (
    <main className="login">
      <div className="tarjeta login__caja">
        <h1>{recuperar ? 'Recuperar contraseña' : 'Seguimiento mensual'}</h1>
        <p className="texto-suave">
          {recuperar
            ? 'Escribe tu correo y te enviamos un enlace para crear una contraseña nueva.'
            : 'Ingresa con el correo y la contraseña que te asignaron.'}
        </p>

        <form onSubmit={enviar} className="login__formulario">
          <div className="campo">
            <label htmlFor={idCorreo}>Correo</label>
            <input id={idCorreo} type="email" autoComplete="email" placeholder="nombre@socya.org.co" value={correo} onChange={e => setCorreo(e.target.value)} required />
          </div>

          {!recuperar && (
            <div className="campo">
              <label htmlFor={idClave}>Contraseña</label>
              <CampoContrasena id={idClave} value={clave} onChange={e => setClave(e.target.value)} required />
            </div>
          )}

          {error && <Aviso tipo="error">{error}</Aviso>}
          {enviado && (
            <Aviso tipo="exito">
              Si {correo} tiene usuario, te llegará un correo en unos minutos. Revisa también la carpeta de spam.
            </Aviso>
          )}

          <Boton variante="primario" type="submit" disabled={enviando}>
            {recuperar ? (enviando ? 'Enviando…' : 'Enviar enlace') : (enviando ? 'Entrando…' : 'Entrar')}
          </Boton>
        </form>

        <Boton variante="texto" className="login__enlace" onClick={() => cambiarModo(recuperar ? 'entrar' : 'recuperar')}>
          {recuperar ? 'Volver a iniciar sesión' : '¿Olvidaste tu contraseña?'}
        </Boton>
      </div>
    </main>
  );
}
