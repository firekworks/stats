-- Firekworks Stats integration foundation.
-- Keeps external API credentials server-side and adds import/event tables with RLS.

alter table public.integrations add column if not exists provider_user_id text;
alter table public.integrations add column if not exists provider_user_name text;
alter table public.integrations add column if not exists access_token_encrypted text;
alter table public.integrations add column if not exists refresh_token_encrypted text;
alter table public.integrations add column if not exists token_expires_at timestamptz;
alter table public.integrations add column if not exists token_last_rotated_at timestamptz;
alter table public.integrations add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.integrations add column if not exists connected_at timestamptz;
alter table public.integrations add column if not exists revoked_at timestamptz;

create unique index if not exists integrations_client_provider_unique
  on public.integrations(client_id, provider);
create index if not exists idx_integrations_provider_status
  on public.integrations(provider, status);

create table if not exists public.connected_assets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  integration_id uuid references public.integrations(id) on delete cascade,
  provider text not null,
  asset_type text not null check (
    asset_type in (
      'ad_account',
      'page',
      'instagram_account',
      'whatsapp_business_account',
      'whatsapp_phone_number',
      'google_business_location',
      'google_search_console_property',
      'other'
    )
  ),
  external_id text not null,
  name text not null,
  username text,
  parent_external_id text,
  status text not null default 'active' check (
    status in ('active', 'inactive', 'disconnected', 'error')
  ),
  is_selected boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists connected_assets_provider_external_unique
  on public.connected_assets(provider, asset_type, external_id);
create index if not exists idx_connected_assets_client_provider
  on public.connected_assets(client_id, provider, asset_type);
create index if not exists idx_connected_assets_integration_id
  on public.connected_assets(integration_id);
create index if not exists idx_connected_assets_selected
  on public.connected_assets(client_id, provider, asset_type)
  where is_selected = true;

create table if not exists public.oauth_states (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  client_id uuid references public.clients(id) on delete cascade,
  state text not null unique,
  redirect_path text,
  scopes text[] not null default '{}',
  status text not null default 'pending' check (
    status in ('pending', 'used', 'expired', 'error')
  ),
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  used_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_oauth_states_provider_client
  on public.oauth_states(provider, client_id);
create index if not exists idx_oauth_states_expires_at
  on public.oauth_states(expires_at);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_type text,
  external_id text,
  client_id uuid references public.clients(id) on delete set null,
  connected_asset_id uuid references public.connected_assets(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  signature text,
  processing_status text not null default 'pending' check (
    processing_status in ('pending', 'processed', 'ignored', 'error')
  ),
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists webhook_events_provider_external_unique
  on public.webhook_events(provider, external_id)
  where external_id is not null;
create index if not exists idx_webhook_events_provider_status
  on public.webhook_events(provider, processing_status, received_at desc);
create index if not exists idx_webhook_events_client_id
  on public.webhook_events(client_id);

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  lead_id text references public.leads(id) on delete set null,
  connected_asset_id uuid references public.connected_assets(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  content_item_id uuid references public.content_items(id) on delete set null,
  provider text not null,
  channel text not null default 'unknown',
  external_event_id text,
  external_lead_id text,
  contact_name text,
  contact_phone text,
  contact_email text,
  message text,
  occurred_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists lead_events_provider_external_unique
  on public.lead_events(provider, external_event_id)
  where external_event_id is not null;
create index if not exists idx_lead_events_client_occurred
  on public.lead_events(client_id, occurred_at desc);
create index if not exists idx_lead_events_lead_id
  on public.lead_events(lead_id);

alter table public.campaigns add column if not exists integration_id uuid references public.integrations(id) on delete set null;
alter table public.campaigns add column if not exists connected_asset_id uuid references public.connected_assets(id) on delete set null;
alter table public.campaigns add column if not exists provider text;
alter table public.campaigns add column if not exists external_id text;
alter table public.campaigns add column if not exists external_account_id text;
alter table public.campaigns add column if not exists source text not null default 'manual';
alter table public.campaigns add column if not exists sync_status text not null default 'manual';
alter table public.campaigns add column if not exists currency text;
alter table public.campaigns add column if not exists raw_payload jsonb not null default '{}'::jsonb;
alter table public.campaigns add column if not exists last_synced_at timestamptz;

create unique index if not exists campaigns_provider_external_unique
  on public.campaigns(client_id, provider, external_id)
  where provider is not null and external_id is not null;
create index if not exists idx_campaigns_integration_id
  on public.campaigns(integration_id);
create index if not exists idx_campaigns_asset_provider
  on public.campaigns(client_id, connected_asset_id, provider);

alter table public.campaign_metrics add column if not exists provider text;
alter table public.campaign_metrics add column if not exists entity_type text;
alter table public.campaign_metrics add column if not exists entity_id text;
alter table public.campaign_metrics add column if not exists external_campaign_id text;
alter table public.campaign_metrics add column if not exists external_adset_id text;
alter table public.campaign_metrics add column if not exists external_ad_id text;
alter table public.campaign_metrics add column if not exists frequency numeric(12,4);
alter table public.campaign_metrics add column if not exists link_clicks integer not null default 0;
alter table public.campaign_metrics add column if not exists inline_link_clicks integer not null default 0;
alter table public.campaign_metrics add column if not exists actions jsonb not null default '{}'::jsonb;
alter table public.campaign_metrics add column if not exists source text not null default 'manual';
alter table public.campaign_metrics add column if not exists raw_payload jsonb not null default '{}'::jsonb;
alter table public.campaign_metrics add column if not exists last_synced_at timestamptz;

create unique index if not exists campaign_metrics_provider_entity_date_unique
  on public.campaign_metrics(client_id, provider, entity_type, entity_id, date)
  where provider is not null and entity_type is not null and entity_id is not null;
create index if not exists idx_campaign_metrics_provider_entity
  on public.campaign_metrics(provider, entity_type, entity_id, date desc);

alter table public.content_items add column if not exists integration_id uuid references public.integrations(id) on delete set null;
alter table public.content_items add column if not exists connected_asset_id uuid references public.connected_assets(id) on delete set null;
alter table public.content_items add column if not exists provider text;
alter table public.content_items add column if not exists external_id text;
alter table public.content_items add column if not exists external_account_id text;
alter table public.content_items add column if not exists external_permalink text;
alter table public.content_items add column if not exists media_type text;
alter table public.content_items add column if not exists thumbnail_url text;
alter table public.content_items add column if not exists source text not null default 'manual';
alter table public.content_items add column if not exists sync_status text not null default 'manual';
alter table public.content_items add column if not exists raw_payload jsonb not null default '{}'::jsonb;
alter table public.content_items add column if not exists last_synced_at timestamptz;

create unique index if not exists content_items_provider_external_unique
  on public.content_items(client_id, provider, external_id)
  where provider is not null and external_id is not null;
create index if not exists idx_content_items_integration_id
  on public.content_items(integration_id);
create index if not exists idx_content_items_asset_provider
  on public.content_items(client_id, connected_asset_id, provider);

alter table public.content_metrics add column if not exists provider text;
alter table public.content_metrics add column if not exists entity_type text;
alter table public.content_metrics add column if not exists entity_id text;
alter table public.content_metrics add column if not exists plays integer not null default 0;
alter table public.content_metrics add column if not exists replies integer not null default 0;
alter table public.content_metrics add column if not exists follows integer not null default 0;
alter table public.content_metrics add column if not exists total_interactions integer not null default 0;
alter table public.content_metrics add column if not exists source text not null default 'manual';
alter table public.content_metrics add column if not exists raw_payload jsonb not null default '{}'::jsonb;
alter table public.content_metrics add column if not exists last_synced_at timestamptz;

create unique index if not exists content_metrics_provider_entity_date_unique
  on public.content_metrics(client_id, provider, entity_type, entity_id, date)
  where provider is not null and entity_type is not null and entity_id is not null;
create index if not exists idx_content_metrics_provider_entity
  on public.content_metrics(provider, entity_type, entity_id, date desc);

alter table public.monthly_metrics add column if not exists data_status text not null default 'manual';
alter table public.monthly_metrics add column if not exists calculated_at timestamptz;
alter table public.monthly_metrics add column if not exists source_summary jsonb not null default '{}'::jsonb;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'connected_assets',
    'oauth_states',
    'webhook_events',
    'lead_events'
  ]
  loop
    execute format('alter table public.%I enable row level security', target_table);
    execute format('grant select, insert, update, delete on public.%I to authenticated', target_table);
  end loop;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'connected_assets'
      and policyname = 'connected_assets_select_client_or_internal'
  ) then
    create policy connected_assets_select_client_or_internal
      on public.connected_assets
      for select
      to authenticated
      using (private.can_view_client(client_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'connected_assets'
      and policyname = 'connected_assets_write_internal'
  ) then
    create policy connected_assets_write_internal
      on public.connected_assets
      for all
      to authenticated
      using (private.can_edit_leads())
      with check (private.can_edit_leads());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'oauth_states'
      and policyname = 'oauth_states_internal_only'
  ) then
    create policy oauth_states_internal_only
      on public.oauth_states
      for all
      to authenticated
      using (private.can_edit_leads())
      with check (private.can_edit_leads());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'webhook_events'
      and policyname = 'webhook_events_internal_only'
  ) then
    create policy webhook_events_internal_only
      on public.webhook_events
      for all
      to authenticated
      using (private.can_edit_leads())
      with check (private.can_edit_leads());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lead_events'
      and policyname = 'lead_events_internal_only'
  ) then
    create policy lead_events_internal_only
      on public.lead_events
      for all
      to authenticated
      using (private.can_edit_leads())
      with check (private.can_edit_leads());
  end if;
end $$;

comment on column public.integrations.access_token_encrypted is
  'Server-only encrypted access token. Never expose or select this in frontend code.';
comment on column public.integrations.refresh_token_encrypted is
  'Server-only encrypted refresh token. Prefer Supabase Vault if available for production secrets.';
comment on table public.connected_assets is
  'External accounts/assets discovered for a Stats client, such as Meta ad accounts, pages, Instagram accounts and future Google/WhatsApp assets.';
comment on table public.webhook_events is
  'Raw external webhook events. Internal only; clients must not read raw webhook payloads or lead data.';
comment on table public.lead_events is
  'Internal lead/message events generated from external providers. Not exposed to the client portal.';
