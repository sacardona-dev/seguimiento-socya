-- OPCIONAL, PENDIENTE DE CONFIRMAR: registrar quién hizo cada cambio.
-- No correr hasta que se confirme que se necesita. Requiere haber corrido antes schema.sql.
-- Ejecutar en Supabase: SQL Editor > New query > Run. Se puede correr más de una vez sin error.
-- La app no necesita cambios: en cuanto existan estas columnas, muestra "Editado por ..." sola.

-- 1. Columnas para el autor del último cambio
alter table registros add column if not exists actualizado_por uuid references auth.users (id) on delete set null;
alter table registros add column if not exists actualizado_por_correo text;

-- 2. Antes de guardar, la base de datos anota quién y cuándo con el usuario de la sesión.
--    Lo hace la base de datos (no la app) para que nadie guarde a nombre de otra persona.
create or replace function registrar_autor()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_por := auth.uid();
  new.actualizado_por_correo := auth.jwt() ->> 'email';
  new.actualizado_en := now();
  return new;
end;
$$;

drop trigger if exists registros_autor on registros;
create trigger registros_autor
  before insert or update on registros
  for each row execute function registrar_autor();
