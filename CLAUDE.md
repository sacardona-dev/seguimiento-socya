# Seguimiento mensual · ISAGEN Socya

> Este proyecto NO es la PWA "Informe de Visita". El `CLAUDE.md` de la carpeta `Downloads`
> describe ese otro proyecto; ignóralo aquí. Esta app solo LEE los PDF de informes de visita.

App (React 18 + Vite, Supabase opcional) que reemplaza la hoja de Excel de seguimiento mensual
de organizaciones comunitarias. Navegación: Central → Municipio → Organización → campos del mes.
Ver `README.md` para instalar, configurar Supabase y publicar.

## Reglas de negocio (no cambiar sin confirmar)

- Solo se guardan campos que existen en el Excel (`src/config/esquemaExcel.js`). El resto del informe se ignora.
- No se guardan celulares, cédulas, firmas ni fotos.
- Nada del PDF se guarda hasta que la persona confirma.
- Cada dato guarda su origen: `pdf` ("Del informe") o `manual`.
- "Descargar Excel" exporta SOLO lo que se ve en pantalla (todo el mes, una central, un municipio o una
  organización) del mes elegido. Decisión de la usuaria: es más fácil que bajar todas las filas.
  Puede cambiar si la organización lo pide; no cambiarlo por iniciativa propia.
- Formato de registros (Supabase y navegador): `{ [mes]: { [rowId]: { [col]: { v, src, autor?, fecha? } } } }`.
- PENDIENTE DE CONFIRMAR con la usuaria: si se registra quién hizo cada cambio. Está preparado en
  `supabase/autoria.sql` (trigger en la base de datos, nunca en la app) pero NO se ha corrido. La app
  funciona con o sin esas columnas; si existen, muestra "Editado por ..." en cada campo.
  Tabla `registros` con llave `(mes, row_id, col)`. No cambiar sin migrar los datos existentes.

## Arquitectura (dónde va cada cosa)

```
src/
  config/      constantes y conexión: esquemaExcel.js (columnas, secciones, opciones), supabaseClient.js
  domain/      CLASES con reglas de negocio, sin React ni Supabase: Mes, Organizacion, InformeVisita
  services/    CLASES que hablan con el exterior: repositorios, AuthService, LectorPdf, ExportadorExcel
               index.js crea UNA instancia de cada servicio; todo se importa desde ahí
  hooks/       estado de React reutilizable: useSesion, useRegistros, useMeses, useNavegacion
  components/
    ui/        piezas genéricas sin lógica de negocio: Boton, Modal, Aviso, Migas...
    layout/    estructura de página: Encabezado
    <tema>/    piezas de una funcionalidad: seguimiento/, informe/, reuniones/
  pages/       pantallas completas: Login, Panel
  styles/      tokens.css (colores/espacios), base.css (HTML suelto), componentes.css (clases)
  utils/       funciones puras pequeñas: texto.js, columnas.js
  data/        meses.json (datos del Excel)
```

Flujo de dependencias, siempre en un solo sentido:
`pages → components → hooks → services / domain → config / utils`.
Un componente nunca llama a Supabase directo; `domain/` nunca importa React ni servicios.

## Programación orientada a objetos

- **Pantallas y componentes**: funciones de React (estándar moderno), no clases.
- **Lógica de negocio y acceso a datos**: clases reales.
  - Encapsulamiento: campos privados `#` para lo interno (ej. `Organizacion.#fila`).
  - Herencia y polimorfismo: `RepositorioRegistros` (base) → `RepositorioSupabase` y `RepositorioLocal`.
    La app usa el repositorio sin saber cuál es. Un almacenamiento nuevo = nueva subclase.
  - Responsabilidad única: cada clase hace una cosa (leer PDF, exportar Excel, autenticar...).
- Un dato del Excel se lee con `organizacion.valor(col)`, nunca `fila[col]` directo
  (así siempre se respeta el cambio guardado por encima del original).
- Columnas por nombre (`COL.NOMBRE`), no letras sueltas en el código.

## Leyes UX aplicadas (mantenerlas en pantallas nuevas)

| Ley | Cómo se aplica |
|---|---|
| Hick (menos opciones, decisión más rápida) | Un solo botón primario por zona ("Subir informe de visita"); el resto secundario o de texto. Buscador en tablas largas (8+ filas). |
| Fitts (objetivos grandes y cercanos) | Todo lo clicable mide mínimo 44 px (`--alto-toque`). Filas de tabla y tarjetas completas son clicables. |
| Jakob (lo familiar) | Migas de pan, pestañas, tablas y modales con patrones conocidos. Escape cierra ventanas. |
| Miller / fragmentación | Campos agrupados en secciones plegables; solo se abren las que tienen datos. |
| Gradiente de meta / Zeigarnik | Cada sección de la ficha muestra cuántos campos tienen dato ("3 de 9"). Sin barras de progreso: la usuaria las pidió quitar. |
| Umbral de Doherty (respuesta < 400 ms) | La pantalla cambia al instante y el guardado va por detrás con indicador "Guardando… / Cambios guardados". "Leyendo el informe…" mientras procesa el PDF. |
| Pico-final | Mensaje de éxito al terminar de guardar un informe, con cuántos campos y dónde. |
| Von Restorff | El botón primario es el único con color sólido. |
| Proximidad / región común | Tarjetas y secciones con borde agrupan lo relacionado. |
| Tesler (la app absorbe la complejidad) | Detecta mes y organización del PDF; abre por defecto el mes más reciente; al cambiar de mes conserva dónde estabas. |
| Postel (tolerante con lo que recibe) | El PDF se puede arrastrar o elegir; los nombres se comparan sin tildes ni palabras genéricas. |

Accesibilidad mínima: cada campo con `<label htmlFor>`, foco visible, `aria-live` en estados,
contraste AA.

## Estilos y marca Socya

- Colores SOLO por variables de `src/styles/tokens.css` (roles `--color-*`). No escribir hex en componentes.
- Paleta Socya: verde `#087062` (botón primario, enlaces), noche `#123C49` (texto, fondo oscuro),
  lima `#80C612` (acentos, barras; nunca texto sobre blanco ni blanco sobre lima).
- Títulos en Laca (`src/assets/fuentes`), texto en Century Gothic. Títulos en minúscula inicial.
- La app NO lleva logo por ahora (ni en el encabezado ni en el login), ni el texto "ISAGEN · Socya":
  aún no se ha definido qué logo va. No agregar uno sin confirmarlo con la usuaria.
- Clases CSS en estilo BEM en español: `bloque__elemento--variante`.
- Textos de la interfaz en primera persona plural, frases cortas ("Guardamos 5 campos…").

## Convenciones de código

- Nombres en español, claros: `organizacionesDe`, `guardarCampo`, no `getData`.
- Un componente por archivo, nombre del archivo = nombre del componente.
- Un comentario corto arriba de cada clase/componente que diga para qué sirve.
- Antes de terminar un cambio: `npm run build` sin errores.

## Pendientes

- Marzo (Mes#1) no está cargado: su sección C tiene columnas distintas.
- Mapeo "Acompañamiento Social" → sección E es provisional; confirmar lista real de tipos de intervención.
- Acciones realizadas y recomendaciones van juntas a Observaciones; confirmar destino.
- El paquete JS pesa ~1,6 MB (pdfjs + xlsx). Mejora futura: cargarlos solo al usarlos (`import()` dinámico).
