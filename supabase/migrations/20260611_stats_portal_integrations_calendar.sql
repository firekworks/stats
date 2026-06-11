-- Stats portal, integrations and calendar readiness.
-- Idempotent and non-destructive: adds manual workspace links, calendar metadata
-- and a small external link registry without changing existing records.

alter table public.clients add column if not exists canva_folder_url text;
alter table public.clients add column if not exists canva_account_url text;
alter table public.clients add column if not exists drive_folder_url text;
alter table public.clients add column if not exists website text;
alter table public.clients add column if not exists source text;
alter table public.clients add column if not exists lead_id text;
alter table public.clients add column if not exists converted_from_lead boolean not null default false;
alter table public.clients add column if not exists conversion_date date;
alter table public.clients add column if not exists original_lead_score numeric(12,2);
alter table public.clients add column if not exists original_lead_city text;
alter table public.clients add column if not exists original_lead_sector text;

alter table public.calendar_events add column if not exists event_category text;
alter table public.calendar_events add column if not exists event_subtype text;
alter table public.calendar_events add column if not exists sync_google_requested boolean not null default false;
alter table public.calendar_events add column if not exists google_calendar_sync_status text;

create index if not exists idx_clients_lead_id
  on public.clients(lead_id)
  where lead_id is not null;

create index if not exists idx_calendar_events_client_start
  on public.calendar_events(client_id, start_at);

create table if not exists public.client_external_links (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  provider text not null check (
    provider in ('google_drive', 'canva', 'google_business', 'website', 'whatsapp', 'instagram', 'facebook', 'other')
  ),
  label text not null,
  url text not null,
  client_visible boolean not null default false,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_client_external_links_client_provider
  on public.client_external_links(client_id, provider);

alter table public.client_external_links enable row level security;
grant select, insert, update, delete on public.client_external_links to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'client_external_links'
      and policyname = 'client_external_links_internal_all'
  ) then
    create policy client_external_links_internal_all
      on public.client_external_links
      for all
      to authenticated
      using (private.can_edit_leads())
      with check (private.can_edit_leads());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'client_external_links'
      and policyname = 'client_external_links_client_select_visible'
  ) then
    create policy client_external_links_client_select_visible
      on public.client_external_links
      for select
      to authenticated
      using (client_visible = true and private.can_view_client(client_id));
  end if;
end $$;
