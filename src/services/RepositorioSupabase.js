import { RepositorioRegistros } from './RepositorioRegistros';

/** Guarda en Supabase (tablas `registros`, `meses` y `reuniones`). Lo ve todo el equipo, en vivo. */
export class RepositorioSupabase extends RepositorioRegistros {
  static TABLA = 'registros';
  static TABLA_MESES = 'meses';
  static TABLA_REUNIONES = 'reuniones';
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

    return data.reduce((registros, fila) => RepositorioRegistros.agregar(registros, RepositorioSupabase.#aCambio(fila)), {});
  }

  async guardarCampo({ mes, rowId, col, valor, origen }) {
    const { error } = await this.#cliente.from(RepositorioSupabase.TABLA).upsert(
      // Si se activa supabase/autoria.sql, el trigger reemplaza la fecha y anota quién
      { mes, row_id: rowId, col, valor, origen, actualizado_en: new Date().toISOString() },
      { onConflict: 'mes,row_id,col' }
    );
    if (error) throw error;
  }

  async cargarMeses() {
    const { data, error } = await this.#cliente.from(RepositorioSupabase.TABLA_MESES).select('*');
    if (error) throw error;
    return data.map(RepositorioSupabase.#aMes);
  }

  async guardarMes(mes) {
    const { error } = await this.#cliente.from(RepositorioSupabase.TABLA_MESES).insert({
      clave: mes.clave, anio: mes.anio, numero: mes.numero,
      etiqueta: mes.label, nombre_hoja: mes.nombreHoja, filas: mes.rows,
    });
    if (error) throw error;
  }

  async cargarReuniones() {
    const { data, error } = await this.#cliente.from(RepositorioSupabase.TABLA_REUNIONES).select('*');
    if (error) throw error;
    return data;
  }

  async guardarReunion(reunion) {
    const { data, error } = await this.#cliente.from(RepositorioSupabase.TABLA_REUNIONES)
      .insert(reunion).select().single();
    if (error) throw error;
    return data;
  }

  async actualizarReunion(id, cambios) {
    const { data, error } = await this.#cliente.from(RepositorioSupabase.TABLA_REUNIONES)
      .update(cambios).eq('id', id).select().single();
    if (error) throw error; // también falla si no es de quien la registró (la base de datos no la deja cambiar)
    return data;
  }

  async borrarReunion(id) {
    const { data, error } = await this.#cliente.from(RepositorioSupabase.TABLA_REUNIONES)
      .delete().eq('id', id).select();
    if (error) throw error;
    if (!data.length) throw new Error('No se borró: la reunión no existe o no la registraste tú.');
  }

  escuchar({ alCambiarCampo, alCrearMes, alCrearReunion, alCambiarReunion, alBorrarReunion }) {
    const canal = this.#cliente.channel(`seguimiento-${Math.random().toString(36).slice(2)}`); // nombre único por conexión
    if (alCambiarCampo) {
      canal.on('postgres_changes', { event: '*', schema: 'public', table: RepositorioSupabase.TABLA },
        ({ new: fila }) => { if (fila?.mes) alCambiarCampo(RepositorioSupabase.#aCambio(fila)); });
    }
    if (alCrearMes) {
      canal.on('postgres_changes', { event: 'INSERT', schema: 'public', table: RepositorioSupabase.TABLA_MESES },
        ({ new: fila }) => alCrearMes(RepositorioSupabase.#aMes(fila)));
    }
    if (alCrearReunion) {
      canal.on('postgres_changes', { event: 'INSERT', schema: 'public', table: RepositorioSupabase.TABLA_REUNIONES },
        ({ new: fila }) => alCrearReunion(fila));
    }
    if (alCambiarReunion) {
      canal.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: RepositorioSupabase.TABLA_REUNIONES },
        ({ new: fila }) => alCambiarReunion(fila));
    }
    if (alBorrarReunion) {
      canal.on('postgres_changes', { event: 'DELETE', schema: 'public', table: RepositorioSupabase.TABLA_REUNIONES },
        ({ old: fila }) => { if (fila?.id) alBorrarReunion(fila.id); });
    }
    canal.subscribe();
    return () => { this.#cliente.removeChannel(canal); };
  }

  static #aCambio(fila) {
    return {
      mes: fila.mes, rowId: fila.row_id, col: fila.col, valor: fila.valor, origen: fila.origen,
      autor: fila.actualizado_por_correo, fecha: fila.actualizado_por_correo ? fila.actualizado_en : undefined,
    };
  }

  static #aMes(fila) {
    return {
      clave: fila.clave, anio: fila.anio, numero: fila.numero,
      label: fila.etiqueta, nombreHoja: fila.nombre_hoja, rows: fila.filas,
    };
  }
}
