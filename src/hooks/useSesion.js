import { useEffect, useState } from 'react';
import { authService } from '../services';

/**
 * Estado de la sesión: cargando, con sesión o sin sesión.
 * `recuperando` = la persona llegó desde el enlace de "olvidé mi contraseña" y debe crear una nueva.
 */
export function useSesion() {
  const [sesion, setSesion] = useState(undefined);
  const [recuperando, setRecuperando] = useState(authService.vieneDeRecuperacion);

  useEffect(() => {
    authService.obtenerSesion().then(setSesion);
    return authService.escucharCambios((nueva, evento) => {
      setSesion(nueva);
      if (evento === 'PASSWORD_RECOVERY') setRecuperando(true);
      if (evento === 'SIGNED_OUT') setRecuperando(false);
    });
  }, []);

  return {
    cargando: sesion === undefined,
    autenticado: Boolean(sesion),
    recuperando,
    terminarRecuperacion: () => setRecuperando(false),
  };
}
