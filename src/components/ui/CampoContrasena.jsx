import { useState } from 'react';
import { IconoOjo, IconoOjoTachado } from './Iconos';

/** Campo de contraseña con un ojito para mostrarla u ocultarla. */
export default function CampoContrasena({ id, value, onChange, autoComplete = 'current-password', ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="campo-contrasena">
      <input id={id} type={visible ? 'text' : 'password'} autoComplete={autoComplete} value={value} onChange={onChange} {...props} />
      <button
        type="button"
        className="campo-contrasena__ojo"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {visible ? <IconoOjoTachado /> : <IconoOjo />}
      </button>
    </div>
  );
}
