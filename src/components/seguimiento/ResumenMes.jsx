/** Cifras grandes del mes al entrar: organizaciones, centrales y municipios. */
export default function ResumenMes({ mes }) {
  const { organizaciones, centrales, municipios } = mes.resumen();
  const cifras = [
    { valor: organizaciones, texto: organizaciones === 1 ? 'organización' : 'organizaciones' },
    { valor: centrales, texto: centrales === 1 ? 'central' : 'centrales' },
    { valor: municipios, texto: municipios === 1 ? 'municipio' : 'municipios' },
  ];

  return (
    <section className="resumen" aria-label={`Resumen de ${mes.label}`}>
      {cifras.map(c => (
        <div className="resumen__cifra" key={c.texto}>
          <span className="resumen__valor">{c.valor}</span>
          <span className="resumen__texto">{c.texto}</span>
        </div>
      ))}
    </section>
  );
}
