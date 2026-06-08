-- Stats demos, content planning and internal calendar.
-- Idempotent and non-destructive: it only adds compatible fields and upserts fictional demo rows.

alter table public.clients add column if not exists slug text;
alter table public.clients add column if not exists is_demo boolean not null default false;
alter table public.clients add column if not exists demo_label text;
alter table public.clients add column if not exists brand_colors jsonb not null default '[]'::jsonb;
alter table public.clients add column if not exists brand_voice text;
alter table public.clients add column if not exists target_audience text;
alter table public.clients add column if not exists objective text;
alter table public.clients add column if not exists services text[] not null default '{}';
alter table public.clients add column if not exists drive_folder_id text;
alter table public.clients add column if not exists drive_brand_folder_id text;
alter table public.clients add column if not exists drive_raw_folder_id text;
alter table public.clients add column if not exists drive_exports_folder_id text;
alter table public.clients add column if not exists drive_reports_folder_id text;
alter table public.clients add column if not exists converted_from_lead boolean not null default false;
alter table public.clients add column if not exists conversion_date date;
alter table public.clients add column if not exists original_lead_score integer;
alter table public.clients add column if not exists original_lead_city text;
alter table public.clients add column if not exists original_lead_sector text;

create unique index if not exists clients_slug_unique
  on public.clients(slug)
  where slug is not null;
create index if not exists idx_clients_is_demo
  on public.clients(is_demo);

alter table public.campaigns add column if not exists is_demo boolean not null default false;
alter table public.campaigns add column if not exists campaign_type text;
alter table public.campaigns add column if not exists offer text;
alter table public.campaigns add column if not exists target_audience text;
alter table public.campaigns add column if not exists funnel_stage text;
alter table public.campaigns add column if not exists funnel_stage_plan jsonb not null default '{}'::jsonb;
alter table public.campaigns add column if not exists metrics jsonb not null default '{}'::jsonb;
alter table public.campaigns add column if not exists recommendations text;
alter table public.campaigns add column if not exists launch_checklist jsonb not null default '[]'::jsonb;
alter table public.campaigns add column if not exists metric_mode text not null default 'manual';
alter table public.campaigns add column if not exists meta_ad_account_id text;
alter table public.campaigns add column if not exists meta_campaign_id text;
alter table public.campaigns add column if not exists meta_adset_id text;
alter table public.campaigns add column if not exists meta_ad_id text;
alter table public.campaigns add column if not exists results jsonb not null default '{}'::jsonb;

create index if not exists idx_campaigns_is_demo
  on public.campaigns(is_demo);
create index if not exists idx_campaigns_client_dates
  on public.campaigns(client_id, start_date, end_date);

alter table public.content_items add column if not exists content_code text;
alter table public.content_items add column if not exists objective text;
alter table public.content_items add column if not exists funnel_stage text;
alter table public.content_items add column if not exists hook text;
alter table public.content_items add column if not exists visual_brief text;
alter table public.content_items add column if not exists cta text;
alter table public.content_items add column if not exists due_date date;
alter table public.content_items add column if not exists publish_date date;
alter table public.content_items add column if not exists assigned_to uuid references auth.users(id) on delete set null;
alter table public.content_items add column if not exists google_drive_folder_id text;
alter table public.content_items add column if not exists drive_folder_id text;
alter table public.content_items add column if not exists canva_design_id text;
alter table public.content_items add column if not exists canva_edit_url text;
alter table public.content_items add column if not exists canva_view_url text;
alter table public.content_items add column if not exists meta_post_id text;
alter table public.content_items add column if not exists preview_image_url text;
alter table public.content_items add column if not exists preview_data jsonb not null default '{}'::jsonb;
alter table public.content_items add column if not exists notes text;
alter table public.content_items add column if not exists is_demo boolean not null default false;

create unique index if not exists content_items_client_code_unique
  on public.content_items(client_id, content_code)
  where content_code is not null;
create index if not exists idx_content_items_is_demo
  on public.content_items(is_demo);
create index if not exists idx_content_items_due_publish
  on public.content_items(client_id, due_date, publish_date);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  lead_id text references public.leads(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  content_item_id uuid references public.content_items(id) on delete set null,
  title text not null,
  type text not null,
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'done', 'cancelled')
  ),
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  google_maps_url text,
  google_calendar_event_id text,
  notes text,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_calendar_events_client_start
  on public.calendar_events(client_id, start_at);
create index if not exists idx_calendar_events_content_item_id
  on public.calendar_events(content_item_id);
create index if not exists idx_calendar_events_campaign_id
  on public.calendar_events(campaign_id);
create index if not exists idx_calendar_events_is_demo
  on public.calendar_events(is_demo);

alter table public.calendar_events enable row level security;
grant select, insert, update, delete on public.calendar_events to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'calendar_events'
      and policyname = 'calendar_events_select_client_or_internal'
  ) then
    create policy calendar_events_select_client_or_internal
      on public.calendar_events
      for select
      to authenticated
      using (
        client_id is null
        or private.can_view_client(client_id)
        or is_demo = true
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'calendar_events'
      and policyname = 'calendar_events_write_internal'
  ) then
    create policy calendar_events_write_internal
      on public.calendar_events
      for all
      to authenticated
      using (private.can_edit_leads())
      with check (private.can_edit_leads());
  end if;
end $$;

create table if not exists public.demo_metrics (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  period date not null,
  reach integer not null default 0,
  impressions integer not null default 0,
  clicks integer not null default 0,
  leads integer not null default 0,
  messages integer not null default 0,
  bookings integer not null default 0,
  spend numeric(12,2) not null default 0,
  cpl numeric(12,2) not null default 0,
  content_published integer not null default 0,
  created_at timestamptz not null default now(),
  unique (client_id, period)
);

alter table public.demo_metrics enable row level security;
grant select, insert, update, delete on public.demo_metrics to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'demo_metrics'
      and policyname = 'demo_metrics_select_internal'
  ) then
    create policy demo_metrics_select_internal
      on public.demo_metrics
      for select
      to authenticated
      using (private.can_edit_leads() or private.can_view_client(client_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'demo_metrics'
      and policyname = 'demo_metrics_write_internal'
  ) then
    create policy demo_metrics_write_internal
      on public.demo_metrics
      for all
      to authenticated
      using (private.can_edit_leads())
      with check (private.can_edit_leads());
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles drop constraint profiles_role_check;
  end if;

  alter table public.profiles
    add constraint profiles_role_check
    check (role in ('admin', 'team', 'sales', 'viewer', 'client', 'demo_viewer'));
end $$;

insert into public.clients (
  id,
  slug,
  name,
  legal_name,
  sector,
  city,
  status,
  source,
  is_demo,
  demo_label,
  logo_url,
  brand_colors,
  brand_voice,
  target_audience,
  objective,
  services,
  average_ticket,
  monthly_budget,
  service_fee,
  client_portal_enabled,
  portal_status,
  show_in_leaderboard,
  public_leaderboard_name,
  billing_name,
  billing_email,
  billing_address
) values
  (
    '10000000-0000-4000-8000-000000000101',
    'restaurante-brasa-norte',
    'Restaurante Brasa Norte',
    'Restaurante Brasa Norte Demo SL',
    'Restaurante',
    'Castalla',
    'Activo',
    'demo',
    true,
    'Demo Firekworks',
    '/brand/firekworks-icon.png',
    '["#1d1d1f", "#b7791f", "#f97316"]'::jsonb,
    'Cercano, apetitoso, local y directo. Mucho énfasis en reservas de fin de semana.',
    'Parejas, familias y grupos locales que buscan cenar bien sin desplazarse.',
    'Aumentar reservas de fin de semana mediante contenido mensual, Meta Ads, GBP y WhatsApp.',
    array['Contenido mensual', 'Meta Ads', 'Google Business Profile', 'WhatsApp'],
    35,
    350,
    690,
    true,
    'demo',
    true,
    'Restaurante local demo',
    'Restaurante Brasa Norte Demo SL',
    'demo-brasa@firekworks.local',
    'Calle Demo 12, Castalla'
  ),
  (
    '10000000-0000-4000-8000-000000000102',
    'clinica-dental-sonrisa-ibi',
    'Clínica Dental Sonrisa Ibi',
    'Clinica Dental Sonrisa Ibi Demo SL',
    'Clínica dental',
    'Ibi',
    'Activo',
    'demo',
    true,
    'Demo Firekworks',
    '/brand/firekworks-icon.png',
    '["#0f9f8f", "#0071e3", "#f5f5f7"]'::jsonb,
    'Profesional, tranquilo, educativo y basado en confianza.',
    'Familias y adultos de Ibi que necesitan revisión, limpieza o primera visita.',
    'Captar primeras visitas y limpiezas con landing, embudo de leads y seguimiento.',
    array['Embudo de leads', 'Landing', 'Meta Ads', 'Seguimiento'],
    85,
    420,
    790,
    true,
    'demo',
    false,
    'Clínica dental demo',
    'Clinica Dental Sonrisa Ibi Demo SL',
    'demo-sonrisa@firekworks.local',
    'Avenida Demo 8, Ibi'
  ),
  (
    '10000000-0000-4000-8000-000000000103',
    'fitbox-elda',
    'FitBox Elda',
    'FitBox Elda Demo CB',
    'Gimnasio',
    'Elda',
    'Activo',
    'demo',
    true,
    'Demo Firekworks',
    '/brand/firekworks-icon.png',
    '["#001020", "#2f9e44", "#0071e3"]'::jsonb,
    'Energético, motivador, competitivo y muy visual.',
    'Personas de Elda que quieren probar entrenamientos intensos sin compromiso.',
    'Captar nuevos socios con reels, prueba gratuita, campañas Meta y reporting.',
    array['Reels', 'Campañas Meta', 'Prueba gratuita', 'Reporting'],
    49,
    290,
    690,
    true,
    'demo',
    true,
    'Gimnasio demo',
    'FitBox Elda Demo CB',
    'demo-fitbox@firekworks.local',
    'Polígono Demo 4, Elda'
  )
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  legal_name = excluded.legal_name,
  sector = excluded.sector,
  city = excluded.city,
  source = excluded.source,
  is_demo = true,
  demo_label = excluded.demo_label,
  logo_url = excluded.logo_url,
  brand_colors = excluded.brand_colors,
  brand_voice = excluded.brand_voice,
  target_audience = excluded.target_audience,
  objective = excluded.objective,
  services = excluded.services,
  average_ticket = excluded.average_ticket,
  monthly_budget = excluded.monthly_budget,
  service_fee = excluded.service_fee,
  client_portal_enabled = true,
  portal_status = 'demo',
  updated_at = now();

insert into public.campaigns (
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
  planned_budget,
  real_spend,
  client_visible_summary,
  is_demo,
  campaign_type,
  offer,
  target_audience,
  funnel_stage,
  funnel_stage_plan,
  metrics,
  recommendations,
  launch_checklist,
  metric_mode,
  results,
  source,
  sync_status,
  lifecycle_status
) values
  (
    '20000000-0000-4000-8000-000000000101',
    '10000000-0000-4000-8000-000000000101',
    'Reservas fin de semana Brasa Norte',
    'Meta Ads',
    'Reservas',
    'active',
    '2026-06-01',
    '2026-06-30',
    350,
    350,
    350,
    350,
    'Campaña demo para convertir alcance local en reservas por WhatsApp.',
    true,
    'Reservas',
    'Menú brasa de viernes a domingo con reserva por WhatsApp',
    'Familias y grupos de Castalla',
    'Conversión',
    '{"diagnostico":"Fines de semana con huecos de reserva","atraccion":"Reels de platos y ambiente","confianza":"Reseñas y cocina visible","conversion":"CTA directo a WhatsApp","remarketing":"Impacto a interactuadores"}'::jsonb,
    '{"reach":42800,"clicks":318,"bookings":46,"cpl":2.90}'::jsonb,
    'Mantener creatividad con producto real y reforzar horarios de jueves.',
    '["Oferta clara", "WhatsApp conectado", "Creatividades aprobadas", "Medición semanal"]'::jsonb,
    'demo',
    '{"messages":318,"leads":121,"bookings":46}'::jsonb,
    'demo',
    'manual',
    'active'
  ),
  (
    '20000000-0000-4000-8000-000000000102',
    '10000000-0000-4000-8000-000000000102',
    'Primeras visitas Sonrisa Ibi',
    'Meta Ads',
    'Leads',
    'active',
    '2026-06-01',
    '2026-06-30',
    420,
    420,
    420,
    420,
    'Embudo demo para captar primeras visitas y limpiezas mediante landing.',
    true,
    'Captación WhatsApp',
    'Primera visita + limpieza con diagnóstico inicial',
    'Familias y adultos de Ibi',
    'Conversión',
    '{"diagnostico":"Baja recurrencia de primeras visitas","atraccion":"Educación dental local","confianza":"Equipo y proceso","conversion":"Landing + formulario","remarketing":"Objeciones de precio/miedo"}'::jsonb,
    '{"reach":31200,"leads":82,"bookings":29,"cpl":4.70}'::jsonb,
    'Probar creatividades de confianza con doctora y proceso paso a paso.',
    '["Landing revisada", "Formulario activo", "Creatividades de confianza", "Seguimiento preparado"]'::jsonb,
    'demo',
    '{"leads":82,"bookings":29}'::jsonb,
    'demo',
    'manual',
    'active'
  ),
  (
    '20000000-0000-4000-8000-000000000103',
    '10000000-0000-4000-8000-000000000103',
    'Prueba gratuita FitBox Elda',
    'Instagram',
    'Leads',
    'active',
    '2026-06-01',
    '2026-06-30',
    290,
    290,
    290,
    290,
    'Campaña demo para transformar reels en formularios y pruebas reservadas.',
    true,
    'Promoción local',
    'Clase gratuita de entrenamiento funcional',
    'Jóvenes y adultos activos de Elda',
    'Conversión',
    '{"diagnostico":"Necesidad de nuevos socios mensuales","atraccion":"Reels intensos","confianza":"Transformaciones y ambiente","conversion":"Formulario de prueba","remarketing":"Testimonios de socios"}'::jsonb,
    '{"reach":58400,"leads":124,"bookings":37,"cpl":2.35}'::jsonb,
    'Escalar reels con mayor retención y reforzar prueba social.',
    '["Oferta prueba gratuita", "Formulario conectado", "Reels aprobados", "Audiencia local"]'::jsonb,
    'demo',
    '{"leads":124,"bookings":37}'::jsonb,
    'demo',
    'manual',
    'active'
  )
on conflict (id) do update set
  name = excluded.name,
  status = excluded.status,
  budget = excluded.budget,
  spend = excluded.spend,
  client_visible_summary = excluded.client_visible_summary,
  is_demo = true,
  metrics = excluded.metrics,
  results = excluded.results,
  updated_at = now();

insert into public.monthly_metrics (
  id,
  client_id,
  month,
  year,
  reach,
  impressions,
  clicks,
  leads,
  messages,
  bookings,
  calls,
  whatsapp_clicks,
  website_clicks,
  ad_spend,
  service_fee,
  extra_costs,
  estimated_revenue,
  estimated_roi,
  roi_type,
  summary_client,
  diagnosis_client,
  next_month_plan_client,
  data_status,
  source_summary
) values
  (
    '30000000-0000-4000-8000-000000000101',
    '10000000-0000-4000-8000-000000000101',
    6,
    2026,
    42800,
    91300,
    602,
    121,
    318,
    46,
    22,
    318,
    164,
    350,
    690,
    0,
    1610,
    1.55,
    'estimated',
    'La demo muestra cómo Firekworks convierte contenido local y anuncios en reservas medibles.',
    'El mayor potencial está en reforzar WhatsApp y creatividades de plato/ambiente.',
    'Mantener campaña de reservas, añadir reseñas y publicar 3 reels de producto.',
    'demo',
    '{"content_published":12,"cpl":2.90}'::jsonb
  ),
  (
    '30000000-0000-4000-8000-000000000102',
    '10000000-0000-4000-8000-000000000102',
    6,
    2026,
    31200,
    68400,
    448,
    82,
    96,
    29,
    18,
    74,
    146,
    420,
    790,
    0,
    2465,
    2.04,
    'estimated',
    'La demo enseña un embudo de primeras visitas con landing, anuncios y seguimiento.',
    'La confianza clínica y una oferta clara reducen fricción antes del formulario.',
    'Activar remarketing con prueba social y resolver objeciones frecuentes.',
    'demo',
    '{"content_published":9,"cpl":4.70}'::jsonb
  ),
  (
    '30000000-0000-4000-8000-000000000103',
    '10000000-0000-4000-8000-000000000103',
    6,
    2026,
    58400,
    118900,
    824,
    124,
    141,
    37,
    11,
    136,
    209,
    290,
    690,
    0,
    1813,
    1.85,
    'estimated',
    'La demo refleja una campaña intensa de reels y prueba gratuita para captar socios.',
    'El contenido de entrenamiento real genera atención y los formularios convierten rápido.',
    'Duplicar reels ganadores, preparar remarketing y añadir testimonios de socios.',
    'demo',
    '{"content_published":15,"cpl":2.35}'::jsonb
  )
on conflict (client_id, month, year) do update set
  reach = excluded.reach,
  impressions = excluded.impressions,
  clicks = excluded.clicks,
  leads = excluded.leads,
  messages = excluded.messages,
  bookings = excluded.bookings,
  calls = excluded.calls,
  whatsapp_clicks = excluded.whatsapp_clicks,
  website_clicks = excluded.website_clicks,
  ad_spend = excluded.ad_spend,
  service_fee = excluded.service_fee,
  estimated_revenue = excluded.estimated_revenue,
  estimated_roi = excluded.estimated_roi,
  roi_type = excluded.roi_type,
  summary_client = excluded.summary_client,
  diagnosis_client = excluded.diagnosis_client,
  next_month_plan_client = excluded.next_month_plan_client,
  data_status = 'demo',
  source_summary = excluded.source_summary,
  updated_at = now();

insert into public.content_items (
  id,
  client_id,
  campaign_id,
  content_code,
  type,
  platform,
  title,
  caption,
  status,
  published_at,
  publish_date,
  due_date,
  url,
  client_visible,
  objective,
  funnel_stage,
  hook,
  visual_brief,
  cta,
  preview_data,
  notes,
  is_demo,
  source,
  sync_status,
  lifecycle_status
) values
  (
    '40000000-0000-4000-8000-000000000101',
    '10000000-0000-4000-8000-000000000101',
    '20000000-0000-4000-8000-000000000101',
    'REEL-001',
    'Reel',
    'Instagram',
    'Brasa encendida: reservas de viernes',
    'Este viernes la brasa ya tiene nombre. Reserva por WhatsApp y ven con tu grupo.',
    'published',
    '2026-06-07 18:30:00+02',
    '2026-06-07',
    '2026-06-05',
    '#',
    true,
    'Reservas de fin de semana',
    'Conversión',
    'El sonido de la brasa antes de abrir puertas.',
    'Plano corto de carne en brasa, sala preparada y CTA final.',
    'Reservar por WhatsApp',
    '{"format":"reel","scenes":["Brasa","Plato final","Sala llena","CTA WhatsApp"]}'::jsonb,
    'Demo interna. Diseño final en Canva/Adobe.',
    true,
    'demo',
    'manual',
    'published'
  ),
  (
    '40000000-0000-4000-8000-000000000102',
    '10000000-0000-4000-8000-000000000102',
    '20000000-0000-4000-8000-000000000102',
    'POST-001',
    'Post',
    'Instagram',
    'Primera visita sin miedo',
    'Tu primera visita empieza con calma: revisamos, explicamos y decidimos contigo.',
    'scheduled',
    null,
    '2026-06-12',
    '2026-06-10',
    '#',
    true,
    'Captar primeras visitas',
    'Confianza',
    'Si hace tiempo que no vienes al dentista, esto es para ti.',
    'Post cuadrado con doctora, gabinete y puntos del proceso.',
    'Pedir cita',
    '{"format":"post","headline":"Primera visita sin miedo","bullets":["Revisión","Explicación clara","Plan personalizado"]}'::jsonb,
    'Demo interna. Diseño final en Canva/Adobe.',
    true,
    'demo',
    'manual',
    'scheduled'
  ),
  (
    '40000000-0000-4000-8000-000000000103',
    '10000000-0000-4000-8000-000000000103',
    '20000000-0000-4000-8000-000000000103',
    'CAR-001',
    'Carrusel',
    'Instagram',
    '5 razones para probar FitBox',
    'No necesitas estar en forma para empezar. Necesitas empezar para estarlo.',
    'editing',
    null,
    '2026-06-14',
    '2026-06-11',
    '#',
    true,
    'Reservar prueba gratuita',
    'Consideración',
    '¿Y si esta semana fuera la primera?',
    'Carrusel con portada fuerte, beneficios y última slide con CTA.',
    'Reservar prueba gratuita',
    '{"format":"carousel","slides":["Portada","Ambiente","Entrenador","Comunidad","CTA"]}'::jsonb,
    'Demo interna. Diseño final en Canva/Adobe.',
    true,
    'demo',
    'manual',
    'approved'
  )
on conflict (id) do update set
  content_code = excluded.content_code,
  title = excluded.title,
  caption = excluded.caption,
  status = excluded.status,
  publish_date = excluded.publish_date,
  due_date = excluded.due_date,
  objective = excluded.objective,
  funnel_stage = excluded.funnel_stage,
  hook = excluded.hook,
  visual_brief = excluded.visual_brief,
  cta = excluded.cta,
  preview_data = excluded.preview_data,
  notes = excluded.notes,
  is_demo = true,
  updated_at = now();

insert into public.calendar_events (
  id,
  client_id,
  campaign_id,
  content_item_id,
  title,
  type,
  status,
  start_at,
  end_at,
  location,
  notes,
  is_demo
) values
  (
    '50000000-0000-4000-8000-000000000101',
    '10000000-0000-4000-8000-000000000101',
    '20000000-0000-4000-8000-000000000101',
    '40000000-0000-4000-8000-000000000101',
    'Publicación REEL-001 Brasa Norte',
    'Publicación reel',
    'confirmed',
    '2026-06-07 18:30:00+02',
    '2026-06-07 19:00:00+02',
    'Instagram',
    'Publicar reel demo con CTA a WhatsApp.',
    true
  ),
  (
    '50000000-0000-4000-8000-000000000102',
    '10000000-0000-4000-8000-000000000102',
    '20000000-0000-4000-8000-000000000102',
    '40000000-0000-4000-8000-000000000102',
    'Revisión POST-001 Sonrisa Ibi',
    'Revisión cliente',
    'pending',
    '2026-06-10 10:30:00+02',
    '2026-06-10 11:00:00+02',
    'Stats',
    'Revisar copy y visual antes de programar.',
    true
  ),
  (
    '50000000-0000-4000-8000-000000000103',
    '10000000-0000-4000-8000-000000000103',
    '20000000-0000-4000-8000-000000000103',
    '40000000-0000-4000-8000-000000000103',
    'Entrega CAR-001 FitBox',
    'Entrega',
    'pending',
    '2026-06-11 16:00:00+02',
    '2026-06-11 16:30:00+02',
    'Stats',
    'Preparar slides finales y CTA.',
    true
  )
on conflict (id) do update set
  title = excluded.title,
  type = excluded.type,
  status = excluded.status,
  start_at = excluded.start_at,
  end_at = excluded.end_at,
  notes = excluded.notes,
  is_demo = true,
  updated_at = now();

insert into public.demo_metrics (
  client_id,
  period,
  reach,
  impressions,
  clicks,
  leads,
  messages,
  bookings,
  spend,
  cpl,
  content_published
) values
  ('10000000-0000-4000-8000-000000000101', '2026-06-01', 42800, 91300, 602, 121, 318, 46, 350, 2.90, 12),
  ('10000000-0000-4000-8000-000000000102', '2026-06-01', 31200, 68400, 448, 82, 96, 29, 420, 4.70, 9),
  ('10000000-0000-4000-8000-000000000103', '2026-06-01', 58400, 118900, 824, 124, 141, 37, 290, 2.35, 15)
on conflict (client_id, period) do update set
  reach = excluded.reach,
  impressions = excluded.impressions,
  clicks = excluded.clicks,
  leads = excluded.leads,
  messages = excluded.messages,
  bookings = excluded.bookings,
  spend = excluded.spend,
  cpl = excluded.cpl,
  content_published = excluded.content_published;
