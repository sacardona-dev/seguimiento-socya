import { useCallback, useEffect, useMemo, useState } from 'react';
import datos from '../data/meses.json';
import { CorrectorOrtografia } from '../domain/CorrectorOrtografia';
import { Reunion } from '../domain/Reunion';
import { authService, repositorio } from '../services';

// La hoja de reuniones trae filas de totales con fórmulas del Excel (ej. "=COUNTA(B3:B20)"): no son reuniones
const esReunion = r => !Object.values(r).some(v => typeof v === 'string' && v.trim().startsWith('='));
const REUNIONES_EXCEL = datos.reuniones.filter(esReunion).map(CorrectorOrtografia.corregirReunion).map(Reunion.desdeExcel);

/** Datos del formulario (ya validados) → fila de la tabla `reuniones`. */
const aFila = ({ central, lugar, fecha, asistentes, isagen, objetivo }) => ({
  central: central.trim(), lugar: lugar.trim(), fecha,
  asistentes: Number(asistentes), isagen: isagen === 'si', objetivo: objetivo.trim(),
});

/**
 * Reuniones de equipo: las del Excel original + las registradas desde la app,
 * de la más reciente a la más antigua. Lo que registren, editen o borren otras personas llega en vivo.
 * `usuarioId` sirve para saber qué reuniones puede editar quien usa la app (null en modo local).
 */
export function useReuniones() {
  const [filasApp, setFilasApp] = useState([]);
  const [errorReuniones, setErrorReuniones] = useState('');
  const [usuarioId, setUsuarioId] = useState(null);

  const sumar = useCallback(fila => {
    setFilasApp(prev => (prev.some(f => f.id === fila.id) ? prev : [...prev, fila]));
  }, []);
  const reemplazar = useCallback(fila => {
    setFilasApp(prev => prev.map(f => (f.id === fila.id ? fila : f)));
  }, []);
  const quitar = useCallback(id => {
    setFilasApp(prev => prev.filter(f => f.id !== id));
  }, []);

  useEffect(() => {
    authService.obtenerSesion().then(s => setUsuarioId(s?.user?.id ?? null));
    repositorio.cargarReuniones()
      .then(setFilasApp)
      .catch(() => setErrorReuniones('No pudimos cargar las reuniones registradas en la app. Si es la primera vez, falta correr supabase/schema.sql en Supabase.'));
    return repositorio.escuchar({ alCrearReunion: sumar, alCambiarReunion: reemplazar, alBorrarReunion: quitar });
  }, [sumar, reemplazar, quitar]);

  const reuniones = useMemo(
    () => [...REUNIONES_EXCEL, ...filasApp.map(Reunion.desdeTabla)].sort((a, b) => b.orden - a.orden),
    [filasApp],
  );

  /** Guarda una reunión nueva (datos del formulario ya validados). */
  const agregarReunion = useCallback(async datosFormulario => {
    const guardada = await repositorio.guardarReunion(aFila(datosFormulario));
    sumar(guardada);
    return Reunion.desdeTabla(guardada);
  }, [sumar]);

  /** Cambia una reunión registrada en la app (solo la de quien la registró). */
  const editarReunion = useCallback(async (id, datosFormulario) => {
    const guardada = await repositorio.actualizarReunion(id, aFila(datosFormulario));
    reemplazar(guardada);
    return Reunion.desdeTabla(guardada);
  }, [reemplazar]);

  const borrarReunion = useCallback(async id => {
    await repositorio.borrarReunion(id);
    quitar(id);
  }, [quitar]);

  return { reuniones, agregarReunion, editarReunion, borrarReunion, usuarioId, errorReuniones };
}
