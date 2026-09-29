import { createClient } from "@supabase/supabase-js";

// Chave publishable/anon — segura para ficar no código do cliente.
export const SUPABASE_URL =
  import.meta.env["VITE_SUPABASE_URL"] ?? "https://kvbidsfnisegtqjagsld.supabase.co";
export const SUPABASE_ANON_KEY =
  import.meta.env["VITE_SUPABASE_ANON_KEY"] ?? "sb_publishable_3YjKTF1rODb9lczyeRillA_Sm1BgP5g";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
