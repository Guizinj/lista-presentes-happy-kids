-- Happy Kids — schema inicial, funções públicas e políticas de segurança.
-- Execute este arquivo no SQL Editor do projeto Supabase.
-- Ele não cria usuárias: veja supabase/SETUP.md após executar o schema.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'seller' check (role in ('seller')),
  created_at timestamptz not null default now()
);

create table if not exists public.gift_lists (
  id uuid primary key default gen_random_uuid(),
  child_name text not null check (char_length(trim(child_name)) between 2 and 100),
  event_date date not null,
  public_slug text not null unique
    default replace(gen_random_uuid()::text, '-', '')
    check (public_slug ~ '^[a-f0-9]{32}$'),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gift_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.gift_lists (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 160),
  price numeric(10, 2) check (price is null or price >= 0),
  image_url text not null,
  image_path text not null,
  status text not null default 'available'
    check (status in ('available', 'sold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gift_items_list_id_idx on public.gift_items (list_id);
create index if not exists gift_lists_public_slug_idx on public.gift_lists (public_slug);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists gift_lists_set_updated_at on public.gift_lists;
create trigger gift_lists_set_updated_at
before update on public.gift_lists
for each row execute function public.set_updated_at();

drop trigger if exists gift_items_set_updated_at on public.gift_items;
create trigger gift_items_set_updated_at
before update on public.gift_items
for each row execute function public.set_updated_at();

-- Esta função roda como dona das tabelas e serve somente às políticas RLS.
create or replace function public.is_seller()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'seller'
  );
$$;

revoke all on function public.is_seller() from public;
grant execute on function public.is_seller() to authenticated;

-- Funções RPC: são a única superfície de leitura para convidados.
create or replace function public.get_public_gift_list(p_list_slug text)
returns table (
  id uuid,
  child_name text,
  event_date date
)
language sql
stable
security definer
set search_path = ''
as $$
  select gift_lists.id, gift_lists.child_name, gift_lists.event_date
  from public.gift_lists
  where gift_lists.public_slug = p_list_slug
    and gift_lists.is_published = true
  limit 1;
$$;

create or replace function public.get_public_gift_items(p_list_slug text)
returns table (
  id uuid,
  title text,
  price numeric,
  image_url text,
  status text
)
language sql
stable
security definer
set search_path = ''
as $$
  select gift_items.id,
         gift_items.title,
         gift_items.price,
         gift_items.image_url,
         gift_items.status
  from public.gift_items
  inner join public.gift_lists on gift_lists.id = gift_items.list_id
  where gift_lists.public_slug = p_list_slug
    and gift_lists.is_published = true
  order by gift_items.created_at asc;
$$;

revoke all on function public.get_public_gift_list(text) from public;
revoke all on function public.get_public_gift_items(text) from public;
grant execute on function public.get_public_gift_list(text) to anon, authenticated;
grant execute on function public.get_public_gift_items(text) to anon, authenticated;

-- Privilégios mínimos: o papel authenticated só recebe acesso após passar RLS.
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.gift_lists from anon, authenticated;
revoke all on table public.gift_items from anon, authenticated;
grant select on table public.profiles to authenticated;
grant select, insert, update, delete on table public.gift_lists to authenticated;
grant select, insert, update, delete on table public.gift_items to authenticated;

alter table public.profiles enable row level security;
alter table public.gift_lists enable row level security;
alter table public.gift_items enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Sellers manage gift lists" on public.gift_lists;
create policy "Sellers manage gift lists"
on public.gift_lists
for all
to authenticated
using ((select public.is_seller()))
with check ((select public.is_seller()));

drop policy if exists "Sellers manage gift items" on public.gift_items;
create policy "Sellers manage gift items"
on public.gift_items
for all
to authenticated
using ((select public.is_seller()))
with check ((select public.is_seller()));

-- Fotos são públicas para que o catálogo abra rapidamente, mas apenas
-- vendedoras autenticadas podem administrar objetos no bucket.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'toys_images',
  'toys_images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

revoke all on table storage.objects from anon, authenticated;
grant select, insert, update, delete on table storage.objects to authenticated;

drop policy if exists "Sellers can inspect toy images" on storage.objects;
create policy "Sellers can inspect toy images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'toys_images'
  and (storage.foldername(name))[1] = 'gift-lists'
  and (select public.is_seller())
);

drop policy if exists "Sellers can upload toy images" on storage.objects;
create policy "Sellers can upload toy images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'toys_images'
  and (storage.foldername(name))[1] = 'gift-lists'
  and (select public.is_seller())
);

drop policy if exists "Sellers can update toy images" on storage.objects;
create policy "Sellers can update toy images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'toys_images'
  and (storage.foldername(name))[1] = 'gift-lists'
  and (select public.is_seller())
)
with check (
  bucket_id = 'toys_images'
  and (storage.foldername(name))[1] = 'gift-lists'
  and (select public.is_seller())
);

drop policy if exists "Sellers can delete toy images" on storage.objects;
create policy "Sellers can delete toy images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'toys_images'
  and (storage.foldername(name))[1] = 'gift-lists'
  and (select public.is_seller())
);
