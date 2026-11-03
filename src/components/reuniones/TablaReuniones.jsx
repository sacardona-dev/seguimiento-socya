/** Reuniones de equipo cargadas desde el Excel. */
export default function TablaReuniones({ reuniones }) {
  return (
    <div className="tabla-contenedor">
      <table className="tabla">
        <thead>
          <tr><th>Central</th><th>Municipio</th><th>Fecha</th><th>Asistentes</th><th>Acompañamiento ISAGEN</th><th>Objetivo</th></tr>
        </thead>
        <tbody>
          {reuniones.map(r => (
            <tr key={r.id}>
              <td>{r.central}</td><td>{r.municipio}</td><td className="sin-salto">{r.fecha}</td>
              <td>{r.asistentes}</td><td>{r.isagen}</td><td className="texto-largo">{r.objetivo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
