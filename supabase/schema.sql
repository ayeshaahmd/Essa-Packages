-- Essa Packages admin dashboard
-- Run this once in Supabase: SQL Editor > New query > Run.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'New' check (status in ('New', 'Contacted', 'Quoted', 'Completed', 'Archived')),
  name text not null,
  company text not null,
  email text not null,
  phone text not null default '',
  packaging_type text not null,
  quantity text not null,
  dimensions text not null default '',
  details text not null default '',
  source text not null default 'Website',
  file_path text,
  file_name text,
  file_type text,
  whatsapp_notified boolean not null default false,
  whatsapp_notification_note text not null default '',
  admin_note text not null default ''
);

alter table public.quotes add column if not exists admin_note text not null default '';

create index if not exists quotes_created_at_idx on public.quotes (created_at desc);
create index if not exists quotes_status_idx on public.quotes (status);

alter table public.admin_users enable row level security;
alter table public.quotes enable row level security;

-- Supabase no longer exposes new tables to the Data API automatically.
-- Keep anonymous visitors out; approved authenticated admins receive only the
-- permissions required by the dashboard. Server-side quote submission uses a
-- secret/service-role key and is never exposed in the browser.
revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.quotes from anon, authenticated;
grant select on table public.admin_users to authenticated;
grant select, update on table public.quotes to authenticated;
grant all on table public.admin_users, public.quotes to service_role;

drop policy if exists "Admins can view their membership" on public.admin_users;
create policy "Admins can view their membership"
on public.admin_users for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Admins can view quotes" on public.quotes;
create policy "Admins can view quotes"
on public.quotes for select
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "Admins can update quotes" on public.quotes;
create policy "Admins can update quotes"
on public.quotes for update
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create or replace function public.set_quote_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_quotes_updated_at on public.quotes;
create trigger set_quotes_updated_at
before update on public.quotes
for each row execute function public.set_quote_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quote-artwork',
  'quote-artwork',
  false,
  4194304,
  array['application/pdf', 'application/postscript', 'application/octet-stream', 'image/vnd.adobe.photoshop', 'image/x-photoshop', 'image/png', 'image/jpeg']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 4194304,
  allowed_mime_types = excluded.allowed_mime_types;

-- After creating a team member in Authentication > Users, approve them as an admin:
-- insert into public.admin_users (user_id, email)
-- select id, email from auth.users where email = 'admin@yourdomain.com';
