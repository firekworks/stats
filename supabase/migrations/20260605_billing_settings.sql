create table if not exists public.billing_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Firekworks',
  legal_name text not null default '',
  tax_id text not null default '',
  fiscal_address text not null default '',
  email text not null default '',
  phone text not null default '',
  iban text not null default '',
  invoice_series text not null default 'FW',
  next_invoice_number integer not null default 1 check (next_invoice_number >= 1),
  default_vat_rate numeric(5,2) not null default 21 check (default_vat_rate >= 0),
  default_retention_rate numeric(5,2) not null default 0 check (default_retention_rate >= 0),
  footer_text text not null default 'Emision fiscal definitiva pendiente de validacion con asesoria.',
  logo_url text not null default '/brand/firekworks-mark.svg',
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_settings enable row level security;
grant select, insert, update, delete on public.billing_settings to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'billing_settings'
      and policyname = 'billing_settings_select_internal'
  ) then
    create policy billing_settings_select_internal
      on public.billing_settings for select
      to authenticated
      using (private.is_internal_user());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'billing_settings'
      and policyname = 'billing_settings_insert_internal'
  ) then
    create policy billing_settings_insert_internal
      on public.billing_settings for insert
      to authenticated
      with check (private.can_edit_leads());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'billing_settings'
      and policyname = 'billing_settings_update_internal'
  ) then
    create policy billing_settings_update_internal
      on public.billing_settings for update
      to authenticated
      using (private.can_edit_leads())
      with check (private.can_edit_leads());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'billing_settings'
      and policyname = 'billing_settings_delete_internal'
  ) then
    create policy billing_settings_delete_internal
      on public.billing_settings for delete
      to authenticated
      using (private.can_edit_leads());
  end if;
end $$;

insert into public.billing_settings (
  business_name,
  legal_name,
  tax_id,
  fiscal_address,
  email,
  phone,
  iban,
  invoice_series,
  next_invoice_number,
  default_vat_rate,
  default_retention_rate,
  footer_text,
  logo_url
)
select
  'Firekworks',
  '',
  '',
  '',
  'hola@firekworks.es',
  '',
  '',
  'FW',
  1,
  21,
  0,
  'Emision fiscal definitiva pendiente de validacion con asesoria.',
  '/brand/firekworks-mark.svg'
where not exists (select 1 from public.billing_settings);
