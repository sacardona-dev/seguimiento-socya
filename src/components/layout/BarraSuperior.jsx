import { useEffect, useState } from 'react';
import { authService } from '../../services';
import { IconoSalir } from '../ui/Iconos';

/**
 * Barra de navegación fija arriba, de lado a lado: nombre de la app, con qué usuario
 * se inició sesión y el botón para cerrar sesión.
 */
export default function BarraSuperior({ modoLocal }) {
  const [correo, setCorreo] = useState('');

  useEffect(() => {
    authService.obtenerSesion().then(s => setCorreo(s?.user?.email ?? ''));
  }, []);

  return (
    <nav className="barra-superior" aria-label="Barra principal">
      <div className="barra-superior__contenido">
        <span className="barra-superior__titulo">Seguimiento mensual</span>

        <div className="barra-superior__usuario">
          {modoLocal && <span className="etiqueta etiqueta--alerta">Modo local: solo este navegador</span>}
          {correo && <span className="barra-superior__correo" title="Sesión iniciada como">{correo}</span>}
          {authService.requiereLogin && (
            <button type="button" className="barra-superior__salir" onClick={() => authService.cerrarSesion()}>
              <IconoSalir /> Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
