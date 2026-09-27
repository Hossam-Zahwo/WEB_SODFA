-- SODFA 2026-09-27 — WhatsApp checkout + Series → Models hierarchy
-- Run this file once in Supabase SQL Editor.

-- ============================================================
-- 1) Fix the order-number sequence error
-- ============================================================
create sequence if not exists public.order_number_seq
  start with 1000 increment by 1 minvalue 1 no cycle;

-- ============================================================
-- 2) Store WhatsApp receiving number (single source of truth)
-- ============================================================
create table if not exists public.store_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

grant select on public.store_settings to anon, authenticated;
grant insert, update, delete on public.store_settings to authenticated;
alter table public.store_settings enable row level security;

drop policy if exists "store_settings_public_read" on public.store_settings;
create policy "store_settings_public_read" on public.store_settings
for select to anon, authenticated using (true);

drop policy if exists "store_settings_admin_insert" on public.store_settings;
create policy "store_settings_admin_insert" on public.store_settings
for insert to authenticated with check (public.is_admin());

drop policy if exists "store_settings_admin_update" on public.store_settings;
create policy "store_settings_admin_update" on public.store_settings
for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "store_settings_admin_delete" on public.store_settings;
create policy "store_settings_admin_delete" on public.store_settings
for delete to authenticated using (public.is_admin());

insert into public.store_settings(key, value)
values ('whatsapp_order_number', '201100090629')
on conflict (key) do nothing;

-- ============================================================
-- 3) Product series
-- ============================================================
create table if not exists public.product_series (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  name_en text not null,
  image_url text,
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.product_series to anon, authenticated;
grant insert, update, delete on public.product_series to authenticated;
alter table public.product_series enable row level security;

drop policy if exists "product_series_public_read" on public.product_series;
create policy "product_series_public_read" on public.product_series
for select to anon, authenticated using (true);

drop policy if exists "product_series_admin_insert" on public.product_series;
create policy "product_series_admin_insert" on public.product_series
for insert to authenticated with check (public.is_admin());

drop policy if exists "product_series_admin_update" on public.product_series;
create policy "product_series_admin_update" on public.product_series
for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_series_admin_delete" on public.product_series;
create policy "product_series_admin_delete" on public.product_series
for delete to authenticated using (public.is_admin());

-- ============================================================
-- 4) Link every model to exactly one series
-- ============================================================
alter table public.product_models add column if not exists series_id uuid;

insert into public.product_series(slug, name_ar, name_en)
values ('legacy-series', 'سلسلة قديمة', 'Legacy Series')
on conflict (slug) do nothing;

update public.product_models
set series_id = (select id from public.product_series where slug = 'legacy-series')
where series_id is null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'product_models_series_fk') then
    alter table public.product_models
      add constraint product_models_series_fk
      foreign key (series_id) references public.product_series(id) on update cascade on delete restrict;
  end if;
end $$;

alter table public.product_models alter column series_id set not null;
create index if not exists product_models_series_id_idx on public.product_models(series_id);

-- ============================================================
-- 5) Series image storage
-- ============================================================
insert into storage.buckets(id, name, public)
values ('product-series-images', 'product-series-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product_series_images_public_read" on storage.objects;
create policy "product_series_images_public_read" on storage.objects
for select to anon, authenticated
using (bucket_id = 'product-series-images');

drop policy if exists "product_series_images_admin_insert" on storage.objects;
create policy "product_series_images_admin_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'product-series-images' and public.is_admin());

drop policy if exists "product_series_images_admin_update" on storage.objects;
create policy "product_series_images_admin_update" on storage.objects
for update to authenticated
using (bucket_id = 'product-series-images' and public.is_admin())
with check (bucket_id = 'product-series-images' and public.is_admin());

drop policy if exists "product_series_images_admin_delete" on storage.objects;
create policy "product_series_images_admin_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'product-series-images' and public.is_admin());

-- ============================================================
-- 6) Helpful indexes for filtering
-- ============================================================
create index if not exists products_model_id_idx on public.products(model_id);
create index if not exists product_variants_model_id_idx on public.product_variants(model_id);

-- Keep updated_at current for series edits.
create or replace function public.set_product_series_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists product_series_updated_at on public.product_series;
create trigger product_series_updated_at before update on public.product_series
for each row execute function public.set_product_series_updated_at();

-- NOTE: the existing create_public_order RPC is intentionally not replaced here.
-- The missing order_number_seq is recreated above so any existing nextval(...) call works.
