import { useEffect, useState } from 'react';
import { CambioHistorial } from '../domain/CambioHistorial';
import { repositorio } from '../services';

const LIMITE = 2000;

/**
 * Cambios del historial entre dos días (aaaa-mm-dd). Vuelve a pedirlos al cambiar las fechas.
 * `recortado` = hay más cambios de los que se trajeron (conviene acortar el rango de fechas).
 */
export function useHistorial(desde, hasta, meses) {
  const [estado, setEstado] = useState({ cambios: [], cargando: true, error: '', recortado: false });

  useEffect(() => {
    if (!desde || !hasta) return;
    let vigente = true;
    setEstado(e => ({ ...e, cargando: true, error: '' }));
    repositorio.cargarHistorial({ desde, hasta, limite: LIMITE })
      .then(filas => {
        if (!vigente) return;
        setEstado({ cambios: filas.map(f => new CambioHistorial(f, meses)), cargando: false, error: '', recortado: filas.length >= LIMITE });
      })
      .catch(() => {
        if (vigente) setEstado({ cambios: [], cargando: false, error: 'No pudimos cargar el historial. Revisa la conexión e intenta de nuevo.', recortado: false });
      });
    return () => { vigente = false; };
  }, [desde, hasta, meses]);

  return estado;
}
