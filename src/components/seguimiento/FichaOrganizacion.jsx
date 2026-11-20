import { Fragment, useState } from 'react';
import { COLUMNAS_POR_FECHA, DATOS, MAX_ACTIVIDADES, SECCIONES } from '../../config/esquemaExcel';
import { Organizacion } from '../../domain/Organizacion';
import { columnaActividad } from '../../utils/columnas';
import { estaVacio } from '../../utils/texto';
import CampoEditable from './CampoEditable';
import FechasDelMes from './FechasDelMes';

const NUMEROS_FECHA = Array.from({ length: MAX_ACTIVIDADES }, (_, i) => i + 1);

/**
 * Todos los campos de una organización en un mes, en el mismo orden que el Excel.
 * Arriba, las fechas (visitas) del mes como pestañas. Cada fecha tiene su propia información:
 * al elegir una, los campos de abajo son los de ese día. Proyecto, ICO y observaciones son de la
 * organización y se ven iguales en todas las fechas. Cada sección muestra cuántos campos tienen dato.
 * Panel le pone key con mes y organización: al cambiar de ficha todo vuelve a empezar.
 */
export default function FichaOrganizacion({ mes, organizacion, onEditar }) {
  const [nuevas, setNuevas] = useState([]); // fechas agregadas que todavía no tienen datos
  const enUso = organizacion.fechasDelMes();
  const fechas = [...enUso, ...nuevas.filter(n => !enUso.includes(n))];
  const [elegidaGuardada, setElegida] = useState(() => fechas[0]);
  const elegida = fechas.includes(elegidaGuardada) ? elegidaGuardada : fechas[0];
  const libre = NUMEROS_FECHA.find(n => !fechas.includes(n));

  function agregar() {
    setNuevas(prev => [...prev, libre]);
    setElegida(libre);
  }

  /** Quitar = dejar en blanco todo lo de esa fecha (así queda también en el historial). */
  function quitar(n) {
    COLUMNAS_POR_FECHA.forEach(c => {
      const col = columnaActividad(c, n);
      if (!estaVacio(organizacion.valor(col))) onEditar(col, '');
    });
    setNuevas(prev => prev.filter(x => x !== n));
    setElegida(fechas.find(x => x !== n));
  }

  /** Campos de un grupo, con el valor de la fecha elegida (o el de la organización si es común). */
  const campos = lista => lista.map(([c, etiqueta, ayuda]) => {
    const col = Organizacion.columnaEnFecha(c, elegida);
    return (
      <CampoEditable
        key={col}
        columna={c}
        etiqueta={etiqueta}
        ayuda={ayuda}
        mes={mes}
        valor={organizacion.valor(col)}
        origen={organizacion.origen(col)}
        ultimoCambio={organizacion.ultimoCambio(col)}
        onGuardar={v => onEditar(col, v)}
      />
    );
  });

  const notaComun = <p className="grupo__nota texto-suave">Igual para todas las fechas.</p>;

  return (
    <>
      <section className="tarjeta ficha__resumen">
        <h2>{organizacion.nombre}</h2>
        <p className="texto-suave">
          {mes.label} · {organizacion.central} · {organizacion.municipio} · Vigencia {organizacion.vigencia}
        </p>
      </section>

      <FechasDelMes
        mes={mes}
        organizacion={organizacion}
        fechas={fechas}
        nuevas={nuevas}
        elegida={elegida}
        onElegir={setElegida}
        onAgregar={libre ? agregar : null}
        onQuitar={quitar}
      />

      <details className="seccion">
        <summary><span>Datos generales de la organización</span></summary>
        <div className="seccion__cuerpo">{campos(DATOS)}</div>
      </details>

      {SECCIONES.map(s => {
        const avance = organizacion.avanceSeccion(s, elegida);
        return (
          <details className="seccion" key={s.id} open={avance.llenos > 0}>
            <summary>
              <span>{s.nombre}</span>
              <span className={`etiqueta ${avance.llenos === avance.total ? 'etiqueta--exito' : ''}`}>
                {avance.llenos} de {avance.total}
              </span>
            </summary>
            <div className="seccion__grupos">
              {s.grupos.map(g => (
                g.nombre ? (
                  <fieldset className="grupo" key={g.clave}>
                    <legend className="grupo__titulo">{g.nombre}</legend>
                    {g.comun && fechas.length > 1 && notaComun}
                    <div className="seccion__cuerpo">{campos(g.campos)}</div>
                  </fieldset>
                ) : (
                  <Fragment key={g.clave}>
                    {g.comun && fechas.length > 1 && notaComun}
                    <div className="seccion__cuerpo">{campos(g.campos)}</div>
                  </Fragment>
                )
              ))}
            </div>
          </details>
        );
      })}
    </>
  );
}
