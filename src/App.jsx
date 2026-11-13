import { useSesion } from './hooks/useSesion';
import Login from './pages/Login';
import NuevaContrasena from './pages/NuevaContrasena';
import Panel from './pages/Panel';

/** Decide qué mostrar según la sesión. Nada más. */
export default function App() {
  const { cargando, autenticado, recuperando, terminarRecuperacion } = useSesion();

  if (cargando) return <p className="cargando">Cargando…</p>;
  if (recuperando && autenticado) return <NuevaContrasena onListo={terminarRecuperacion} />;
  return autenticado ? <Panel /> : <Login />;
}
