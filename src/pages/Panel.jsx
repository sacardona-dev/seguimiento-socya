import { useEffect, useState } from 'react';
import { exportadorExcel } from '../services';
import { useMeses } from '../hooks/useMeses';
import { useNavegacion } from '../hooks/useNavegacion';
import { useRegistros } from '../hooks/useRegistros';
import { useAdministrador } from '../hooks/useAdministrador';
import HistorialCambios from '../components/historial/HistorialCambios';
import Encabezado from '../components/layout/Encabezado';
import BarraSuperior from '../components/layout/BarraSuperior';
import BotonVolver from '../components/ui/BotonVolver';
import { IconoDescargar } from '../components/ui/Iconos';
import Aviso from '../components/ui/Aviso';
import TarjetasGrupo from '../components/seguimiento/TarjetasGrupo';
import TablaOrganizaciones from '../components/seguimiento/TablaOrganizaciones';
import FichaOrganizacion from '../components/seguimiento/FichaOrganizacion';
import ImportarInforme from '../components/informe/ImportarInforme';
import AbrirMesNuevo from '../components/meses/AbrirMesNuevo';
import BuscadorOrganizaciones from '../components/seguimiento/BuscadorOrganizaciones';
import ResumenMes from '../components/seguimiento/ResumenMes';

const DURACION_EXITO_MS = 6000;

/** Pantalla principal: une encabezado, navegación y la vista de cada nivel. */
export default function Panel() {
  const { registros, mesesRecibidos, editar, estadoGuardado, errorCarga, compartido } = useRegistros();
  const { meses, errorMeses, mesSiguiente, abrirMesSiguiente } = useMeses(registros, mesesRecibidos);
  const nav = useNavegacion();
  const [claveMes, setClaveMes] = useState(null); // null = el mes más reciente
  const [importando, setImportando] = useState(false);
  const [abriendoMes, setAbriendoMes] = useState(false);
  const [exito, setExito] = useState('');
  const esAdministrador = useAdministrador();
  const [viendoHistorial, setViendoHistorial] = useState(false);

  const mes = meses.find(m => m.clave === claveMes) ?? meses.at(-1);
  const organizacion = nav.orgId !== null ? mes.buscarPorId(nav.orgId) : null;
  const pasos = pasosNavegacion(nav, organizacion);

  useEffect(() => {
    if (!exito) return;
    const t = setTimeout(() => setExito(''), DURACION_EXITO_MS);
    return () => clearTimeout(t);
  }, [exito]);

  function cambiarMes(clave) {
    setClaveMes(clave);
    nav.reubicar(meses.find(m => m.clave === clave), organizacion);
  }

  async function abrirMes() {
    const nuevo = await abrirMesSiguiente();
    setAbriendoMes(false);
    cambiarMes(nuevo.clave);
    setExito(`Agregamos ${nuevo.label} con ${nuevo.rows.length} organizaciones.`);
  }

  /** Descarga solo lo que se está viendo: todo el mes, una central, un municipio o una organización. */
  async function descargarExcel() {
    const { organizaciones, alcance } = vistaActual(nav, mes, organizacion);
    await exportadorExcel.descargar(mes, organizaciones, alcance);
    const donde = alcance.length ? alcance.join(' › ') : 'todas las centrales';
    setExito(`Descargamos ${organizaciones.length} ${organizaciones.length === 1 ? 'organización' : 'organizaciones'} de ${donde} (${mes.label}).`);
  }

  function guardarInforme(mesDestino, org, cambios, cantidadInformes = 1) {
    cambios.forEach(c => editar(mesDestino.clave, org.id, c.col, c.val, 'pdf'));
    setClaveMes(mesDestino.clave);
    nav.abrirOrganizacion(org);
    setImportando(false);
    const deDonde = cantidadInformes === 1 ? 'del informe' : `de ${cantidadInformes} informes`;
    setExito(`Guardamos ${cambios.length} ${cambios.length === 1 ? 'campo' : 'campos'} ${deDonde} en ${org.nombre} (${mesDestino.label}).`);
  }

  const barra = (
    <BarraSuperior
      modoLocal={!compartido}
      onHistorial={esAdministrador && !viendoHistorial ? () => setViendoHistorial(true) : null}
    />
  );

  if (viendoHistorial) {
    return (
      <>
        {barra}
        <div className="app"><HistorialCambios meses={meses} onVolver={() => setViendoHistorial(false)} /></div>
      </>
    );
  }

  return (
    <>
    {barra}
    <div className="app">
      <Encabezado
        meses={meses}
        mesActual={mes}
        onCambiarMes={cambiarMes}
        onAgregarMes={mesSiguiente ? () => setAbriendoMes(true) : null}
        onSubirInforme={() => setImportando(true)}
        estadoGuardado={estadoGuardado}
      />

      {errorCarga && <Aviso tipo="error">{errorCarga}</Aviso>}
      {errorMeses && <Aviso tipo="alerta">{errorMeses}</Aviso>}
      {exito && <Aviso tipo="exito" onCerrar={() => setExito('')}>{exito}</Aviso>}

      <main>
        <BuscadorOrganizaciones mes={mes} onElegir={nav.abrirOrganizacion} />
        {nav.nivel === 'centrales' && <ResumenMes mes={mes} />}
        <div className="barra-navegacion">
          <div className="barra-navegacion__ruta">
            {pasos.length > 1 && <BotonVolver destino={pasos.at(-2).texto} onClick={pasos.at(-2).onClick} />}
            <h2 className="barra-navegacion__lugar">{pasos.at(-1).texto}</h2>
          </div>
          <button type="button" className="boton-descargar" onClick={descargarExcel}>
            <IconoDescargar /> {textoDescarga(nav, organizacion)}
          </button>
        </div>
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
            key={`${mes.clave}-${organizacion.id}`}
            mes={mes}
            organizacion={organizacion}
            onEditar={(col, valor) => editar(mes.clave, organizacion.id, col, valor)}
          />
        )}
      </main>

      {abriendoMes && mesSiguiente && (
        <AbrirMesNuevo mesSiguiente={mesSiguiente} onAbrir={abrirMes} onCerrar={() => setAbriendoMes(false)} />
      )}

      {importando && (
        <ImportarInforme meses={meses} onConfirmar={guardarInforme} onCerrar={() => setImportando(false)} />
      )}
    </div>
    </>
  );
}

/** Dice exactamente qué baja el botón, según dónde está la persona. */
function textoDescarga(nav, organizacion) {
  if (organizacion) return 'Descargar Excel de esta organización';
  if (nav.municipio !== null) return `Descargar Excel de ${nav.municipio || 'este municipio'}`;
  if (nav.central !== null) return `Descargar Excel de ${nav.central || 'esta central'}`;
  return 'Descargar Excel del mes';
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

/** Niveles por los que pasó la persona: dónde está (el último) y a dónde vuelve la flecha (el anterior). */
function pasosNavegacion(nav, organizacion) {
  const pasos = [{ texto: 'Centrales', onClick: nav.irAInicio }];
  if (nav.central !== null) pasos.push({ texto: nav.central || 'Sin central', onClick: () => nav.elegirCentral(nav.central) });
  if (nav.municipio !== null) pasos.push({ texto: nav.municipio || 'Sin municipio', onClick: () => nav.elegirMunicipio(nav.municipio) });
  if (organizacion) pasos.push({ texto: organizacion.nombre });
  return pasos;
}
