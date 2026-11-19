import { DATOS, SECCIONES } from '../../config/esquemaExcel';
import CampoEditable from './CampoEditable';
import GrupoActividades from './GrupoActividades';

/**
 * Todos los campos de una organización en un mes, agrupados por sección y subgrupo,
 * en el mismo orden que el Excel. Cada sección muestra cuántos campos tienen dato.
 */
export default function FichaOrganizacion({ mes, organizacion, onEditar }) {
  const campos = lista => lista.map(([col, etiqueta, ayuda]) => (
    <CampoEditable
      key={col}
      columna={col}
      etiqueta={etiqueta}
      ayuda={ayuda}
      mes={mes}
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
        <summary><span>Datos generales de la organización</span></summary>
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
            <div className="seccion__grupos">
              {s.grupos.map((g, i) => (
                g.nombre ? (
                  <fieldset className="grupo" key={i}>
                    <legend className="grupo__titulo">{g.nombre}</legend>
                    {g.repetible ? (
                      // key con mes y organización: al cambiar de ficha se cierran las fechas abiertas
                      <GrupoActividades
                        key={`${mes.clave}-${organizacion.id}`}
                        grupo={g}
                        mes={mes}
                        organizacion={organizacion}
                        onEditar={onEditar}
                      />
                    ) : (
                      <div className="seccion__cuerpo">{campos(g.campos)}</div>
                    )}
                  </fieldset>
                ) : (
                  <div className="seccion__cuerpo" key={i}>{campos(g.campos)}</div>
                )
              ))}
            </div>
          </details>
        );
      })}
    </>
  );
}
