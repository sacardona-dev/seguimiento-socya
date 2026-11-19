-- Historial de cambios: quién cambió qué, cuándo, con el valor de antes y el de después.
-- Lo escribe la base de datos sola (triggers), así nadie se lo puede saltar ni editar desde la app.
-- Solo lo pueden LEER las personas de la tabla `administradores`.
-- Requiere haber corrido antes schema.sql.
-- Ejecutar en Supabase: SQL Editor > New query > Run. Se puede correr más de una vez sin error.

-- 1. Quiénes son administradores (por correo, en minúscula). Para agregar uno: ver el paso 5.
create table if not exists administradores (
  correo text primary key check (correo = lower(correo)),
  agregado_en timestamptz default now()
);
alter table administradores enable row level security;
-- Sin políticas a propósito: desde la app nadie la lee ni la cambia. Solo se maneja aquí, en Supabase.

-- 2. ¿La persona con sesión es administradora? La app lo pregunta para mostrar o no el botón.
create or replace function es_administrador()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.administradores where correo = lower(auth.jwt() ->> 'email')
  );
$$;
revoke all on function es_administrador() from public, anon;
grant execute on function es_administrador() to authenticated;

-- 3. Tabla del historial. Una fila por cada cambio.
create table if not exists historial (
  id bigint generated always as identity primary key,
  fecha timestamptz not null default now(),
  usuario uuid,
  correo text,                -- quién lo hizo ('Panel de Supabase' si se cambió directo en Supabase)
  operacion text not null,    -- INSERT, UPDATE o DELETE
  tabla text not null,        -- 'registros' (campos) o 'meses' (meses agregados)
  mes text,
  row_id int,                 -- organización (fila del Excel)
  col text,                   -- columna del Excel ('Z', o 'Z_2' para la segunda fecha)
  valor_antes text,
  valor_despues text
);
create index if not exists historial_fecha on historial (fecha desc);

grant select on table historial to authenticated;
alter table historial enable row level security;
drop policy if exists "solo administradores" on historial;
create policy "solo administradores" on historial for select to authenticated using (public.es_administrador());
-- No hay permiso de insertar, cambiar ni borrar el historial: solo los triggers escriben en él.

-- 4. Triggers: cada vez que se guarda, cambia o borra algo, se anota en el historial
create or replace function registrar_historial()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  quien text := coalesce(auth.jwt() ->> 'email', 'Panel de Supabase');
begin
  if tg_table_name = 'registros' then
    -- Guardar el mismo valor otra vez no es un cambio
    if tg_op = 'UPDATE' and new.valor is not distinct from old.valor then
      return null;
    end if;
    insert into public.historial (usuario, correo, operacion, tabla, mes, row_id, col, valor_antes, valor_despues)
    values (
      auth.uid(), quien, tg_op, 'registros',
      coalesce(new.mes, old.mes), coalesce(new.row_id, old.row_id), coalesce(new.col, old.col),
      case when tg_op = 'INSERT' then null else old.valor end,
      case when tg_op = 'DELETE' then null else new.valor end
    );
  elsif tg_table_name = 'meses' then
    insert into public.historial (usuario, correo, operacion, tabla, mes, valor_antes, valor_despues)
    values (
      auth.uid(), quien, tg_op, 'meses',
      coalesce(new.clave, old.clave),
      case when tg_op = 'INSERT' then null else old.etiqueta end,
      case when tg_op = 'DELETE' then null else new.etiqueta end
    );
  end if;
  return null;
end;
$$;

drop trigger if exists registros_historial on registros;
create trigger registros_historial
  after insert or update or delete on registros
  for each row execute function registrar_historial();

drop trigger if exists meses_historial on meses;
create trigger meses_historial
  after insert or update or delete on meses
  for each row execute function registrar_historial();

-- 5. Agregar administradores: cambia el correo, quita los dos guiones del inicio y corre SOLO esa línea.
--    Para quitar uno: delete from administradores where correo = 'correo@socya.org.co';
-- insert into administradores (correo) values ('correo@socya.org.co') on conflict do nothing;
