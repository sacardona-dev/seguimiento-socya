import { useId, useState } from 'react';
import { Reunion } from '../../domain/Reunion';
import Aviso from '../ui/Aviso';
import Boton from '../ui/Boton';
import Modal from '../ui/Modal';

const VACIO = { central: '', lugar: '', fecha: '', asistentes: '', isagen: 'no', objetivo: '' };

/**
 * Formulario para registrar una reunión de equipo. Central y lugar sugieren opciones
 * pero aceptan texto libre (ej. "San Carlos y Calderas", "Videoconferencia").
 * Revisa los datos antes de guardar y muestra qué falta en cada campo.
 * Con `inicial` sirve para editar una reunión existente.
 */
export default function FormularioReunion({ centrales, lugares, centralInicial, inicial, onGuardar, onCerrar }) {
  const editando = Boolean(inicial);
  const [datos, setDatos] = useState(inicial ?? { ...VACIO, central: centralInicial ?? '' });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const id = useId();

  const cambiar = nombre => e => setDatos(d => ({ ...d, [nombre]: e.target.value }));

  async function guardar(e) {
    e.preventDefault();
    const encontrados = Reunion.validar(datos);
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    setGuardando(true);
    setErrorGeneral('');
    try {
      await onGuardar(datos);
    } catch {
      setErrorGeneral('No pudimos guardar la reunión. Revisa la conexión. Si sigue fallando, revisa que la tabla "reuniones" exista en Supabase.');
      setGuardando(false);
    }
  }

  const campo = (nombre, etiqueta, control, ancho = false) => (
    <div className={`campo ${ancho ? 'campo--ancho' : ''}`}>
      <label htmlFor={`${id}-${nombre}`}>{etiqueta}</label>
      {control}
      {errores[nombre] && <small className="campo__nota campo__nota--error">{errores[nombre]}</small>}
    </div>
  );

  return (
    <Modal
      titulo={editando ? 'Editar reunión' : 'Agregar reunión de equipo'}
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="texto" onClick={onCerrar}>Cancelar</Boton>
          <Boton variante="primario" type="submit" form={`${id}-form`} disabled={guardando}>
            {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Guardar reunión'}
          </Boton>
        </>
      }
    >
      <form id={`${id}-form`} className="formulario-reunion" onSubmit={guardar} noValidate>
        {campo('central', 'Central', (
          <>
            <input id={`${id}-central`} list={`${id}-centrales`} value={datos.central} onChange={cambiar('central')} placeholder="Ej. Jaguas" />
            <datalist id={`${id}-centrales`}>{centrales.map(c => <option key={c} value={c} />)}</datalist>
          </>
        ))}
        {campo('lugar', 'Lugar', (
          <>
            <input id={`${id}-lugar`} list={`${id}-lugares`} value={datos.lugar} onChange={cambiar('lugar')} placeholder="Municipio o Videoconferencia" />
            <datalist id={`${id}-lugares`}>{lugares.map(l => <option key={l} value={l} />)}</datalist>
          </>
        ))}
        {campo('fecha', 'Fecha', <input id={`${id}-fecha`} type="date" value={datos.fecha} onChange={cambiar('fecha')} />)}
        {campo('asistentes', 'N.º de asistentes', (
          <input id={`${id}-asistentes`} inputMode="numeric" value={datos.asistentes}
            onChange={e => setDatos(d => ({ ...d, asistentes: e.target.value.replace(/\D/g, '') }))} />
        ))}

        <fieldset className="campo campo--ancho opciones-si-no">
          <legend>¿Hubo acompañamiento de ISAGEN?</legend>
          {[['si', 'Sí'], ['no', 'No']].map(([valor, texto]) => (
            <label key={valor} className="opciones-si-no__opcion">
              <input type="radio" name={`${id}-isagen`} value={valor} checked={datos.isagen === valor} onChange={cambiar('isagen')} />
              {texto}
            </label>
          ))}
        </fieldset>

        {campo('objetivo', 'Objetivo', (
          <textarea id={`${id}-objetivo`} value={datos.objetivo} onChange={cambiar('objetivo')} placeholder="¿Para qué se reunieron?" />
        ), true)}
      </form>
      {errorGeneral && <Aviso tipo="error">{errorGeneral}</Aviso>}
    </Modal>
  );
}
