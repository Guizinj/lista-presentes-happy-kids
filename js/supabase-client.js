import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "./config.js";

function createSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const createClient = window.supabase?.createClient;

  if (!createClient) {
    throw new Error(
      "Não foi possível carregar a biblioteca do Supabase pelo CDN oficial.",
    );
  }

  return createClient(SUPABASE_URL.trim(), SUPABASE_PUBLISHABLE_KEY.trim());
}

// Esta é a única instância do Supabase usada pela aplicação.
export const supabase = createSupabaseClient();
