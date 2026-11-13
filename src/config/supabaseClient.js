import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const clave = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Se lee ANTES de crear el cliente: Supabase borra de la dirección los datos del enlace de
// recuperación al procesarlos, y así la app sabe que debe pedir la contraseña nueva.
export const llegoPorRecuperacion = typeof window !== 'undefined' && /type=recovery/.test(window.location.hash);

// Si no hay .env, el cliente queda en null y la app trabaja en modo local (solo este navegador).
export const supabase = url && clave ? createClient(url, clave) : null;
