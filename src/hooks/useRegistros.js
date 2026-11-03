import { useCallback, useEffect, useRef, useState } from 'react';
import { repositorio } from '../services';

/**
 * Cambios del equipo en memoria + guardado.
 * La pantalla se actualiza al instante y el guardado ocurre por detrás;
 * `estadoGuardado` cuenta si va bien ('guardando' | 'guardado' | 'error').
 */
export function useRegistros() {
  const [registros, setRegistros] = useState({});
  const [estadoGuardado, setEstadoGuardado] = useState('inactivo');
  const [errorCarga, setErrorCarga] = useState('');
  const pendientes = useRef(0);

  useEffect(() => {
    repositorio.cargarTodo()
      .then(setRegistros)
      .catch(() => setErrorCarga('No pudimos cargar los datos del equipo. Revisa la conexión y recarga la página.'));
  }, []);

  const editar = useCallback(async (mes, rowId, col, valor, origen = 'manual') => {
    setRegistros(prev => ({
      ...prev,
      [mes]: { ...prev[mes], [rowId]: { ...prev[mes]?.[rowId], [col]: { v: valor, src: origen } } },
    }));

    pendientes.current += 1;
    setEstadoGuardado('guardando');
    try {
      await repositorio.guardarCampo({ mes, rowId, col, valor, origen });
      pendientes.current -= 1;
      if (pendientes.current === 0) setEstadoGuardado('guardado');
    } catch {
      pendientes.current -= 1;
      setEstadoGuardado('error');
    }
  }, []);

  return { registros, editar, estadoGuardado, errorCarga, compartido: repositorio.esCompartido };
}
