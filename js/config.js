/**
 * Substitua os valores pelos dados do seu projeto Supabase.
 * A chave publishable (ou anon legada) pode ficar no front-end; ela não é um
 * segredo. A segurança das operações é feita pelas políticas RLS do Supabase.
 */
export const SUPABASE_URL = "https://thyxhystomblrimokbxi.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_vgMlqThxJJUydyn1wDQiMA_mF4VqYp8";

export const STORAGE_BUCKET = "toys_images";

// Informe somente os dígitos do WhatsApp comercial, incluindo DDI e DDD.
// Exemplo: 5585XXXXXXXXX. Enquanto estiver vazio, o CTA de compra não aparece.
export const STORE_WHATSAPP_NUMBER = "5581993369736";

export function isSupabaseConfigured() {
  const url = SUPABASE_URL.trim();
  const key = SUPABASE_PUBLISHABLE_KEY.trim();

  return (
    /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) &&
    (key.startsWith("sb_publishable_") || key.startsWith("eyJ"))
  );
}
