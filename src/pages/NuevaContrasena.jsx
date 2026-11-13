import { useId, useState } from 'react';
import { authService } from '../services';
import { revisarContrasena } from '../utils/contrasena';
import Aviso from '../components/ui/Aviso';
import Boton from '../components/ui/Boton';
import CampoContrasena from '../components/ui/CampoContrasena';

/**
 * Pantalla a la que llega la persona desde el enlace del correo de recuperación.
 * Muestra las reglas de la contraseña mientras escribe y no deja enviar hasta que se cumplan.
 */
export default function NuevaContrasena({ onListo }) {
  const [clave, setClave] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [intento, setIntento] = useState(false);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const idClave = useId();
  const idConfirmacion = useId();
  const idReglas = useId();

  const reglas = revisarContrasena(clave);
  const coinciden = clave === confirmacion;
  const valida = reglas.every(r => r.cumple) && coinciden;

  async function guardar(e) {
    e.preventDefault();
    setIntento(true);
    if (!valida) return;
    setGuardando(true);
    setError('');
    try {
      await authService.cambiarContrasena(clave);
      onListo();
    } catch (err) {
      setError(err.message);
      setGuardando(false);
    }
  }

  return (
    <main className="login">
      <div className="tarjeta login__caja">
        <h1>Crea tu contraseña nueva</h1>
        <p className="texto-suave">Después de guardarla entras directo a la app.</p>

        <form onSubmit={guardar} className="login__formulario" noValidate>
          <div className="campo">
            <label htmlFor={idClave}>Contraseña nueva</label>
            <CampoContrasena id={idClave} autoComplete="new-password" aria-describedby={idReglas} value={clave} onChange={e => setClave(e.target.value)} />
            <ul className="reglas" id={idReglas}>
              {reglas.map(r => (
                <li key={r.mensaje} className={r.cumple ? 'reglas__item--ok' : intento ? 'reglas__item--error' : ''}>
                  {r.cumple ? '✓' : '•'} {r.mensaje}
                </li>
              ))}
            </ul>
          </div>

          <div className="campo">
            <label htmlFor={idConfirmacion}>Repite la contraseña</label>
            <CampoContrasena id={idConfirmacion} autoComplete="new-password" value={confirmacion} onChange={e => setConfirmacion(e.target.value)} />
            {intento && !coinciden && <small className="campo__nota campo__nota--error">Las dos contraseñas no coinciden.</small>}
          </div>

          {error && <Aviso tipo="error">{error}</Aviso>}
          <Boton variante="primario" type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar contraseña'}</Boton>
        </form>
      </div>
    </main>
  );
}
