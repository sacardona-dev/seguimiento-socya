import { DATOS, SECCIONES } from '../../config/esquemaExcel';
import CampoEditable from './CampoEditable';

/**
 * Todos los campos de una organización en un mes, agrupados por sección.
 * Cada sección muestra cuántos campos tienen dato, para saber qué falta sin abrirla.
 */
export default function FichaOrganizacion({ mes, organizacion, onEditar }) {
  const campos = lista => lista.map(([col, etiqueta]) => (
    <CampoEditable
      key={col}
      columna={col}
      etiqueta={etiqueta}
      valor={organizacion.valor(col)}
      origen={organizacion.origen(col)}
      ultimoCambio={organizacion.ultimoCambio(col)}
      onGuardar={v => onEditar(col, v)}
    />
  ));

  return (
    <>
      <section className="tarjeta ficha__resumen">
        <h2>{organizacion.nombre}</h2>
        <p className="texto-suave">
          {mes.label} · {organizacion.central} · {organizacion.municipio} · Vigencia {organizacion.vigencia}
        </p>
      </section>

      <details className="seccion">
        <summary>Datos generales de la organización</summary>
        <div className="seccion__cuerpo">{campos(DATOS)}</div>
      </details>

      {SECCIONES.map(s => {
        const avance = organizacion.avanceSeccion(s);
        return (
          <details className="seccion" key={s.id} open={avance.llenos > 0}>
            <summary>
              <span>{s.nombre}</span>
              <span className={`etiqueta ${avance.llenos === avance.total ? 'etiqueta--exito' : ''}`}>
                {avance.llenos} de {avance.total}
              </span>
            </summary>
            <div className="seccion__cuerpo">{campos(s.campos)}</div>
          </details>
        );
      })}
    </>
  );
}
