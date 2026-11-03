// Punto único donde se crean los servicios. Las pantallas importan desde aquí,
// nunca crean clientes ni repositorios por su cuenta.
import { supabase } from '../config/supabaseClient';
import { AuthService } from './AuthService';
import { RepositorioSupabase } from './RepositorioSupabase';
import { RepositorioLocal } from './RepositorioLocal';
import { LectorPdf } from './LectorPdf';
import { ExportadorExcel } from './ExportadorExcel';

export const authService = new AuthService(supabase);
export const repositorio = supabase ? new RepositorioSupabase(supabase) : new RepositorioLocal();
export const lectorPdf = new LectorPdf();
export const exportadorExcel = new ExportadorExcel();
