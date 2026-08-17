/* ============================================================
   SUPABASE-CONFIG.JS
   Inicializa o cliente Supabase usado em todo o sistema.
   >>> SUBSTITUA os valores abaixo pelas credenciais do SEU
   projeto Supabase (Project Settings > API). <<<
   ============================================================ */

// URL do projeto Supabase (ex: https://xxxxx.supabase.co)
const SUPABASE_URL = "https://awicyopjfjawjngeeokt.supabase.co";

// Chave pública "anon" (segura para uso no frontend)
const SUPABASE_ANON_KEY = "sb_publishable_tAXDcwTZzirZmWdM-e9hww_Sl30fTwE";

// Cria a instância global do cliente Supabase.
// A biblioteca @supabase/supabase-js precisa estar carregada via CDN
// antes deste arquivo (ver tag <script> no <head> de cada página).
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exporta para uso nos demais módulos (via window, pois usamos <script> puro, sem bundler)
window.db = supabaseClient;
