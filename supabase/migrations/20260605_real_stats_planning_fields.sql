-- Real Stats planning and pricing fields.
-- These fields separate Firekworks planning/pricing from synced provider spend.

alter table public.campaigns add column if not exists external_campaign_id text;
alter table public.campaigns add column if not exists external_ad_account_id text;
alter table public.campaigns add column if not exists planned_budget numeric(12,2) not null default 0;
alter table public.campaigns add column if not exists recommended_ad_spend numeric(12,2) not null default 0;
alter table public.campaigns add column if not exists real_spend numeric(12,2) not null default 0;
alter table public.campaigns add column if not exists service_price numeric(12,2) not null default 0;
alter table public.campaigns add column if not exists internal_price numeric(12,2) not null default 0;
alter table public.campaigns add column if not exists lifecycle_status text not null default 'planned';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'campaigns_lifecycle_status_check'
      and conrelid = 'public.campaigns'::regclass
  ) then
    alter table public.campaigns
      add constraint campaigns_lifecycle_status_check
      check (lifecycle_status in ('planned', 'approved', 'active', 'completed', 'reported'));
  end if;
end $$;

create index if not exists idx_campaigns_external_campaign_id
  on public.campaigns(client_id, external_campaign_id)
  where external_campaign_id is not null;
create index if not exists idx_campaigns_lifecycle_status
  on public.campaigns(client_id, lifecycle_status);

alter table public.content_items add column if not exists external_media_id text;
alter table public.content_items add column if not exists planned_budget numeric(12,2) not null default 0;
alter table public.content_items add column if not exists recommended_ad_spend numeric(12,2) not null default 0;
alter table public.content_items add column if not exists real_spend numeric(12,2) not null default 0;
alter table public.content_items add column if not exists service_price numeric(12,2) not null default 0;
alter table public.content_items add column if not exists internal_price numeric(12,2) not null default 0;
alter table public.content_items add column if not exists is_promoted boolean not null default false;
alter table public.content_items add column if not exists promoted_campaign_id uuid references public.campaigns(id) on delete set null;
alter table public.content_items add column if not exists lifecycle_status text not null default 'planned';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'content_items_lifecycle_status_check'
      and conrelid = 'public.content_items'::regclass
  ) then
    alter table public.content_items
      add constraint content_items_lifecycle_status_check
      check (lifecycle_status in ('planned', 'approved', 'scheduled', 'published', 'promoted', 'reported'));
  end if;
end $$;

create index if not exists idx_content_items_external_media_id
  on public.content_items(client_id, external_media_id)
  where external_media_id is not null;
create index if not exists idx_content_items_lifecycle_status
  on public.content_items(client_id, lifecycle_status);
create index if not exists idx_content_items_promoted_campaign_id
  on public.content_items(promoted_campaign_id);
