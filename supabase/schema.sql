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


-- 4. Meses abiertos desde la app (noviembre 2026 en adelante). Los meses del Excel original
--    (abril a octubre 2026) viven dentro de la app y no van aquí.
create table if not exists meses (
  clave text primary key,            -- '2026-11'
  anio int not null,
  numero int not null check (numero between 1 and 12),
  etiqueta text not null,            -- 'Noviembre 2026'
  nombre_hoja text not null,         -- 'Mes#9_Noviembre_2026'
  filas jsonb not null,              -- organizaciones del mes con los datos que se copian
  creado_en timestamptz default now()
);

-- Se puede leer y crear, pero no cambiar ni borrar un mes desde la app
grant select, insert on table meses to authenticated;
alter table meses enable row level security;

drop policy if exists "leer meses" on meses;
drop policy if exists "crear meses" on meses;
create policy "leer meses" on meses for select to authenticated using (true);
create policy "crear meses" on meses for insert to authenticated with check (true);

-- 5. Cambios en vivo: avisa a las demás personas conectadas cuando alguien guarda algo
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'registros') then
    alter publication supabase_realtime add table registros;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'meses') then
    alter publication supabase_realtime add table meses;
  end if;
end $$;

