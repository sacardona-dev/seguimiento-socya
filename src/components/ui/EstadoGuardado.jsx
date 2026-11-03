const TEXTOS = {
  guardando: 'Guardando…',
  guardado: 'Cambios guardados',
  error: 'No se pudo guardar. Revisa la conexión.',
};

/** Indicador discreto de guardado, para que la persona sepa que su cambio quedó. */
export default function EstadoGuardado({ estado }) {
  return (
    <span className={`estado-guardado estado-guardado--${estado}`} aria-live="polite">
      {TEXTOS[estado] ?? ''}
    </span>
  );
}
