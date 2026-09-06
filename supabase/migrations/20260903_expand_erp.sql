-- Essa Packages ERP-lite expansion.
-- Safe to run after 20260903_create_quote_admin.sql and safe to re-run.

create sequence if not exists public.customer_display_seq;
create sequence if not exists public.inquiry_display_seq;
create sequence if not exists public.quote_display_seq;
create sequence if not exists public.order_display_seq;
create sequence if not exists public.payment_display_seq;

alter table public.admin_users add column if not exists full_name text not null default '';
alter table public.admin_users add column if not exists role text;
alter table public.admin_users add column if not exists is_active boolean;
alter table public.admin_users add column if not exists updated_at timestamptz not null default now();
update public.admin_users set role = 'admin' where role is null;
update public.admin_users set is_active = true where is_active is null;
alter table public.admin_users alter column role set default 'viewer';
alter table public.admin_users alter column role set not null;
alter table public.admin_users alter column is_active set default false;
alter table public.admin_users alter column is_active set not null;
alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users add constraint admin_users_role_check
  check (role in ('owner', 'admin', 'sales', 'production', 'accounts', 'viewer'));

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  display_id text not null unique default ('CUS-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.customer_display_seq')::text, 4, '0')),
  name text not null,
  company text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  address text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create unique index if not exists customers_email_unique_idx
  on public.customers (lower(email)) where email <> '' and archived_at is null;
create unique index if not exists customers_phone_unique_idx
  on public.customers (regexp_replace(phone, '\\D', '', 'g')) where phone <> '' and archived_at is null;
create index if not exists customers_created_at_idx on public.customers (created_at desc);
create index if not exists customers_company_idx on public.customers (lower(company));

-- Preserve legacy human quote IDs, then add the UUID primary key requested by the ERP.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'quotes' and column_name = 'id' and data_type = 'text'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'quotes' and column_name = 'display_id'
  ) then
    alter table public.quotes rename column id to display_id;
  end if;
end $$;

alter table public.quotes add column if not exists id uuid default gen_random_uuid();
update public.quotes set id = gen_random_uuid() where id is null;
alter table public.quotes alter column id set not null;

do $$
declare
  primary_column text;
begin
  select a.attname into primary_column
  from pg_index i
  join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any(i.indkey)
  where i.indrelid = 'public.quotes'::regclass and i.indisprimary
  limit 1;

  if primary_column is distinct from 'id' then
    alter table public.quotes drop constraint if exists quotes_pkey;
    alter table public.quotes add constraint quotes_pkey primary key (id);
  end if;
end $$;

alter table public.quotes add column if not exists display_id text;
update public.quotes
set display_id = 'QUO-' || to_char(created_at, 'YYYY') || '-' || lpad(nextval('public.quote_display_seq')::text, 4, '0')
where display_id is null or display_id = '';
alter table public.quotes alter column display_id set not null;
alter table public.quotes alter column display_id set default ('QUO-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.quote_display_seq')::text, 4, '0'));
create unique index if not exists quotes_display_id_key on public.quotes (display_id);

alter table public.quotes add column if not exists customer_id uuid references public.customers(id) on delete set null;
alter table public.quotes add column if not exists assigned_to uuid references public.admin_users(user_id) on delete set null;
alter table public.quotes add column if not exists length numeric(10,2);
alter table public.quotes add column if not exists width numeric(10,2);
alter table public.quotes add column if not exists height numeric(10,2);
alter table public.quotes add column if not exists dimension_unit text not null default 'in';
alter table public.quotes add column if not exists material text not null default '';
alter table public.quotes add column if not exists printing text not null default '';
alter table public.quotes add column if not exists colors text not null default '';
alter table public.quotes add column if not exists finish text not null default '';
alter table public.quotes add column if not exists delivery_requirement text not null default '';
alter table public.quotes add column if not exists delivery_date date;
alter table public.quotes add column if not exists delivery_address text not null default '';
alter table public.quotes add column if not exists subtotal numeric(14,2) not null default 0;
alter table public.quotes add column if not exists tax numeric(14,2) not null default 0;
alter table public.quotes add column if not exists delivery_amount numeric(14,2) not null default 0;
alter table public.quotes add column if not exists discount numeric(14,2) not null default 0;
alter table public.quotes add column if not exists total numeric(14,2) not null default 0;
alter table public.quotes add column if not exists expires_at date;
alter table public.quotes add column if not exists accepted_at timestamptz;
alter table public.quotes alter column company drop not null;
alter table public.quotes alter column email drop not null;
alter table public.quotes alter column quantity set default '';

alter table public.quotes drop constraint if exists quotes_status_check;
update public.quotes set status = case status
  when 'Contacted' then 'Reviewing'
  when 'Completed' then 'Accepted'
  when 'Archived' then 'Expired'
  else status
end;
alter table public.quotes add constraint quotes_status_check
  check (status in ('New', 'Reviewing', 'Quoted', 'Awaiting Customer', 'Accepted', 'Rejected', 'Expired'));
alter table public.quotes drop constraint if exists quotes_dimension_unit_check;
alter table public.quotes add constraint quotes_dimension_unit_check check (dimension_unit in ('mm', 'cm', 'in'));
alter table public.quotes drop constraint if exists quotes_amounts_check;
alter table public.quotes add constraint quotes_amounts_check check (
  subtotal >= 0 and tax >= 0 and delivery_amount >= 0 and discount >= 0 and total >= 0
);
create index if not exists quotes_customer_created_idx on public.quotes (customer_id, created_at desc);
create index if not exists quotes_assigned_status_idx on public.quotes (assigned_to, status);
create index if not exists quotes_status_created_idx on public.quotes (status, created_at desc);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  display_id text not null unique default ('INQ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.inquiry_display_seq')::text, 4, '0')),
  customer_id uuid references public.customers(id) on delete set null,
  assigned_to uuid references public.admin_users(user_id) on delete set null,
  converted_quote_id uuid references public.quotes(id) on delete set null,
  status text not null default 'New' check (status in ('New', 'Contacted', 'Follow-up', 'Converted', 'Closed')),
  name text not null,
  company text not null default '',
  phone text not null,
  email text not null default '',
  packaging_type text not null,
  quantity text not null default '',
  requirement text not null default '',
  source text not null default 'Website Inquiry',
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);
create index if not exists inquiries_status_created_idx on public.inquiries (status, created_at desc);
create index if not exists inquiries_customer_created_idx on public.inquiries (customer_id, created_at desc);
create index if not exists inquiries_assigned_status_idx on public.inquiries (assigned_to, status);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null default '',
  description text not null default '',
  image_url text not null default '',
  use_cases text[] not null default '{}',
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);
create index if not exists products_public_order_idx on public.products (is_active, display_order, name);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  display_id text not null unique default ('ORD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_display_seq')::text, 4, '0')),
  customer_id uuid not null references public.customers(id) on delete restrict,
  quote_id uuid unique references public.quotes(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  stage text not null default 'Approved' check (stage in ('Inquiry', 'Quotation', 'Approved', 'Artwork Approval', 'Production', 'Quality Check', 'Ready for Dispatch', 'Dispatched', 'Delivered')),
  product_name text not null default '',
  box_type text not null default '',
  length numeric(10,2),
  width numeric(10,2),
  height numeric(10,2),
  dimension_unit text not null default 'in' check (dimension_unit in ('mm', 'cm', 'in')),
  quantity integer check (quantity is null or quantity > 0),
  material text not null default '',
  ply text not null default '',
  gsm text not null default '',
  printing text not null default '',
  colors text not null default '',
  finish text not null default '',
  delivery_date date,
  delivery_address text not null default '',
  internal_notes text not null default '',
  order_total numeric(14,2) not null default 0 check (order_total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);
create index if not exists orders_stage_created_idx on public.orders (stage, created_at desc);
create index if not exists orders_delivery_active_idx on public.orders (delivery_date, stage) where archived_at is null;
create index if not exists orders_customer_created_idx on public.orders (customer_id, created_at desc);
create index if not exists orders_product_idx on public.orders (product_id);

create table if not exists public.order_activities (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  actor_user_id uuid references public.admin_users(user_id) on delete set null,
  actor_name text not null default 'System',
  action text not null,
  from_stage text,
  to_stage text,
  details text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists order_activities_timeline_idx on public.order_activities (order_id, created_at desc);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  display_id text not null unique default ('PAY-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.payment_display_seq')::text, 4, '0')),
  order_id uuid not null references public.orders(id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),
  payment_date date not null default current_date,
  method text not null,
  reference text not null default '',
  notes text not null default '',
  recorded_by uuid references public.admin_users(user_id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists payments_order_date_idx on public.payments (order_id, payment_date desc, created_at desc);
create index if not exists payments_date_idx on public.payments (payment_date desc);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('inquiry', 'quote', 'order', 'product')),
  entity_id uuid not null,
  storage_path text not null unique,
  file_name text not null,
  file_type text not null default 'application/octet-stream',
  file_size integer check (file_size is null or file_size > 0),
  label text not null default 'Attachment',
  uploaded_by uuid references public.admin_users(user_id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists attachments_entity_idx on public.attachments (entity_type, entity_id, created_at);

create table if not exists public.site_content (
  content_key text primary key,
  section text not null,
  label text not null,
  value text not null default '',
  is_public boolean not null default true,
  updated_by uuid references public.admin_users(user_id) on delete set null,
  updated_at timestamptz not null default now()
);
create index if not exists site_content_section_idx on public.site_content (section, content_key);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('inquiry', 'quote', 'order', 'payment', 'customer', 'product', 'content')),
  entity_id uuid not null,
  actor_user_id uuid references public.admin_users(user_id) on delete set null,
  actor_name text not null default 'System',
  action text not null,
  message text not null,
  created_at timestamptz not null default now()
);
create index if not exists activity_log_recent_idx on public.activity_log (created_at desc);
create index if not exists activity_log_entity_idx on public.activity_log (entity_type, entity_id, created_at desc);

insert into public.products (slug, name, category, description, image_url, use_cases, display_order)
values
  ('fancy-cartons', 'Fancy Cartons', 'Shelf-ready presentation', 'Elevated printed packaging that helps products feel considered and retail-ready.', '/images/fancy-carton-photo.webp', array['Cosmetics', 'Food', 'Gifts'], 10),
  ('master-cartons', 'Master Cartons', 'Storage & distribution', 'Dependable outer packaging planned around handling, stacking, and transport.', '/images/master-boxes-photo.webp', array['FMCG', 'Wholesale', 'Industrial'], 20),
  ('corrugated-cartons', 'Corrugated Cartons', 'Protective structure', 'Protective cartons configured to suit the product and its delivery journey.', '/images/origin-supply-photo.webp', array['E-commerce', 'Electronics', 'Fragile goods'], 30),
  ('printed-cartons', 'Printed Cartons', 'Brand communication', 'Clear, confident print that carries your identity from production to the shelf.', '/images/printed-cartons-photo.webp', array['Retail', 'Pharmaceutical', 'FMCG'], 40),
  ('custom-boxes', 'Custom Boxes', 'Built around your product', 'A made-to-spec format for products that do not fit an off-the-shelf solution.', '/images/custom-rigid-gift-box-photo.webp', array['New launches', 'Special formats', 'Retail'], 50),
  ('retail-packaging', 'Retail Packaging', 'Unboxing & display', 'Presentation-led packaging designed to protect the product and strengthen its first impression.', '/images/bloom-studio-photo.webp', array['Lifestyle', 'Fashion', 'Consumer goods'], 60)
on conflict (slug) do nothing;

insert into public.site_content (content_key, section, label, value, is_public)
values
  ('contact_phone', 'Contact', 'Contact phone', '0345 2801957', true),
  ('contact_whatsapp', 'Contact', 'WhatsApp number', '923452801957', true),
  ('contact_email', 'Contact', 'Contact email', 'imran.essapackages@gmail.com', true),
  ('contact_address', 'Contact', 'Business address', 'Plot No. B-81, Sector 11-E, New Fatima Jinnah Colony, Near Godra, North Karachi', true),
  ('hero_supporting_copy', 'Homepage', 'Hero supporting copy', 'Custom cartons, corrugated boxes, and printed packaging manufactured in Karachi for businesses across Pakistan.', true)
on conflict (content_key) do nothing;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid()) and is_active = true
  );
$$;
revoke all on function public.is_active_admin() from public, anon;
grant execute on function public.is_active_admin() to authenticated, service_role;

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

do $$
declare table_name text;
begin
  foreach table_name in array array['admin_users', 'customers', 'quotes', 'inquiries', 'orders', 'products']
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

create or replace function public.change_order_stage(
  p_order_id uuid,
  p_stage text,
  p_actor_user_id uuid,
  p_actor_name text
)
returns public.orders
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_order public.orders;
  changed_order public.orders;
begin
  select * into current_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if current_order.stage = p_stage then return current_order; end if;

  update public.orders set stage = p_stage where id = p_order_id returning * into changed_order;
  insert into public.order_activities (order_id, actor_user_id, actor_name, action, from_stage, to_stage)
  values (p_order_id, p_actor_user_id, coalesce(nullif(p_actor_name, ''), 'Admin user'), 'Stage changed', current_order.stage, p_stage);
  insert into public.activity_log (entity_type, entity_id, actor_user_id, actor_name, action, message)
  values ('order', p_order_id, p_actor_user_id, coalesce(nullif(p_actor_name, ''), 'Admin user'), 'stage_changed', 'Order moved to ' || p_stage);
  return changed_order;
end;
$$;
revoke all on function public.change_order_stage(uuid, text, uuid, text) from public, anon, authenticated;
grant execute on function public.change_order_stage(uuid, text, uuid, text) to service_role;

-- Exposed tables use explicit grants. Business mutations are server-only.
do $$
declare table_name text;
begin
  foreach table_name in array array['customers', 'inquiries', 'quotes', 'orders', 'order_activities', 'payments', 'attachments', 'products', 'site_content', 'activity_log']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
    execute format('grant select on table public.%I to authenticated', table_name);
    execute format('grant all on table public.%I to service_role', table_name);
    execute format('drop policy if exists "Active admins can read" on public.%I', table_name);
    execute format('create policy "Active admins can read" on public.%I for select to authenticated using ((select public.is_active_admin()))', table_name);
  end loop;
end $$;

revoke all on table public.admin_users from anon, authenticated;
grant select on table public.admin_users to authenticated;
grant all on table public.admin_users to service_role;
drop policy if exists "Admins can view their membership" on public.admin_users;
create policy "Admins can view their membership" on public.admin_users
for select to authenticated
using (user_id = (select auth.uid()) and is_active = true);

grant select on table public.products, public.site_content to anon;
drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products" on public.products
for select to anon using (is_active = true and archived_at is null);
drop policy if exists "Public can view site content" on public.site_content;
create policy "Public can view site content" on public.site_content
for select to anon using (is_public = true);

grant usage, select on all sequences in schema public to service_role;

-- Replace legacy quote update policies: browser clients are read-only; the
-- authenticated server validates every mutation and uses its secret key.
drop policy if exists "Admins can view quotes" on public.quotes;
drop policy if exists "Admins can update quotes" on public.quotes;

