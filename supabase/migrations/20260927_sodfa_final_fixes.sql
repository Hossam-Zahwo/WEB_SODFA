-- SODFA FINAL FIXES
-- 1) Fix missing order_number_seq used by create_public_order.
-- 2) Add a small public storefront settings table for the WhatsApp receiving number.

create sequence if not exists public.order_number_seq
  start with 1000
  increment by 1
  minvalue 1
  no cycle;

create table if not exists public.store_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

grant select on table public.store_settings to anon, authenticated;
grant insert, update, delete on table public.store_settings to authenticated;

alter table public.store_settings enable row level security;

drop policy if exists "store_settings_public_read" on public.store_settings;
create policy "store_settings_public_read"
on public.store_settings
for select
to anon, authenticated
using (true);

drop policy if exists "store_settings_admin_insert" on public.store_settings;
create policy "store_settings_admin_insert"
on public.store_settings
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "store_settings_admin_update" on public.store_settings;
create policy "store_settings_admin_update"
on public.store_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "store_settings_admin_delete" on public.store_settings;
create policy "store_settings_admin_delete"
on public.store_settings
for delete
to authenticated
using (public.is_admin());

insert into public.store_settings (key, value)
values ('whatsapp_order_number', '201093384952')
on conflict (key) do nothing;

-- If the existing create_public_order function uses nextval('public.order_number_seq'),
-- creating the sequence above is enough to remove the reported:
-- relation "public.order_number_seq" does not exist
-- error without replacing your existing order RPC.
