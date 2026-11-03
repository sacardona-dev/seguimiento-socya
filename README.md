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
2. En el panel de Supabase abre **SQL Editor**, pega el contenido de `supabase/schema.sql` y ejecútalo.
3. En **Authentication > Users**, crea un usuario por persona con correo y contraseña. Desactiva el registro público en **Authentication > Providers** para que nadie más pueda crear cuentas.
4. En **Project Settings > API** copia la URL y la clave `anon public`.
5. Copia `.env.example` como `.env` y pega esos dos valores.
6. Reinicia `npm run dev`. Ahora aparece la pantalla de inicio de sesión.

## 3. Publicar en internet

1. Sube esta carpeta a un repositorio privado de GitHub.
2. En https://vercel.com crea un proyecto desde ese repositorio.
3. En **Settings > Environment Variables** agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los mismos valores del `.env`.
4. Vercel publica la app en un enlace. Cada cambio que subas a GitHub se publica solo.

## Estructura

- `src/config/esquemaExcel.js`: qué columnas del Excel maneja la app, sus nombres y las opciones de las listas.
- `src/domain/`: clases con las reglas de negocio (`Mes`, `Organizacion`, `InformeVisita`).
- `src/services/`: clases que hablan con el exterior (Supabase o navegador, inicio de sesión, lectura del PDF, Excel).
- `src/hooks/`: estado de React reutilizable (sesión, registros, navegación).
- `src/components/` y `src/pages/`: pantallas y componentes.
- `src/styles/`: colores y tipografía de Socya (`tokens.css`) y estilos.
- `src/data/meses.json`: datos del Excel por mes (abril a octubre 2026) y reuniones de equipo.

Las reglas de organización, POO y leyes UX están en `CLAUDE.md`.

## Reglas que sigue la app

- Solo se guardan campos que existen en el Excel. El resto del informe se ignora.
- No se guardan celulares, cédulas, firmas ni fotos del informe.
- Nada se guarda hasta que la persona confirma.
- Cada dato indica si viene del informe ("Del informe") o se escribió a mano ("Manual").

## Pendientes

- Marzo (Mes#1) no está cargado porque su sección C tiene columnas distintas.
- El mapeo del tipo "Acompañamiento Social" a la sección E es provisional. Hay que confirmar la lista real de tipos de intervención.
- Acciones realizadas y recomendaciones van juntas a Observaciones. Confirmar destino.
