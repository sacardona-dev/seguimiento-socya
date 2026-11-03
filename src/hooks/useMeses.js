import { useMemo } from 'react';
import datos from '../data/meses.json';
import { Mes } from '../domain/Mes';

export const REUNIONES = datos.reuniones;

/** Convierte las hojas del Excel en objetos Mes, con los cambios del equipo aplicados. */
export function useMeses(registros) {
  return useMemo(() => datos.meses.map(d => new Mes(d, registros[d.mm])), [registros]);
}
