-- Ejecutar en Supabase: SQL Editor > New query > Run
-- Se puede correr más de una vez sin error: cada paso revisa si ya existe.

-- 1. Tabla donde se guarda cada cambio del equipo (un valor por mes, organización y columna)
create table if not exists registros (
  mes text not null,
  row_id int not null,
  col text not null,
  valor text,
  origen text,
  actualizado_en timestamptz default now(),
  primary key (mes, row_id, col)
);

-- 2. Permiso para que la app la use, solo con sesión iniciada (necesario si el proyecto
--    se creó con "Automatically expose new tables" desmarcado). Visitantes sin sesión: nada.
grant select, insert, update on table registros to authenticated;

-- 3. Seguridad por filas: sin una política que lo permita, nadie ve ni cambia nada
alter table registros enable row level security;

drop policy if exists "leer" on registros;
drop policy if exists "insertar" on registros;
drop policy if exists "actualizar" on registros;

create policy "leer" on registros for select to authenticated using (true);
create policy "insertar" on registros for insert to authenticated with check (true);
create policy "actualizar" on registros for update to authenticated using (true) with check (true);

