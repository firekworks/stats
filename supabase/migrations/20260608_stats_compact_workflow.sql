-- Compact Stats workflow refinements.
-- Idempotent and non-destructive: adds fields used by the portal/client workflow
-- and refreshes fictional demo metadata only.

alter table public.clients add column if not exists plan_name text;
alter table public.clients add column if not exists drive_folder_url text;
alter table public.clients add column if not exists portal_access_token text;
alter table public.clients add column if not exists internal_notes text;

alter table public.content_items add column if not exists google_drive_file_id text;
alter table public.content_items add column if not exists drive_file_url text;
alter table public.content_items add column if not exists is_promoted boolean not null default false;
alter table public.content_items add column if not exists promotion_budget numeric(12,2) not null default 0;

alter table public.calendar_events add column if not exists sync_google_requested boolean not null default false;

alter table public.invoices add column if not exists payment_method text;
alter table public.invoices add column if not exists public_notes text;

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
  'Iker Maya Belda',
  '48782258V',
  'Calle San Vicente, 24, 03420 Castalla, Alicante, España',
  'hola@firekworks.es',
  '',
  '',
  'FW',
  1,
  21,
  0,
  'Emisión fiscal definitiva pendiente de validación con asesoría.',
  '/brand/firekworks-icon.png'
where not exists (select 1 from public.billing_settings);

update public.billing_settings
set
  business_name = 'Firekworks',
  legal_name = 'Iker Maya Belda',
  tax_id = '48782258V',
  fiscal_address = 'Calle San Vicente, 24, 03420 Castalla, Alicante, España',
  default_vat_rate = 21,
  default_retention_rate = 0,
  footer_text = 'Emisión fiscal definitiva pendiente de validación con asesoría.',
  updated_at = now()
where legal_name is null
   or legal_name = ''
   or legal_name = 'Pendiente de completar';

update public.clients
set
  plan_name = coalesce(plan_name, 'Demo Growth Local'),
  drive_folder_id = '1LADs_bhUkjGOfzl_qHYy3cve-oeTBtgw',
  drive_folder_url = 'https://drive.google.com/drive/folders/1LADs_bhUkjGOfzl_qHYy3cve-oeTBtgw',
  monthly_budget = 350,
  service_fee = 690
where id = '10000000-0000-4000-8000-000000000101';

update public.clients
set plan_name = coalesce(plan_name, 'Demo Primera Visita'), monthly_budget = 420, service_fee = 790
where id = '10000000-0000-4000-8000-000000000102';

update public.clients
set plan_name = coalesce(plan_name, 'Demo Reto Local'), monthly_budget = 290, service_fee = 690
where id = '10000000-0000-4000-8000-000000000103';

update public.content_items
set is_promoted = true, promotion_budget = 120, drive_file_url = coalesce(drive_file_url, url)
where id = '40000000-0000-4000-8000-000000000101';

update public.content_items
set is_promoted = true, promotion_budget = 80, drive_file_url = coalesce(drive_file_url, url)
where id = '40000000-0000-4000-8000-000000000102';

update public.content_items
set is_promoted = false, promotion_budget = 0, drive_file_url = coalesce(drive_file_url, url)
where id = '40000000-0000-4000-8000-000000000103';

insert into public.invoices (
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
  payment_method,
  public_notes
) values
  (
    '60000000-0000-4000-8000-000000000101',
    '10000000-0000-4000-8000-000000000101',
    'FW-2026-DEMO-101',
    '2026-06-01',
    '2026-06-07',
    'sent',
    690,
    21,
    144.90,
    0,
    0,
    834.90,
    'Transferencia',
    'Factura demo no fiscal.'
  ),
  (
    '60000000-0000-4000-8000-000000000102',
    '10000000-0000-4000-8000-000000000102',
    'FW-2026-DEMO-102',
    '2026-06-01',
    '2026-06-07',
    'paid',
    790,
    21,
    165.90,
    0,
    0,
    955.90,
    'Transferencia',
    'Factura demo no fiscal.'
  ),
  (
    '60000000-0000-4000-8000-000000000103',
    '10000000-0000-4000-8000-000000000103',
    'FW-2026-DEMO-103',
    '2026-06-01',
    '2026-06-07',
    'draft',
    690,
    21,
    144.90,
    0,
    0,
    834.90,
    'Transferencia',
    'Factura demo no fiscal.'
  )
on conflict (id) do update set
  status = excluded.status,
  subtotal = excluded.subtotal,
  tax_rate = excluded.tax_rate,
  tax_amount = excluded.tax_amount,
  withholding_rate = excluded.withholding_rate,
  withholding_amount = excluded.withholding_amount,
  total = excluded.total,
  payment_method = excluded.payment_method,
  public_notes = excluded.public_notes,
  updated_at = now();

insert into public.invoice_items (
  id,
  invoice_id,
  description,
  quantity,
  unit_price,
  total
) values
  (
    '61000000-0000-4000-8000-000000000101',
    '60000000-0000-4000-8000-000000000101',
    'Gestión mensual Growth Local demo',
    1,
    690,
    690
  ),
  (
    '61000000-0000-4000-8000-000000000102',
    '60000000-0000-4000-8000-000000000102',
    'Gestión mensual Primera Visita demo',
    1,
    790,
    790
  ),
  (
    '61000000-0000-4000-8000-000000000103',
    '60000000-0000-4000-8000-000000000103',
    'Gestión mensual Reto Local demo',
    1,
    690,
    690
  )
on conflict (id) do update set
  description = excluded.description,
  quantity = excluded.quantity,
  unit_price = excluded.unit_price,
  total = excluded.total;
