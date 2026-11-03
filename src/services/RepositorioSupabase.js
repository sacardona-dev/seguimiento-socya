import { RepositorioRegistros } from './RepositorioRegistros';

/** Guarda en la tabla `registros` de Supabase. Lo ve todo el equipo. */
export class RepositorioSupabase extends RepositorioRegistros {
  static TABLA = 'registros';
  #cliente;

  constructor(cliente) {
    super();
    this.#cliente = cliente;
  }

  get esCompartido() {
    return true;
  }

  async cargarTodo() {
    const { data, error } = await this.#cliente
      .from(RepositorioSupabase.TABLA)
      .select('*'); // '*' para no fallar si aún no existen las columnas de autoría (supabase/autoria.sql)
    if (error) throw error;

    return data.reduce((registros, r) => RepositorioRegistros.agregar(registros, {
      mes: r.mes, rowId: r.row_id, col: r.col, valor: r.valor, origen: r.origen,
      autor: r.actualizado_por_correo, fecha: r.actualizado_en,
    }), {});
  }

  async guardarCampo({ mes, rowId, col, valor, origen }) {
    const { error } = await this.#cliente.from(RepositorioSupabase.TABLA).upsert(
      // Si se activa supabase/autoria.sql, el trigger reemplaza la fecha y anota quién
      { mes, row_id: rowId, col, valor, origen, actualizado_en: new Date().toISOString() },
      { onConflict: 'mes,row_id,col' }
    );
    if (error) throw error;
  }
}
