import { useEffect, useState } from 'react';
import { authService } from '../services';

/** Estado de la sesión: cargando, con sesión o sin sesión. */
export function useSesion() {
  const [sesion, setSesion] = useState(undefined);

  useEffect(() => {
    authService.obtenerSesion().then(setSesion);
    return authService.escucharCambios(setSesion);
  }, []);

  return {
    cargando: sesion === undefined,
    autenticado: Boolean(sesion),
  };
}
