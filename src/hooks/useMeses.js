import { useCallback, useEffect, useMemo, useState } from 'react';
import datos from '../data/meses.json';
import { CorrectorOrtografia } from '../domain/CorrectorOrtografia';
import { Mes } from '../domain/Mes';
import { repositorio } from '../services';

// La hoja de reuniones trae filas de totales con fórmulas del Excel (ej. "=COUNTA(B3:B20)"): no son reuniones
const esReunion = r => !Object.values(r).some(v => typeof v === 'string' && v.trim().startsWith('='));
export const REUNIONES = datos.reuniones.filter(esReunion).map(CorrectorOrtografia.corregirReunion);

const MESES_EXCEL = datos.meses.map(Mes.desdeHojaExcel);

/**
 * Todos los meses: los del Excel original + los abiertos desde la app, en orden,
 * con los cambios del equipo aplicados. También sabe abrir el mes siguiente.
 * @param {object} registros   cambios del equipo
 * @param {object[]} mesesRecibidos  meses que otra persona acaba de abrir (llegan en vivo)
 */
export function useMeses(registros, mesesRecibidos) {
  const [mesesCreados, setMesesCreados] = useState([]);
  const [errorMeses, setErrorMeses] = useState('');

  useEffect(() => {
    repositorio.cargarMeses()
      .then(setMesesCreados)
      .catch(() => setErrorMeses('No pudimos cargar los meses nuevos. Si es la primera vez, falta correr supabase/schema.sql en Supabase.'));
  }, []);

  const meses = useMemo(() => {
    const porClave = new Map();
    [...MESES_EXCEL, ...mesesCreados, ...mesesRecibidos].forEach(d => porClave.set(d.clave, d));
    return [...porClave.values()]
      .map(d => new Mes(d, registros[d.clave]))
      .sort((a, b) => a.orden - b.orden);
  }, [registros, mesesCreados, mesesRecibidos]);

  const ultimo = meses.at(-1);
  const siguiente = ultimo.datosMesSiguiente();
  const hoy = new Date();
  // Solo se puede abrir el mes siguiente si ya empezó (evita abrir meses futuros por error)
  const puedeAbrirSiguiente = siguiente.anio * 12 + siguiente.numero <= hoy.getFullYear() * 12 + hoy.getMonth() + 1;

  const abrirMesSiguiente = useCallback(async () => {
    await repositorio.guardarMes(siguiente);
    setMesesCreados(prev => [...prev, siguiente]);
    return siguiente;
  }, [siguiente]);

  return {
    meses,
    errorMeses,
    mesSiguiente: puedeAbrirSiguiente ? { label: siguiente.label, desde: ultimo.label } : null,
    abrirMesSiguiente,
  };
}
