import { useEffect, useState } from 'react';
import { authService, exportadorExcel } from '../services';
import { useMeses, REUNIONES } from '../hooks/useMeses';
import { useNavegacion } from '../hooks/useNavegacion';
import { useRegistros } from '../hooks/useRegistros';
import Encabezado from '../components/layout/Encabezado';
import Aviso from '../components/ui/Aviso';
import Migas from '../components/ui/Migas';
import Pestanas from '../components/ui/Pestanas';
import TarjetasGrupo from '../components/seguimiento/TarjetasGrupo';
import TablaOrganizaciones from '../components/seguimiento/TablaOrganizaciones';
import FichaOrganizacion from '../components/seguimiento/FichaOrganizacion';
import ImportarInforme from '../components/informe/ImportarInforme';
import TablaReuniones from '../components/reuniones/TablaReuniones';

const DURACION_EXITO_MS = 6000;

/** Pantalla principal: une encabezado, navegación y la vista de cada nivel. */
export default function Panel() {
  const { registros, editar, estadoGuardado, errorCarga, compartido } = useRegistros();
  const meses = useMeses(registros);
  const nav = useNavegacion();
  const [mm, setMm] = useState(() => meses.at(-1).mm); // por defecto, el mes más reciente
  const [importando, setImportando] = useState(false);
  const [exito, setExito] = useState('');

  const mes = meses.find(m => m.mm === mm) ?? meses.at(-1);
  const organizacion = nav.orgId !== null ? mes.buscarPorId(nav.orgId) : null;

  useEffect(() => {
    if (!exito) return;
    const t = setTimeout(() => setExito(''), DURACION_EXITO_MS);
    return () => clearTimeout(t);
  }, [exito]);

  function cambiarMes(nuevoMm) {
    setMm(nuevoMm);
    nav.reubicar(meses.find(m => m.mm === nuevoMm), organizacion);
  }

  /** Descarga solo lo que se está viendo: todo el mes, una central, un municipio o una organización. */
  function descargarExcel() {
    const { organizaciones, alcance } = vistaActual(nav, mes, organizacion);
    exportadorExcel.descargar(mes, organizaciones, alcance);
    const donde = alcance.length ? alcance.join(' › ') : 'todas las centrales';
    setExito(`Descargamos ${organizaciones.length} ${organizaciones.length === 1 ? 'organización' : 'organizaciones'} de ${donde} (${mes.label}).`);
  }

  function guardarInforme(mesDestino, org, cambios) {
    cambios.forEach(c => editar(mesDestino.mm, org.id, c.col, c.val, 'pdf'));
    setMm(mesDestino.mm);
    nav.abrirOrganizacion(org);
    setImportando(false);
    setExito(`Guardamos ${cambios.length} ${cambios.length === 1 ? 'campo' : 'campos'} del informe en ${org.nombre} (${mesDestino.label}).`);
  }

  return (
    <div className="app">
      <Encabezado
        meses={meses}
        mesActual={mes}
        onCambiarMes={cambiarMes}
        onSubirInforme={() => setImportando(true)}
        onDescargarExcel={descargarExcel}
        onSalir={authService.requiereLogin ? () => authService.cerrarSesion() : null}
        modoLocal={!compartido}
        estadoGuardado={estadoGuardado}
      />

      <Pestanas
        valor={nav.nivel === 'reuniones' ? 'reuniones' : 'organizaciones'}
        onCambiar={v => (v === 'reuniones' ? nav.verReuniones() : nav.irAInicio())}
        opciones={[
          { valor: 'organizaciones', texto: 'Organizaciones' },
          { valor: 'reuniones', texto: 'Reuniones de equipo' },
        ]}
      />

      {errorCarga && <Aviso tipo="error">{errorCarga}</Aviso>}
      {exito && <Aviso tipo="exito" onCerrar={() => setExito('')}>{exito}</Aviso>}

      <main>
        {nav.nivel === 'reuniones' ? (
          <TablaReuniones reuniones={REUNIONES} />
        ) : (
          <>
            <Migas pasos={pasosMigas(nav, organizacion)} />
            {nav.nivel === 'centrales' && (
              <TarjetasGrupo grupos={mes.centrales()} textoSinNombre="Sin central" onElegir={nav.elegirCentral} />
            )}
            {nav.nivel === 'municipios' && (
              <TarjetasGrupo grupos={mes.municipios(nav.central)} textoSinNombre="Sin municipio" onElegir={nav.elegirMunicipio} />
            )}
            {nav.nivel === 'organizaciones' && (
              <TablaOrganizaciones organizaciones={mes.organizacionesDe(nav.central, nav.municipio)} onElegir={nav.abrirOrganizacion} />
            )}
            {nav.nivel === 'organizacion' && organizacion && (
              <FichaOrganizacion
                mes={mes}
                organizacion={organizacion}
                onEditar={(col, valor) => editar(mes.mm, organizacion.id, col, valor)}
              />
            )}
          </>
        )}
      </main>

      {importando && (
        <ImportarInforme meses={meses} onConfirmar={guardarInforme} onCerrar={() => setImportando(false)} />
      )}
    </div>
  );
}

/** Organizaciones que se ven en pantalla y el nombre de ese lugar. */
function vistaActual(nav, mes, organizacion) {
  if (organizacion) return { organizaciones: [organizacion], alcance: [organizacion.nombre] };
  if (nav.municipio !== null) {
    return { organizaciones: mes.organizacionesDe(nav.central, nav.municipio), alcance: [nav.central, nav.municipio || 'Sin municipio'] };
  }
  if (nav.central !== null) return { organizaciones: mes.organizacionesDeCentral(nav.central), alcance: [nav.central] };
  return { organizaciones: mes.organizaciones, alcance: [] };
}

function pasosMigas(nav, organizacion) {
  const pasos = [{ texto: 'Centrales', onClick: nav.irAInicio }];
  if (nav.central !== null) pasos.push({ texto: nav.central || 'Sin central', onClick: () => nav.elegirCentral(nav.central) });
  if (nav.municipio !== null) pasos.push({ texto: nav.municipio || 'Sin municipio', onClick: () => nav.elegirMunicipio(nav.municipio) });
  if (organizacion) pasos.push({ texto: organizacion.nombre });
  return pasos;
}
