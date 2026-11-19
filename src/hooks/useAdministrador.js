import { useEffect, useState } from 'react';
import { repositorio } from '../services';

/** true si la persona con sesión es administradora (puede ver el historial de cambios). */
export function useAdministrador() {
  const [esAdministrador, setEsAdministrador] = useState(false);

  useEffect(() => {
    let vigente = true;
    repositorio.esAdministrador().then(si => { if (vigente) setEsAdministrador(si); }).catch(() => {});
    return () => { vigente = false; };
  }, []);

  return esAdministrador;
}
