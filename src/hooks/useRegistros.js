import { useCallback, useEffect, useRef, useState } from 'react';
import { repositorio } from '../services';

/**
 * Cambios del equipo en memoria + guardado.
 * La pantalla se actualiza al instante y el guardado ocurre por detrás;
 * `estadoGuardado` cuenta si va bien ('guardando' | 'guardado' | 'error').
 * Los cambios de otras personas llegan en vivo, sin recargar la página.
 */
export function useRegistros() {
  const [registros, setRegistros] = useState({});
  const [mesesRecibidos, setMesesRecibidos] = useState([]);
  const [estadoGuardado, setEstadoGuardado] = useState('inactivo');
  const [errorCarga, setErrorCarga] = useState('');
  const pendientes = useRef(0);

  const aplicar = useCallback(cambio => {
    setRegistros(prev => aplicarCambio(prev, cambio));
  }, []);

  useEffect(() => {
    repositorio.cargarTodo()
      .then(setRegistros)
      .catch(() => setErrorCarga('No pudimos cargar los datos del equipo. Revisa la conexión y recarga la página.'));

    return repositorio.escuchar({
      alCambiarCampo: aplicar,
      alCrearMes: mes => setMesesRecibidos(prev => [...prev, mes]),
    });
  }, [aplicar]);

  const editar = useCallback(async (mes, rowId, col, valor, origen = 'manual') => {
    aplicar({ mes, rowId, col, valor, origen });

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
  }, [aplicar]);

  return { registros, mesesRecibidos, editar, estadoGuardado, errorCarga, compartido: repositorio.esCompartido };
}

/** Aplica un cambio sin modificar el objeto original (React necesita objetos nuevos para redibujar). */
function aplicarCambio(registros, { mes, rowId, col, valor, origen, autor, fecha }) {
  return {
    ...registros,
    [mes]: {
      ...registros[mes],
      [rowId]: { ...registros[mes]?.[rowId], [col]: { v: valor ?? '', src: origen, ...(autor && { autor }), ...(fecha && { fecha }) } },
    },
  };
}
