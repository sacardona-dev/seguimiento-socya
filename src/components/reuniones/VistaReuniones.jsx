import { useId, useMemo, useState } from 'react';
import { NOMBRES_MES } from '../../utils/fechas';
import { useReuniones } from '../../hooks/useReuniones';
import Aviso from '../ui/Aviso';
import Boton from '../ui/Boton';
import Confirmacion from '../ui/Confirmacion';
import Paginacion from '../ui/Paginacion';
import FormularioReunion from './FormularioReunion';
import TarjetaReunion from './TarjetaReunion';

const TODAS = '';
const POR_PAGINA = 5; // reuniones por página, para que la lista no sea una fila larga
const claveMes = (anio, numeroMes) => `${anio}-${String(numeroMes).padStart(2, '0')}`;

/**
 * Pestaña "Reuniones de equipo": filtros (mes y central), tarjetas de 5 en 5, y registrar, editar o
 * borrar reuniones (editar y borrar solo las registradas en la app por quien usa la app).
 * Los meses del filtro salen de las propias reuniones, no del selector de mes de las organizaciones:
 * así una reunión de un mes que aún no se ha agregado para las organizaciones igual se ve.
 * Los filtros y la página los guarda el Panel (`filtros`), para que al salir de la pestaña y volver
 * todo siga donde quedó. Nada hace saltar la página ni la pantalla.
 */
export default function VistaReuniones({ mes, lugaresSugeridos, filtros, onCambiarFiltros, onExito }) {
  const { reuniones, agregarReunion, editarReunion, borrarReunion, usuarioId, errorReuniones } = useReuniones();
  const { periodo: periodoElegido, central, pagina } = filtros; // periodo null = automático
  const [formulario, setFormulario] = useState(null); // null = cerrado; {} = agregar; { reunion } = editar
  const [porBorrar, setPorBorrar] = useState(null);
  const idPeriodo = useId();
  const idCentral = useId();

  const centrales = useMemo(() => [...new Set(reuniones.map(r => r.central).filter(Boolean))].sort(), [reuniones]);

  // Meses que tienen reuniones, del más reciente al más antiguo
  const mesesConReuniones = useMemo(() => {
    const porClave = new Map();
    reuniones.filter(r => r.anio).forEach(r => porClave.set(claveMes(r.anio, r.numeroMes),
      { clave: claveMes(r.anio, r.numeroMes), label: `${NOMBRES_MES[r.numeroMes - 1]} ${r.anio}` }));
    return [...porClave.values()].sort((a, b) => b.clave.localeCompare(a.clave));
  }, [reuniones]);

  // Por defecto: el mes elegido arriba si tiene reuniones; si no, el más reciente con reuniones
  const claveMesArriba = claveMes(mes.anio, mes.numero);
  const periodo = periodoElegido
    ?? (mesesConReuniones.some(m => m.clave === claveMesArriba) ? claveMesArriba : mesesConReuniones[0]?.clave ?? TODAS);

  const visibles = reuniones
    .filter(r => periodo === TODAS || claveMes(r.anio, r.numeroMes) === periodo)
    .filter(r => central === TODAS || r.central === central);
  const totalPaginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas); // por si al borrar o filtrar quedan menos páginas
  const enPagina = visibles.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  // Cambiar de página o de filtro no mueve la pantalla ni devuelve a la página 1 (pedido de la usuaria).
  // Si con un filtro quedan menos páginas, se muestra la última que exista (paginaActual).
  const irAPagina = n => onCambiarFiltros({ ...filtros, pagina: n });
  const filtrarPeriodo = valor => onCambiarFiltros({ ...filtros, periodo: valor });
  const filtrarCentral = valor => onCambiarFiltros({ ...filtros, central: valor });

  const textoPeriodo = periodo === TODAS ? 'todas las fechas' : mesesConReuniones.find(m => m.clave === periodo)?.label;

  async function guardar(datos) {
    const editada = formulario?.reunion;
    const guardada = editada ? await editarReunion(editada.id, datos) : await agregarReunion(datos);
    setFormulario(null);
    filtrarPeriodo(claveMes(guardada.anio, guardada.numeroMes)); // mostrar el mes de la reunión guardada
    onExito(editada
      ? `Guardamos los cambios de la reunión del ${guardada.fecha}.`
      : `Guardamos la reunión del ${guardada.fecha} (${guardada.central}).`);
  }

  async function borrar() {
    await borrarReunion(porBorrar.id);
    onExito(`Borramos la reunión del ${porBorrar.fecha}.`);
    setPorBorrar(null);
  }

  return (
    <>
      {errorReuniones && <Aviso tipo="alerta">{errorReuniones}</Aviso>}

      <div className="filtros-reuniones">
        <div className="filtros-reuniones__grupo">
          <label htmlFor={idPeriodo} className="encabezado__etiqueta">Ver</label>
          <select id={idPeriodo} value={periodo} onChange={e => filtrarPeriodo(e.target.value)}>
            {mesesConReuniones.map(m => <option key={m.clave} value={m.clave}>{m.label}</option>)}
            <option value={TODAS}>Todas las fechas</option>
          </select>
          <label htmlFor={idCentral} className="encabezado__etiqueta">Central</label>
          <select id={idCentral} value={central} onChange={e => filtrarCentral(e.target.value)}>
            <option value={TODAS}>Todas</option>
            {centrales.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filtros-reuniones__grupo">
          <Boton onClick={() => setFormulario({})}>＋ Agregar reunión</Boton>
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="vacio vacio--tarjeta">
          <p>No hay reuniones {central !== TODAS ? `de ${central} ` : ''}en {textoPeriodo}.</p>
          {periodo !== TODAS && <Boton variante="texto" onClick={() => filtrarPeriodo(TODAS)}>Ver todas las fechas</Boton>}
        </div>
      ) : (
        <>
        <div className="lista-reuniones">
          {enPagina.map(r => (
            <TarjetaReunion
              key={r.id}
              reunion={r}
              editable={r.puedeEditar(usuarioId)}
              onEditar={() => setFormulario({ reunion: r })}
              onBorrar={() => setPorBorrar(r)}
            />
          ))}
        </div>
        <Paginacion pagina={paginaActual} totalElementos={visibles.length} porPagina={POR_PAGINA} nombre="reuniones" onCambiar={irAPagina} />
        </>
      )}

      {formulario && (
        <FormularioReunion
          centrales={centrales}
          lugares={lugaresSugeridos}
          centralInicial={central}
          inicial={formulario.reunion?.aFormulario()}
          onGuardar={guardar}
          onCerrar={() => setFormulario(null)}
        />
      )}

      {porBorrar && (
        <Confirmacion
          titulo="¿Borrar esta reunión?"
          mensaje={`Vamos a borrar la reunión del ${porBorrar.fecha} (${porBorrar.central}). No se puede deshacer.`}
          textoConfirmar="Borrar reunión"
          onConfirmar={borrar}
          onCerrar={() => setPorBorrar(null)}
        />
      )}
    </>
  );
}
