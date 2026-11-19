# Seguimiento mensual · ISAGEN SOCYA

Aplicación para llevar el seguimiento mensual de las organizaciones comunitarias. Reemplaza la hoja de Excel por pantallas por central, municipio y organización. Los informes de visita en PDF alimentan solo los campos que existen en el Excel.

## 1. Probar en tu computador (sin nube)

```bash
npm install
npm run dev
```

Abre el enlace que aparece (normalmente http://localhost:5173). Sin configurar Supabase, la app guarda los datos en el navegador de ese computador. Sirve para probarla, no para trabajo en equipo.

## 2. Configurar la nube (trabajo en equipo)

1. Crea un proyecto gratis en https://supabase.com.
2. En el panel de Supabase abre **SQL Editor**, pega el contenido de `supabase/schema.sql` y ejecútalo. Se puede volver a correr sin error cada vez que el archivo cambie.
3. En **Authentication > Users**, crea un usuario por persona con correo y contraseña. Desactiva el registro público en **Authentication > Providers** para que nadie más pueda crear cuentas.
4. En **Project Settings > API** copia la URL y la clave `anon public`.
5. Copia `.env.example` como `.env` y pega esos dos valores.
6. Reinicia `npm run dev`. Ahora aparece la pantalla de inicio de sesión.
7. **Historial de cambios** (quién cambió qué y cuándo): en **SQL Editor** corre `supabase/historial.sql`.
   Luego agrega a cada administrador con su correo en minúscula:
   `insert into administradores (correo) values ('correo@socya.org.co') on conflict do nothing;`
   Solo a ellos les aparece el botón "Historial de cambios" en la barra de arriba.

## 3. Publicar en internet (Vercel)

1. Sube los cambios a GitHub (`git push`).
2. Entra a https://vercel.com con tu cuenta de GitHub y elige **Add New → Project**.
3. Importa el repositorio `seguimiento-socya`. Vercel detecta que es Vite; no cambies nada.
4. En **Environment Variables** agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los mismos valores del `.env`.
5. Presiona **Deploy**. Al terminar te da un enlace (ej. `https://seguimiento-socya.vercel.app`). Cada cambio que subas a GitHub se publica solo.
6. En Supabase, **Authentication → URL Configuration**:
   - **Site URL**: el enlace de Vercel.
   - **Redirect URLs**: agrega el enlace de Vercel y `http://localhost:5173`.
   Sin esto, el correo de "¿Olvidaste tu contraseña?" lleva a una dirección equivocada.

## Estructura

- `src/config/esquemaExcel.js`: qué columnas del Excel maneja la app, sus nombres y las opciones de las listas.
- `src/domain/`: clases con las reglas de negocio (`Mes`, `Organizacion`, `InformeVisita`).
- `src/services/`: clases que hablan con el exterior (Supabase o navegador, inicio de sesión, lectura del PDF, Excel).
- `src/hooks/`: estado de React reutilizable (sesión, registros, navegación).
- `src/components/` y `src/pages/`: pantallas y componentes.
- `src/styles/`: colores y tipografía de Socya (`tokens.css`) y estilos.
- `src/data/meses.json`: datos del Excel por mes (abril a octubre 2026).

Las reglas de organización, POO y leyes UX están en `CLAUDE.md`.

## Reglas que sigue la app

- Solo se guardan campos que existen en el Excel. El resto del informe se ignora.
- No se guardan celulares, cédulas, firmas ni fotos del informe.
- Nada se guarda hasta que la persona confirma.
- Cada dato indica si viene del informe ("Del informe") o se escribió a mano ("Manual").

## Meses nuevos

Cuando empieza un mes que no se ha agregado, aparece junto al selector de Mes el botón **＋ Agregar nuevo mes**. Copia las organizaciones del último mes con sus datos fijos (organización, proyecto, módulo, ICO) y deja en blanco las actividades.

## Pendientes

- Marzo (Mes#1) no está cargado porque su sección C tiene columnas distintas.
- El mapeo del tipo "Acompañamiento Social" a la sección E es provisional. Hay que confirmar la lista real de tipos de intervención.
- Acciones realizadas y recomendaciones van juntas a Observaciones. Confirmar destino.
