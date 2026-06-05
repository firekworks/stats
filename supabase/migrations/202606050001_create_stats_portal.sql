create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from anon, authenticated;

create type public.profile_role as enum ('admin', 'client');
create type public.client_status as enum ('active', 'paused', 'churned');
create type public.roi_mode as enum ('estimated', 'real', 'insufficient_data');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.profile_role not null default 'client',
  full_name text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  public_name text not null,
  legal_name text not null,
  public_leaderboard_name text not null default 'Cliente local',
  allow_public_leaderboard_name boolean not null default false,
  industry text not null,
  city text,
  status public.client_status not null default 'active',
  average_ticket numeric(12,2) not null default 0,
  tax_id text,
  fiscal_address text,
  fiscal_email text,
  portal_paused_message text,
  onboarded_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_users (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_in_client text not null default 'owner',
  can_view_billing boolean not null default true,
  created_at timestamptz not null default now(),
  unique (client_id, user_id)
);

create table public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  role text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  monthly_fee numeric(12,2) not null default 0,
  included_ad_spend numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text,
  default_price numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  plan_id uuid references public.plans(id),
  status text not null default 'active'
    check (status in ('active', 'paused', 'cancelled')),
  starts_on date not null default current_date,
  ends_on date,
  monthly_fee numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  platform text not null
    check (platform in ('Meta Ads', 'Instagram', 'Facebook', 'Google Business', 'WhatsApp', 'Landing')),
  objective text not null
    check (objective in ('Mensajes', 'Reservas', 'Leads', 'Trafico', 'Llamadas', 'Reconocimiento')),
  budget numeric(12,2) not null default 0,
  spend numeric(12,2) not null default 0,
  start_date date not null,
  end_date date,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'learning', 'paused', 'completed')),
  ctr numeric(8,2) not null default 0,
  cpc numeric(12,2) not null default 0,
  cpm numeric(12,2) not null default 0,
  leads integer not null default 0,
  cost_per_lead numeric(12,2) not null default 0,
  roas numeric(12,2),
  visible_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_metrics (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  metric_date date not null,
  impressions integer not null default 0,
  reach integer not null default 0,
  clicks integer not null default 0,
  leads integer not null default 0,
  spend numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (campaign_id, metric_date)
);

create table public.campaign_private_notes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  note text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  type text not null
    check (type in ('Reel', 'Post', 'Carrusel', 'Story', 'Anuncio', 'Creatividad', 'Foto', 'Video', 'Copy', 'Landing', 'Miniatura')),
  platform text not null
    check (platform in ('Meta Ads', 'Instagram', 'Facebook', 'Google Business', 'WhatsApp', 'Landing')),
  publish_date date,
  status text not null default 'idea'
    check (status in ('idea', 'recorded', 'editing', 'pending_approval', 'scheduled', 'published')),
  url text,
  storage_path text,
  views integer not null default 0,
  reach integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  saves integer not null default 0,
  engagement_rate numeric(8,2) not null default 0,
  performance text not null default 'ok'
    check (performance in ('low', 'ok', 'high', 'viral')),
  reusable boolean not null default false,
  learning text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_metrics (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  metric_date date not null,
  views integer not null default 0,
  reach integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  saves integer not null default 0,
  created_at timestamptz not null default now(),
  unique (content_id, metric_date)
);

create table public.content_private_notes (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  note text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.monthly_metrics (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  year integer not null check (year between 2020 and 2100),
  reach integer not null default 0,
  impressions integer not null default 0,
  profile_visits integer not null default 0,
  website_clicks integer not null default 0,
  calls integer not null default 0,
  whatsapp_clicks integer not null default 0,
  messages integer not null default 0,
  leads integer not null default 0,
  bookings integer not null default 0,
  estimated_revenue numeric(14,2) not null default 0,
  real_revenue numeric(14,2),
  ad_spend numeric(12,2) not null default 0,
  service_fee numeric(12,2) not null default 0,
  extras numeric(12,2) not null default 0,
  total_investment numeric(12,2) generated always as (ad_spend + service_fee + extras) stored,
  estimated_roi numeric(12,4),
  real_roi numeric(12,4),
  roi_mode public.roi_mode not null default 'estimated',
  best_content_id uuid references public.content_items(id),
  worst_content_id uuid references public.content_items(id),
  summary text,
  diagnosis text,
  next_month_plan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, month, year)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  year integer not null check (year between 2020 and 2100),
  title text not null,
  status text not null default 'draft'
    check (status in ('draft', 'generated', 'sent')),
  storage_path text,
  generated_by uuid references public.profiles(id),
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  unique (client_id, month, year)
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  invoice_number text not null unique,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date date not null,
  due_date date not null,
  taxable_base numeric(12,2) not null default 0,
  vat_rate numeric(5,2) not null default 21,
  withholding_rate numeric(5,2) not null default 0,
  total numeric(12,2) not null default 0,
  payment_method text,
  public_notes text,
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.invoice_private_notes (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  note text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  amount numeric(12,2) not null,
  paid_at timestamptz,
  method text,
  reference text,
  created_at timestamptz not null default now()
);

create table public.leaderboards (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  month integer not null check (month between 1 and 12),
  year integer not null check (year between 2020 and 2100),
  visibility text not null default 'client'
    check (visibility in ('internal', 'client')),
  created_at timestamptz not null default now(),
  unique (category, month, year)
);

create table public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  leaderboard_id uuid not null references public.leaderboards(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  rank integer not null,
  display_name text not null,
  metric_label text not null,
  trend numeric(8,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (leaderboard_id, client_id)
);

create table public.client_scores (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.clients(id) on delete cascade,
  score integer not null default 0 check (score between 0 and 100),
  level integer not null default 1 check (level between 1 and 5),
  level_name text not null default 'Nuevo',
  punctual_payment integer not null default 3 check (punctual_payment between 1 and 5),
  approvals_speed integer not null default 3 check (approvals_speed between 1 and 5),
  collaboration integer not null default 3 check (collaboration between 1 and 5),
  profitability integer not null default 3 check (profitability between 1 and 5),
  growth integer not null default 3 check (growth between 1 and 5),
  churn_risk integer not null default 3 check (churn_risk between 1 and 5),
  communication integer not null default 3 check (communication between 1 and 5),
  satisfaction integer not null default 3 check (satisfaction between 1 and 5),
  recommended_action text,
  updated_at timestamptz not null default now()
);

create table public.client_score_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  previous_level integer check (previous_level between 1 and 5),
  new_level integer check (new_level between 1 and 5),
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  provider text not null,
  status text not null default 'not_connected'
    check (status in ('not_connected', 'connected', 'needs_attention', 'revoked')),
  external_account_id text,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.integration_tokens (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.integrations(id) on delete cascade,
  vault_secret_id text,
  encrypted_access_token text,
  encrypted_refresh_token text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  title text not null,
  severity text not null default 'info'
    check (severity in ('info', 'warning', 'critical', 'success')),
  visibility text not null default 'internal'
    check (visibility in ('internal', 'client')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'done')),
  visible_to_client boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  client_id uuid references public.clients(id) on delete set null,
  action text not null,
  entity_table text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_client_users_user_id on public.client_users(user_id);
create index idx_client_users_client_id on public.client_users(client_id);
create index idx_campaigns_client_id on public.campaigns(client_id);
create index idx_content_items_client_id on public.content_items(client_id);
create index idx_monthly_metrics_client_month on public.monthly_metrics(client_id, year desc, month desc);
create index idx_reports_client_month on public.reports(client_id, year desc, month desc);
create index idx_invoices_client_id on public.invoices(client_id);
create index idx_alerts_client_id on public.alerts(client_id);
create index idx_tasks_client_id on public.tasks(client_id);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and is_active = true
  );
$$;

create or replace function private.current_client_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select client_id
  from public.client_users
  where user_id = (select auth.uid());
$$;

create or replace function public.calculate_roi(
  revenue numeric,
  ad_spend numeric,
  service_fee numeric,
  extras numeric default 0
)
returns numeric
language sql
immutable
as $$
  select case
    when coalesce(ad_spend, 0) + coalesce(service_fee, 0) + coalesce(extras, 0) <= 0 then null
    else revenue / (coalesce(ad_spend, 0) + coalesce(service_fee, 0) + coalesce(extras, 0))
  end;
$$;

create or replace function public.calculate_client_score(
  punctual_payment integer,
  response_approvals integer,
  collaboration integer,
  profitability integer,
  growth integer,
  churn_risk integer
)
returns integer
language sql
immutable
as $$
  select round(
    punctual_payment * 0.2 * 20 +
    response_approvals * 0.2 * 20 +
    collaboration * 0.2 * 20 +
    profitability * 0.2 * 20 +
    growth * 0.1 * 20 +
    (6 - churn_risk) * 0.1 * 20
  )::integer;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'clients', 'client_users', 'client_contacts', 'plans', 'services',
    'subscriptions', 'campaigns', 'campaign_metrics', 'campaign_private_notes',
    'content_items', 'content_metrics', 'content_private_notes', 'monthly_metrics',
    'reports', 'invoices', 'invoice_items', 'invoice_private_notes', 'payments',
    'leaderboards', 'leaderboard_entries', 'client_scores', 'client_score_events',
    'integrations', 'integration_tokens', 'alerts', 'tasks', 'audit_logs'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.calculate_roi(numeric, numeric, numeric, numeric) to authenticated;
grant execute on function public.calculate_client_score(integer, integer, integer, integer, integer, integer) to authenticated;

revoke all on public.integration_tokens from anon, authenticated;
grant all on public.integration_tokens to service_role;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.current_client_ids() to authenticated;

create policy "profiles admin all"
on public.profiles for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "profiles users read self"
on public.profiles for select to authenticated
using (id = (select auth.uid()));

create policy "clients admin all"
on public.clients for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "clients users read own"
on public.clients for select to authenticated
using (id in (select private.current_client_ids()));

create policy "client_users admin all"
on public.client_users for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "client_users read own membership"
on public.client_users for select to authenticated
using (user_id = (select auth.uid()));

create policy "plans admin all"
on public.plans for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "plans active readable"
on public.plans for select to authenticated
using (is_active = true);

create policy "services admin all"
on public.services for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "services active readable"
on public.services for select to authenticated
using (is_active = true);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'client_contacts', 'subscriptions', 'campaigns', 'campaign_metrics',
    'content_items', 'content_metrics', 'monthly_metrics', 'reports',
    'invoices', 'payments', 'client_scores'
  ]
  loop
    execute format(
      'create policy "%s admin all" on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',
      table_name,
      table_name
    );
    execute format(
      'create policy "%s client read own" on public.%I for select to authenticated using (client_id in (select private.current_client_ids()))',
      table_name,
      table_name
    );
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'campaign_private_notes', 'content_private_notes', 'invoice_private_notes',
    'client_score_events', 'integrations', 'audit_logs'
  ]
  loop
    execute format(
      'create policy "%s admin all" on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',
      table_name,
      table_name
    );
  end loop;
end $$;

create policy "invoice_items admin all"
on public.invoice_items for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "invoice_items client read own"
on public.invoice_items for select to authenticated
using (
  exists (
    select 1
    from public.invoices
    where invoices.id = invoice_items.invoice_id
      and invoices.client_id in (select private.current_client_ids())
  )
);

create policy "leaderboards admin all"
on public.leaderboards for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "leaderboards client read visible"
on public.leaderboards for select to authenticated
using (visibility = 'client');

create policy "leaderboard_entries admin all"
on public.leaderboard_entries for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "leaderboard_entries client read visible"
on public.leaderboard_entries for select to authenticated
using (
  exists (
    select 1
    from public.leaderboards
    where leaderboards.id = leaderboard_entries.leaderboard_id
      and leaderboards.visibility = 'client'
  )
);

create policy "alerts admin all"
on public.alerts for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "alerts client read visible"
on public.alerts for select to authenticated
using (
  visibility = 'client'
  and client_id in (select private.current_client_ids())
);

create policy "tasks admin all"
on public.tasks for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "tasks client read visible"
on public.tasks for select to authenticated
using (
  visible_to_client = true
  and client_id in (select private.current_client_ids())
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('reports', 'reports', false, 10485760, array['application/pdf']),
  ('invoices', 'invoices', false, 10485760, array['application/pdf']),
  ('content-assets', 'content-assets', false, 104857600, array['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "stats storage admin all"
on storage.objects for all to authenticated
using (
  bucket_id in ('reports', 'invoices', 'content-assets')
  and (select private.is_admin())
)
with check (
  bucket_id in ('reports', 'invoices', 'content-assets')
  and (select private.is_admin())
);

create policy "stats storage client read own folder"
on storage.objects for select to authenticated
using (
  bucket_id in ('reports', 'invoices', 'content-assets')
  and exists (
    select 1
    from private.current_client_ids() as cid(client_id)
    where split_part(name, '/', 1) = cid.client_id::text
  )
);

comment on table public.integration_tokens is
  'External API tokens. Prefer Supabase Vault via vault_secret_id; never expose in frontend.';

comment on table public.invoice_private_notes is
  'Internal billing notes for Firekworks only. Fiscal issuance must be validated with an advisor before production.';
