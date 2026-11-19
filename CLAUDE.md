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
  Puede cambiar si la organización lo pide; no cambiarlo por iniciativa propia. El botón NO va en la
  franja de herramientas: va a la derecha del lugar actual y dice qué descarga ("Descargar Excel de
  Jaguas", "…del mes", "…de esta organización"), porque arriba se veía feo y no se entendía qué bajaba.
- Formato de registros (Supabase y navegador): `{ [mes]: { [rowId]: { [col]: { v, src, autor?, fecha? } } } }`.
- Historial de cambios (pedido de la organización, nov. 2026): `supabase/historial.sql`. Triggers en
  `registros` y `meses` anotan en la tabla `historial` quién, cuándo, valor antes y después (también
  lo que se borra o se cambia directo en Supabase). Lo escribe SOLO la base de datos; la app no tiene
  permiso de escribirlo. Solo lo LEEN los correos de la tabla `administradores` (función
  `es_administrador()`); a los demás ni se les muestra el botón. Pantalla `HistorialCambios`: filtro por
  rango de fechas (últimos 30 días por defecto), persona y buscador; solo consulta (no deshace cambios).
  Varias personas editan el MISMO seguimiento: no hay uno por persona.
- `supabase/autoria.sql` ("Editado por" en cada campo) sigue sin correrse; el historial lo reemplaza.
- Varias fechas en un mes (pedido de la organización): todo subgrupo con columna de fecha es
  `repetible` (esquemaExcel.js). La fecha 1 usa la columna del Excel (`Z`); las demás, `Z_2`… hasta
  `MAX_ACTIVIDADES` = 5 (se pidió de 2 a 4, pero el Excel tiene un caso de 5 en junio). Así no se
  cambió la tabla `registros`. En la ficha (`GrupoActividades`): una línea por fecha ("20/10/2026 · 7
  participantes"), se abre con clic, solo una abierta a la vez; con una sola, viene abierta (elegido por
  la usuaria: "muy extenso" si todas se ven abiertas). "＋ Agregar otra fecha" solo si las anteriores
  tienen datos. "Quitar esta fecha" deja sus campos en blanco, con confirmación. El Excel descargado
  vuelve a partir la fila en sub-filas con las demás columnas combinadas.
- Las sub-filas del Excel original (filas sin vigencia dentro de una organización combinada) se pasaron
  a `meses.json` como `Z_2`… (113 fechas, abril a octubre). Algunas fechas traen errores de digitación
  del Excel ("13/082026"); se dejaron igual y la app pide corregirlas.
- Informes de visita: se suben de 1 a 3 a la vez (`LoteInformes`), de la MISMA organización y mes (si
  no, error). Cada informe ocupa su propia fecha en el subgrupo destino (si ya existe esa fecha, la
  actualiza). Las observaciones de todos se JUNTAN ordenadas por fecha en un cuadro editable antes de
  guardar (sin IA: se decidió empezar así; con IA haría falta servidor, costo y autorización de Socya).
- Las 7 filas finales de cada hoja del Excel son listas de apoyo de los desplegables, no organizaciones.
  `Mes` las descarta porque no tienen vigencia (columna C). Toda organización real tiene vigencia.
- Tabla `registros` con llave `(mes, row_id, col)`. No cambiar sin migrar los datos existentes.
- Clave de un mes (`Mes.clave`, la que va en `registros.mes`): los meses del Excel original usan
  `'04'`…`'10'` (2026) y NO se cambian, porque los datos ya guardados dependen de eso. Los meses
  abiertos desde la app usan `'aaaa-mm'` (`'2026-11'`) para no chocar entre años.
- Meses nuevos: botón "＋ Agregar nuevo mes" junto al selector de Mes (la usuaria lo pidió visible y
  con texto corto: ni escondido en el selector ni con aviso largo). Solo agrega el siguiente al
  último y solo si ya empezó; el botón desaparece cuando no hay mes por agregar. Copian las mismas organizaciones con `COLUMNAS_QUE_SE_CONSERVAN` (esquemaExcel.js,
  medido con los datos reales: se repiten > 85 % mes a mes); lo demás empieza en blanco. Se guardan
  en la tabla `meses`; no se pueden editar ni borrar desde la app.
- Las fechas fuera del mes elegido solo muestran aviso; no se bloquean.
- Crear/cambiar contraseña (pantalla NuevaContrasena): mínimo 8 caracteres, una mayúscula y un número,
  validado antes de enviar (`utils/contrasena.js`). El login NO valida esas reglas.

- La app es SOLO de organizaciones. La sección "Reuniones de equipo" se eliminó por completo (pantalla,
  código, datos de `meses.json` y SQL) por pedido de quienes revisaron la app (nov. 2026). No volver a
  agregarla sin que lo pidan. La versión que la tenía está en el historial de git (commit e070363).

## Arquitectura (dónde va cada cosa)

```
src/
  config/      constantes y conexión: esquemaExcel.js (columnas, secciones, opciones), supabaseClient.js
  domain/      CLASES con reglas de negocio, sin React ni Supabase: Mes, Organizacion, InformeVisita,
               CorrectorOrtografia, LoteInformes, CambioHistorial
  services/    CLASES que hablan con el exterior: repositorios, AuthService, LectorPdf, ExportadorExcel
               index.js crea UNA instancia de cada servicio; todo se importa desde ahí
  hooks/       estado de React reutilizable: useSesion, useRegistros, useMeses, useNavegacion,
               useAdministrador, useHistorial
  components/
    ui/        piezas genéricas sin lógica de negocio: Boton, BotonVolver, Modal, Aviso...
    layout/    estructura de página: BarraSuperior (navbar), Encabezado (herramientas de trabajo)
    <tema>/    piezas de una funcionalidad: seguimiento/, informe/, meses/, historial/
  pages/       pantallas completas: Login, NuevaContrasena, Panel
  styles/      tokens.css (colores/espacios), base.css (HTML suelto), componentes.css (clases)
  utils/       funciones puras pequeñas: texto.js, columnas.js, fechas.js, contrasena.js
  data/        meses.json (datos del Excel original, abril a octubre 2026)
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
    El repositorio guarda campos y meses, y avisa en vivo (`escuchar`) los cambios de otras personas
    (Supabase Realtime; en modo local no hace nada).
  - Responsabilidad única: cada clase hace una cosa (leer PDF, exportar Excel, autenticar...).
- Un dato del Excel se lee con `organizacion.valor(col)`, nunca `fila[col]` directo
  (así siempre se respeta el cambio guardado por encima del original).
- Columnas por nombre (`COL.NOMBRE`), no letras sueltas en el código.

## Leyes UX aplicadas (mantenerlas en pantallas nuevas)

| Ley | Cómo se aplica |
|---|---|
| Hick (menos opciones, decisión más rápida) | Un solo botón primario por zona ("Subir informe de visita"); el resto secundario o de texto. Buscador general de organizaciones ancho, con lupa, justo debajo de las pestañas (recomendado y aceptado: no al lado de "Centrales"), y buscador en tablas largas (8+ filas). |
| Fitts (objetivos grandes y cercanos) | Todo lo clicable mide mínimo 44 px (`--alto-toque`). Filas de tabla y tarjetas completas son clicables. |
| Jakob (lo familiar) | Pestañas, tablas y modales con patrones conocidos. Escape cierra ventanas. Navegación: enlace pequeño "← Volver" y debajo, en letra pequeña, SOLO el nombre del lugar actual (en el inicio, "Centrales"). Nunca la ruta completa ni migas numeradas (la usuaria lo pidió así). Barra superior (navbar) azul noche, delgada y del mismo ancho que el contenido (no de borde a borde), con el título, el correo del usuario y "Cerrar sesión" (pedido de la usuaria; ya no hay pie de página). |
| Miller / fragmentación | Campos agrupados en secciones plegables; solo se abren las que tienen datos. |
| Gradiente de meta / Zeigarnik | Cada sección de la ficha muestra cuántos campos tienen dato ("3 de 9"). Sin barras de progreso: la usuaria las pidió quitar. |
| Umbral de Doherty (respuesta < 400 ms) | La pantalla cambia al instante y el guardado va por detrás con indicador "Guardando… / Cambios guardados". "Leyendo el informe…" mientras procesa el PDF. pdfjs y xlsx se cargan solo al usarlos (`import()`), para que la app abra rápido. |
| Pico-final | Mensaje de éxito al terminar de guardar un informe, con cuántos campos y dónde. |
| Von Restorff | El botón primario es el único con color sólido. |
| Vista general primero | La pantalla de inicio (centrales) muestra arriba el resumen del mes en cifras grandes: organizaciones, centrales y municipios (elegido por la usuaria). |
| Proximidad (herramientas) | Franja blanca con dos grupos: a la izquierda lo del mes (selector + "＋ Agregar mes" discreto), a la derecha "Subir informe" (Descargar Excel va junto al lugar actual). |
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

## Ortografía de los datos

- Se corrige al CARGAR, en `src/domain/CorrectorOrtografia.js` (un solo lugar con todas las reglas); el
  `meses.json` conserva lo que trae el Excel. Aplica a todos los meses (también los agregados desde la
  app) y a los cambios guardados en listas (ej. "Si" → "Sí").
- Criterio RAE: nombres propios (centrales, municipios, organizaciones, módulos, líneas de inversión)
  con mayúscula en palabras importantes; valores comunes de listas solo con mayúscula inicial
  ("En riesgo"); tildes ("Sí", "Río", "Chucurí"); sin espacios dobles; "N.º" y no "No." para número.
- Los textos libres (resúmenes, observaciones) solo se limpian de espacios: no se reescribe lo que
  escribió cada persona.
- Para una corrección nueva: agregarla al mapa de su columna en `CorrectorOrtografia`, no en otro lado.
- `meses.json`: se corrigió a mano el municipio "," de 5 organizaciones de julio (eran de Concepción).

## Convenciones de código

- Nombres en español, claros: `organizacionesDe`, `guardarCampo`, no `getData`.
- Un componente por archivo, nombre del archivo = nombre del componente.
- Un comentario corto arriba de cada clase/componente que diga para qué sirve.
- Antes de terminar un cambio: `npm run build` sin errores.

## Pendientes

- Marzo (Mes#1) no está cargado: su sección C tiene columnas distintas.
- Mapeo "Acompañamiento Social" → sección E es provisional; confirmar lista real de tipos de intervención.
- Acciones realizadas y recomendaciones van juntas a Observaciones; confirmar destino.
- Por confirmar con la organización: Excel con el formato oficial (encabezados combinados y colores)
  para enviar a ISAGEN; roles (¿hay personas que solo consultan?); correos de los administradores.
- Resumen de varios informes con IA: solo si Socya lo autoriza (sale información a un servicio externo).
- `meses.json` (~1 MB) va dentro del paquete principal. Si crece, cargarlo con `import()`.
