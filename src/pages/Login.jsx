import { useId, useState } from 'react';
import { authService } from '../services';
import Aviso from '../components/ui/Aviso';
import Boton from '../components/ui/Boton';
import CampoContrasena from '../components/ui/CampoContrasena';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const idCorreo = useId();
  const idClave = useId();

  async function entrar(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await authService.iniciarSesion(correo, clave);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <main className="login">
      <div className="tarjeta login__caja">
        <h1>Seguimiento mensual</h1>
        <p className="texto-suave">Ingresa con el correo y la contraseña que te asignaron.</p>

        <form onSubmit={entrar} className="login__formulario">
          <div className="campo">
            <label htmlFor={idCorreo}>Correo</label>
            <input id={idCorreo} type="email" autoComplete="email" placeholder="nombre@socya.org.co" value={correo} onChange={e => setCorreo(e.target.value)} required />
          </div>
          <div className="campo">
            <label htmlFor={idClave}>Contraseña</label>
            <CampoContrasena id={idClave} value={clave} onChange={e => setClave(e.target.value)} required />
          </div>
          {error && <Aviso tipo="error">{error}</Aviso>}
          <Boton variante="primario" type="submit" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</Boton>
        </form>
      </div>
    </main>
  );
}
