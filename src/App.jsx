import { useSesion } from './hooks/useSesion';
import Login from './pages/Login';
import Panel from './pages/Panel';

/** Decide qué mostrar según la sesión. Nada más. */
export default function App() {
  const { cargando, autenticado } = useSesion();

  if (cargando) return <p className="cargando">Cargando…</p>;
  return autenticado ? <Panel /> : <Login />;
}
