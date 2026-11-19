import { useMemo, useState } from 'react';

const INICIO = { nivel: 'centrales', central: null, municipio: null, orgId: null };

/**
 * Dónde está la persona: centrales → municipios → organizaciones → organización.
 */
export function useNavegacion() {
  const [estado, setEstado] = useState(INICIO);

  const acciones = useMemo(() => ({
    irAInicio: () => setEstado(INICIO),
    elegirCentral: central => setEstado({ ...INICIO, nivel: 'municipios', central }),
    elegirMunicipio: municipio => setEstado(e => ({ ...e, nivel: 'organizaciones', municipio, orgId: null })),
    abrirOrganizacion: org => setEstado({
      nivel: 'organizacion', central: org.central, municipio: org.municipio, orgId: org.id,
    }),

    /**
     * Al cambiar de mes, conserva el lugar si existe en el mes nuevo.
     * Así se pueden comparar meses sin volver a navegar desde el inicio.
     */
    reubicar: (mes, orgActual) => setEstado(e => {
      if (e.nivel === 'centrales') return e;
      if (orgActual && mes.buscarPorId(orgActual.id)?.nombre === orgActual.nombre) return e;
      if (mes.municipios(e.central).length === 0) return INICIO;
      if (e.municipio !== null && mes.organizacionesDe(e.central, e.municipio).length === 0) {
        return { ...INICIO, nivel: 'municipios', central: e.central };
      }
      return e.nivel === 'organizacion' ? { ...e, nivel: 'organizaciones', orgId: null } : e;
    }),
  }), []);

  return { ...estado, ...acciones };
}
