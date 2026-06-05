-- Tuning after Supabase advisors: avoid duplicate permissive SELECT policies
-- and add covering indexes for integration-related foreign keys.

drop policy if exists connected_assets_write_internal on public.connected_assets;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'connected_assets'
      and policyname = 'connected_assets_insert_internal'
  ) then
    create policy connected_assets_insert_internal
      on public.connected_assets
      for insert
      to authenticated
      with check (private.can_edit_leads());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'connected_assets'
      and policyname = 'connected_assets_update_internal'
  ) then
    create policy connected_assets_update_internal
      on public.connected_assets
      for update
      to authenticated
      using (private.can_edit_leads())
      with check (private.can_edit_leads());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'connected_assets'
      and policyname = 'connected_assets_delete_internal'
  ) then
    create policy connected_assets_delete_internal
      on public.connected_assets
      for delete
      to authenticated
      using (private.can_edit_leads());
  end if;
end $$;

create index if not exists idx_campaigns_connected_asset_id
  on public.campaigns(connected_asset_id);
create index if not exists idx_content_items_campaign_id
  on public.content_items(campaign_id);
create index if not exists idx_content_items_connected_asset_id
  on public.content_items(connected_asset_id);
create index if not exists idx_lead_events_connected_asset_id
  on public.lead_events(connected_asset_id);
create index if not exists idx_lead_events_campaign_id
  on public.lead_events(campaign_id);
create index if not exists idx_lead_events_content_item_id
  on public.lead_events(content_item_id);
