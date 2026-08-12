-- Execute este arquivo uma única vez no SQL Editor do Supabase.
-- Ele adiciona o caminho interno necessário para apagar fotos do Storage com
-- segurança quando um brinquedo for removido.

alter table public.gift_items
add column if not exists image_path text;

comment on column public.gift_items.image_path is
  'Caminho interno do arquivo no bucket toys_images, usado para remoção.';
