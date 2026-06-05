create extension if not exists pgcrypto;

create schema if not exists private;

-- Existing Firekworks Leads tables are intentionally reused, not recreated:
-- public.leads, public.profiles, public.clients, public.lead_to_client_links,
-- public.lead_scores, public.lead_activities, public.lead_notes,
-- public.lead_tasks, public.lead_sources, public.lead_duplicates, public.audit_logs.
-- public.profiles stays owned by Leads/internal users. Stats clients are mapped
-- through public.client_users and public.client_login_aliases.

alter table public.clients add column if not exists legal_name text;
alter table public.clients add column if not exists postal_code text;
alter table public.clients add column if not exists province text;
alter table public.clients add column if not exists country text not null default 'España';
alter table public.clients add column if not exists commercial_contact_name text;
alter table public.clients add column if not exists commercial_contact_email text;
alter table public.clients add column if not exists average_ticket numeric(12,2) not null default 0;
alter table public.clients add column if not exists monthly_budget numeric(12,2) not null default 0;
alter table public.clients add column if not exists service_fee numeric(12,2) not null default 0;
alter table public.clients add column if not exists plan_id uuid;
alter table public.clients add column if not exists show_in_leaderboard boolean not null default false;
alter table public.clients add column if not exists public_leaderboard_name text;
alter table public.clients add column if not exists client_portal_enabled boolean not null default false;
alter table public.clients add column if not exists portal_status text not null default 'inactive';
alter table public.clients add column if not exists paused_at timestamptz;
alter table public.clients add column if not exists churned_at timestamptz;
alter table public.clients add column if not exists reactivated_at timestamptz;

create table if not exists public.client_users (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'manager', 'viewer')),
  is_active boolean not null default true,
  invited_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, user_id)
);

create table if not exists public.client_login_aliases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  username text not null,
  auth_email text not null,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (username),
  unique (auth_email)
);

create table if not exists public.app_texts (
  id uuid primary key default gen_random_uuid(),
  app text not null,
  key text not null,
  value text not null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app, key)
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  monthly_price numeric(12,2) not null default 0,
  included_services jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  base_price numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled', 'trial')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  monthly_fee numeric(12,2) not null default 0,
  notes_internal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clients_plan_id_fkey'
      and conrelid = 'public.clients'::regclass
  ) then
    alter table public.clients
      add constraint clients_plan_id_fkey
      foreign key (plan_id) references public.plans(id) on delete set null
      not valid;
  end if;
end $$;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  platform text not null,
  objective text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'learning', 'paused', 'completed', 'cancelled')),
  start_date date,
  end_date date,
  budget numeric(12,2) not null default 0,
  spend numeric(12,2) not null default 0,
  client_visible_summary text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_metrics (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  date date not null,
  impressions integer not null default 0,
  reach integer not null default 0,
  clicks integer not null default 0,
  leads integer not null default 0,
  messages integer not null default 0,
  conversions integer not null default 0,
  spend numeric(12,2) not null default 0,
  ctr numeric(8,2) not null default 0,
  cpc numeric(12,2) not null default 0,
  cpm numeric(12,2) not null default 0,
  cost_per_lead numeric(12,2) not null default 0,
  estimated_revenue numeric(14,2) not null default 0,
  estimated_roi numeric(12,4),
  created_at timestamptz not null default now(),
  unique (campaign_id, date)
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  type text not null,
  platform text not null,
  title text not null,
  caption text,
  status text not null default 'idea' check (status in ('idea', 'recorded', 'editing', 'pending_approval', 'scheduled', 'published', 'archived')),
  published_at timestamptz,
  url text,
  storage_path text,
  client_visible boolean not null default true,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_metrics (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  date date not null,
  views integer not null default 0,
  reach integer not null default 0,
  impressions integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  saves integer not null default 0,
  clicks integer not null default 0,
  engagement_rate numeric(8,2) not null default 0,
  performance_label text,
  created_at timestamptz not null default now(),
  unique (content_id, date)
);

create table if not exists public.monthly_metrics (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  year integer not null check (year between 2020 and 2100),
  reach integer not null default 0,
  impressions integer not null default 0,
  clicks integer not null default 0,
  leads integer not null default 0,
  messages integer not null default 0,
  bookings integer not null default 0,
  calls integer not null default 0,
  whatsapp_clicks integer not null default 0,
  website_clicks integer not null default 0,
  ad_spend numeric(12,2) not null default 0,
  service_fee numeric(12,2) not null default 0,
  extra_costs numeric(12,2) not null default 0,
  estimated_revenue numeric(14,2) not null default 0,
  estimated_roi numeric(12,4),
  real_revenue numeric(14,2),
  real_roi numeric(12,4),
  roi_type text not null default 'estimated' check (roi_type in ('estimated', 'real', 'insufficient_data')),
  best_content_id uuid references public.content_items(id) on delete set null,
  summary_client text,
  diagnosis_client text,
  diagnosis_internal text,
  next_month_plan_client text,
  next_month_plan_internal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, month, year)
);

create table if not exists public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  year integer not null check (year between 2020 and 2100),
  title text not null,
  summary text,
  status text not null default 'draft' check (status in ('draft', 'generated', 'sent')),
  generated_by uuid references auth.users(id) on delete set null,
  generated_at timestamptz,
  pdf_storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, month, year)
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  invoice_number text not null unique,
  issue_date date not null,
  due_date date not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  subtotal numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 21,
  tax_amount numeric(12,2) not null default 0,
  withholding_rate numeric(5,2) not null default 0,
  withholding_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  pdf_storage_path text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 21,
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete set null,
  client_id uuid not null references public.clients(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  paid_at timestamptz,
  method text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.leaderboards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  metric text not null,
  month integer not null check (month between 1 and 12),
  year integer not null check (year between 2020 and 2100),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  unique (name, month, year)
);

create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  leaderboard_id uuid not null references public.leaderboards(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  position integer not null,
  value numeric(14,4) not null default 0,
  display_name text not null,
  is_anonymous boolean not null default true,
  created_at timestamptz not null default now(),
  unique (leaderboard_id, client_id)
);

create table if not exists public.client_scores (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.clients(id) on delete cascade,
  score integer not null default 0 check (score between 0 and 100),
  level integer not null default 1 check (level between 1 and 5),
  level_name text not null default 'Nuevo',
  communication_score integer not null default 3 check (communication_score between 1 and 5),
  approval_speed_score integer not null default 3 check (approval_speed_score between 1 and 5),
  ease_of_work_score integer not null default 3 check (ease_of_work_score between 1 and 5),
  profitability_score integer not null default 3 check (profitability_score between 1 and 5),
  growth_potential_score integer not null default 3 check (growth_potential_score between 1 and 5),
  churn_risk_score integer not null default 3 check (churn_risk_score between 1 and 5),
  perceived_satisfaction_score integer not null default 3 check (perceived_satisfaction_score between 1 and 5),
  automatic_score jsonb not null default '{}'::jsonb,
  internal_recommendation text,
  visible_label text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.client_score_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  event_type text not null,
  points integer not null default 0,
  description text not null,
  visible_to_client boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  provider text not null,
  status text not null default 'pending' check (status in ('pending', 'connected', 'error', 'revoked')),
  external_account_id text,
  external_account_name text,
  scopes text[] not null default '{}',
  last_sync_at timestamptz,
  error_message text,
  token_storage_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integration_sync_logs (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid references public.integrations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  provider text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'started' check (status in ('started', 'success', 'error')),
  records_inserted integer not null default 0,
  records_updated integer not null default 0,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  type text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical', 'success')),
  title text not null,
  description text,
  visible_to_client boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done', 'blocked', 'cancelled')),
  due_date date,
  visible_to_client boolean not null default true,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_files (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.monthly_reports(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.invoice_files (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_client_users_user_id on public.client_users(user_id);
create index if not exists idx_client_users_client_id on public.client_users(client_id);
create index if not exists idx_client_login_aliases_client_id on public.client_login_aliases(client_id);
create index if not exists idx_client_login_aliases_user_id on public.client_login_aliases(user_id);
create index if not exists idx_client_login_aliases_username_active on public.client_login_aliases(username) where is_active = true;
create index if not exists idx_app_texts_app_key on public.app_texts(app, key);
create index if not exists idx_campaigns_client_id on public.campaigns(client_id);
create index if not exists idx_campaign_metrics_client_id on public.campaign_metrics(client_id);
create index if not exists idx_content_items_client_id on public.content_items(client_id);
create index if not exists idx_content_metrics_client_id on public.content_metrics(client_id);
create index if not exists idx_monthly_metrics_client_month on public.monthly_metrics(client_id, year desc, month desc);
create index if not exists idx_monthly_reports_client_month on public.monthly_reports(client_id, year desc, month desc);
create index if not exists idx_invoices_client_id on public.invoices(client_id);
create index if not exists idx_alerts_client_id on public.alerts(client_id);
create index if not exists idx_tasks_client_id on public.tasks(client_id);

create or replace function private.is_client_user(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.client_users cu
    join public.clients c on c.id = cu.client_id
    where cu.client_id = target_client_id
      and cu.user_id = auth.uid()
      and cu.is_active = true
      and c.client_portal_enabled = true
  );
$$;

create or replace function private.can_view_client(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select private.is_internal_user() or private.is_client_user(target_client_id);
$$;

create or replace function private.can_edit_client_data(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select private.can_edit_leads();
$$;

grant usage on schema public to authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_client_user(uuid) to authenticated;
grant execute on function private.can_view_client(uuid) to authenticated;
grant execute on function private.can_edit_client_data(uuid) to authenticated;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'client_users', 'client_login_aliases', 'app_texts', 'plans', 'services', 'client_subscriptions', 'campaigns',
    'campaign_metrics', 'content_items', 'content_metrics', 'monthly_metrics',
    'monthly_reports', 'invoices', 'invoice_items', 'payments', 'leaderboards',
    'leaderboard_entries', 'client_scores', 'client_score_events', 'integrations',
    'integration_sync_logs', 'alerts', 'tasks', 'report_files', 'invoice_files'
  ]
  loop
    execute format('alter table public.%I enable row level security', target_table);
    execute format('grant select, insert, update, delete on public.%I to authenticated', target_table);
  end loop;
end $$;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'campaigns', 'campaign_metrics', 'content_items', 'content_metrics',
    'monthly_metrics', 'monthly_reports', 'invoices', 'payments',
    'leaderboards', 'leaderboard_entries', 'client_scores',
    'client_score_events', 'integrations', 'integration_sync_logs',
    'alerts', 'tasks', 'report_files', 'invoice_files', 'client_subscriptions',
    'client_login_aliases'
  ]
  loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = target_table and policyname = target_table || '_select_internal'
    ) then
      execute format(
        'create policy %I on public.%I for select to authenticated using (private.is_internal_user())',
        target_table || '_select_internal',
        target_table
      );
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = target_table and policyname = target_table || '_insert_internal'
    ) then
      execute format(
        'create policy %I on public.%I for insert to authenticated with check (private.can_edit_leads())',
        target_table || '_insert_internal',
        target_table
      );
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = target_table and policyname = target_table || '_update_internal'
    ) then
      execute format(
        'create policy %I on public.%I for update to authenticated using (private.can_edit_leads()) with check (private.can_edit_leads())',
        target_table || '_update_internal',
        target_table
      );
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = target_table and policyname = target_table || '_delete_internal'
    ) then
      execute format(
        'create policy %I on public.%I for delete to authenticated using (private.can_edit_leads())',
        target_table || '_delete_internal',
        target_table
      );
    end if;
  end loop;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='client_users' and policyname='client_users_select_internal') then
    create policy client_users_select_internal on public.client_users
      for select to authenticated using (private.is_internal_user());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='client_users' and policyname='client_users_select_self') then
    create policy client_users_select_self on public.client_users
      for select to authenticated using (user_id = auth.uid() and is_active = true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='client_users' and policyname='client_users_write_internal') then
    create policy client_users_write_internal on public.client_users
      for all to authenticated using (private.can_edit_leads()) with check (private.can_edit_leads());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='plans' and policyname='plans_select_authenticated') then
    create policy plans_select_authenticated on public.plans
      for select to authenticated using (is_active = true or private.is_internal_user());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='plans' and policyname='plans_write_internal') then
    create policy plans_write_internal on public.plans
      for all to authenticated using (private.can_edit_leads()) with check (private.can_edit_leads());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='services' and policyname='services_select_authenticated') then
    create policy services_select_authenticated on public.services
      for select to authenticated using (is_active = true or private.is_internal_user());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='services' and policyname='services_write_internal') then
    create policy services_write_internal on public.services
      for all to authenticated using (private.can_edit_leads()) with check (private.can_edit_leads());
  end if;

  grant select on public.app_texts to anon, authenticated;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='app_texts' and policyname='app_texts_select_stats_public') then
    create policy app_texts_select_stats_public on public.app_texts
      for select to anon, authenticated using (app = 'stats');
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='app_texts' and policyname='app_texts_write_internal') then
    create policy app_texts_write_internal on public.app_texts
      for all to authenticated using (private.can_edit_leads()) with check (private.can_edit_leads());
  end if;
end $$;

insert into public.app_texts (app, key, value)
values
  ('stats', 'stats.login.badge', 'Firekworks Stats'),
  ('stats', 'stats.login.title', 'Portal privado de resultados'),
  ('stats', 'stats.login.subtitle', 'Accede con tu usuario de cliente.'),
  ('stats', 'stats.login.username_label', 'Usuario'),
  ('stats', 'stats.login.password_label', 'Contraseña'),
  ('stats', 'stats.login.button', 'Entrar'),
  ('stats', 'stats.login.error_invalid', 'Usuario o contraseña incorrectos')
on conflict (app, key) do nothing;

create or replace view public.client_profile_view
with (security_barrier = true)
as
select
  c.id,
  c.name,
  c.sector,
  c.city,
  c.address,
  c.phone,
  c.website,
  c.instagram_url,
  c.facebook_url,
  c.whatsapp_url,
  c.logo_url,
  c.billing_name,
  c.tax_id,
  c.billing_email,
  c.billing_address,
  c.status,
  c.legal_name,
  c.average_ticket,
  c.monthly_budget,
  c.service_fee,
  c.show_in_leaderboard,
  c.public_leaderboard_name,
  c.client_portal_enabled,
  c.portal_status,
  c.created_at,
  c.updated_at
from public.clients c
where private.can_view_client(c.id);

create or replace view public.client_dashboard_view
with (security_barrier = true)
as
select
  c.id as client_id,
  c.name as client_name,
  c.sector,
  c.city,
  c.logo_url,
  c.client_portal_enabled,
  c.portal_status,
  c.public_leaderboard_name,
  c.show_in_leaderboard,
  mm.month,
  mm.year,
  mm.reach,
  mm.impressions,
  mm.clicks,
  mm.leads,
  mm.messages,
  mm.bookings,
  mm.calls,
  mm.whatsapp_clicks,
  mm.website_clicks,
  mm.ad_spend,
  mm.service_fee,
  mm.extra_costs,
  mm.estimated_revenue,
  mm.estimated_roi,
  mm.real_revenue,
  mm.real_roi,
  mm.roi_type,
  mm.best_content_id,
  mm.summary_client,
  mm.diagnosis_client,
  mm.next_month_plan_client
from public.clients c
left join public.monthly_metrics mm on mm.client_id = c.id
where private.can_view_client(c.id);

create or replace view public.client_campaigns_view
with (security_barrier = true)
as
select
  id,
  client_id,
  name,
  platform,
  objective,
  status,
  start_date,
  end_date,
  budget,
  spend,
  client_visible_summary,
  created_at,
  updated_at
from public.campaigns
where private.can_view_client(client_id);

create or replace view public.client_content_view
with (security_barrier = true)
as
select
  id,
  client_id,
  campaign_id,
  type,
  platform,
  title,
  caption,
  status,
  published_at,
  url,
  storage_path,
  created_at,
  updated_at
from public.content_items
where client_visible = true
  and private.can_view_client(client_id);

create or replace view public.client_reports_view
with (security_barrier = true)
as
select
  id,
  client_id,
  month,
  year,
  title,
  summary,
  status,
  generated_at,
  pdf_storage_path,
  created_at,
  updated_at
from public.monthly_reports
where private.can_view_client(client_id);

create or replace view public.client_invoices_view
with (security_barrier = true)
as
select
  id,
  client_id,
  invoice_number,
  issue_date,
  due_date,
  status,
  subtotal,
  tax_rate,
  tax_amount,
  withholding_rate,
  withholding_amount,
  total,
  pdf_storage_path,
  created_at,
  updated_at
from public.invoices
where private.can_view_client(client_id);

create or replace view public.client_leaderboard_view
with (security_barrier = true)
as
select
  lb.id as leaderboard_id,
  lb.name,
  lb.metric,
  lb.month,
  lb.year,
  le.client_id,
  le.position,
  le.value,
  case
    when le.is_anonymous then 'Cliente local #' || le.position::text
    else le.display_name
  end as display_name,
  private.is_client_user(le.client_id) as is_current_client
from public.leaderboards lb
join public.leaderboard_entries le on le.leaderboard_id = lb.id
where lb.is_public = true
  and (
    private.is_internal_user()
    or exists (
      select 1
      from public.client_users cu
      where cu.user_id = auth.uid()
        and cu.is_active = true
    )
  );

create or replace view public.client_score_public_view
with (security_barrier = true)
as
select
  client_id,
  score,
  level,
  level_name,
  coalesce(visible_label, level_name) as visible_label,
  coalesce(visible_label, 'Seguimiento activo.') as internal_recommendation,
  updated_at
from public.client_scores
where private.can_view_client(client_id);

create or replace view public.client_alerts_public_view
with (security_barrier = true)
as
select
  id,
  client_id,
  type,
  severity,
  title,
  description,
  'client'::text as visibility,
  visible_to_client,
  created_at
from public.alerts
where visible_to_client = true
  and private.can_view_client(client_id);

create or replace view public.client_tasks_public_view
with (security_barrier = true)
as
select
  id,
  client_id,
  title,
  description,
  status,
  due_date,
  visible_to_client,
  created_at,
  updated_at
from public.tasks
where visible_to_client = true
  and private.can_view_client(client_id);

grant select on public.client_profile_view to authenticated;
grant select on public.client_dashboard_view to authenticated;
grant select on public.client_campaigns_view to authenticated;
grant select on public.client_content_view to authenticated;
grant select on public.client_reports_view to authenticated;
grant select on public.client_invoices_view to authenticated;
grant select on public.client_leaderboard_view to authenticated;
grant select on public.client_score_public_view to authenticated;
grant select on public.client_alerts_public_view to authenticated;
grant select on public.client_tasks_public_view to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('stats-reports', 'stats-reports', false, 10485760, array['application/pdf']),
  ('stats-invoices', 'stats-invoices', false, 10485760, array['application/pdf']),
  ('stats-content-assets', 'stats-content-assets', false, 104857600, array['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'application/pdf'])
on conflict (id) do nothing;

comment on table public.integrations is
  'External provider connection metadata. Store real secrets in Supabase Vault or another encrypted server-side secret store, never in frontend code.';

comment on table public.invoices is
  'Operational billing module for Stats. Fiscal production use in Spain must be validated with an advisor before relying on it as final issuance.';
