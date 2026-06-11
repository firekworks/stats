-- Stats admin campaign workflow.
-- Idempotent and non-destructive. Adds fields and optional config tables used by
-- the internal campaign generator without exposing internal playbooks to clients.

alter table public.clients add column if not exists instagram_url text;
alter table public.clients add column if not exists facebook_url text;
alter table public.clients add column if not exists whatsapp_url text;
alter table public.clients add column if not exists google_business_profile_url text;
alter table public.clients add column if not exists plan_name text;
alter table public.clients add column if not exists drive_folder_url text;
alter table public.clients add column if not exists internal_notes text;

alter table public.content_items add column if not exists client_visible boolean not null default false;
alter table public.content_items add column if not exists google_drive_file_id text;
alter table public.content_items add column if not exists drive_file_url text;
alter table public.content_items add column if not exists is_promoted boolean not null default false;
alter table public.content_items add column if not exists promotion_budget numeric(12,2) not null default 0;
alter table public.content_items add column if not exists preview_data jsonb not null default '{}'::jsonb;

alter table public.calendar_events add column if not exists sync_google_requested boolean not null default false;

create table if not exists public.client_packs (
  id text primary key,
  name text not null,
  price numeric(12,2) not null,
  description text,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.client_packs enable row level security;
grant select, insert, update, delete on public.client_packs to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'client_packs'
      and policyname = 'client_packs_internal_all'
  ) then
    create policy client_packs_internal_all
      on public.client_packs
      for all
      to authenticated
      using (private.can_edit_leads())
      with check (private.can_edit_leads());
  end if;
end $$;

insert into public.client_packs (id, name, price, description, config) values
  (
    'pack-390',
    'Pack 390 - Base local',
    390,
    'Presencia profesional minima y captacion basica.',
    '{
      "reels": 2,
      "carousels": 1,
      "posts": 1,
      "stories": "6-8",
      "gbp_posts": 2,
      "whatsapp": "1 respuesta rapida",
      "report": "simple",
      "ads_recommended": "60-90 EUR"
    }'::jsonb
  ),
  (
    'pack-590',
    'Pack 590 - Crecimiento local',
    590,
    'Embudo local mas completo.',
    '{
      "reels": 4,
      "carousels": 2,
      "posts": 1,
      "stories": "10-15",
      "gbp_posts": 4,
      "whatsapp": "setup basico con etiquetas y respuestas rapidas",
      "report": "completo",
      "ads_recommended": "90-150 EUR"
    }'::jsonb
  )
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  description = excluded.description,
  config = excluded.config,
  updated_at = now();

create table if not exists public.campaign_playbooks (
  id uuid primary key default gen_random_uuid(),
  sector text not null unique,
  objective text,
  pains jsonb not null default '[]'::jsonb,
  tone text,
  content_types jsonb not null default '[]'::jsonb,
  tofu_ideas jsonb not null default '[]'::jsonb,
  mofu_ideas jsonb not null default '[]'::jsonb,
  bofu_ideas jsonb not null default '[]'::jsonb,
  recommended_ads_budget text,
  gbp_checklist jsonb not null default '[]'::jsonb,
  whatsapp_checklist jsonb not null default '[]'::jsonb,
  calendar_30_days jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaign_playbooks enable row level security;
grant select, insert, update, delete on public.campaign_playbooks to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'campaign_playbooks'
      and policyname = 'campaign_playbooks_internal_all'
  ) then
    create policy campaign_playbooks_internal_all
      on public.campaign_playbooks
      for all
      to authenticated
      using (private.can_edit_leads())
      with check (private.can_edit_leads());
  end if;
end $$;

insert into public.campaign_playbooks (
  sector,
  objective,
  pains,
  tone,
  content_types,
  tofu_ideas,
  mofu_ideas,
  bofu_ideas,
  recommended_ads_budget,
  gbp_checklist,
  whatsapp_checklist,
  calendar_30_days
) values
  (
    'Restaurante',
    'Reservas y visitas de fin de semana',
    '["No saber donde cenar", "Falta de plan", "Hambre visual"]'::jsonb,
    'Cercano, apetitoso, local y directo',
    '["Reel", "Carrusel", "Story", "GBP", "WhatsApp"]'::jsonb,
    '["plato estrella", "ambiente de viernes"]'::jsonb,
    '["menu explicado", "mesa para grupos"]'::jsonb,
    '["reserva por WhatsApp", "oferta de fin de semana"]'::jsonb,
    '60-150 EUR',
    '["subir plato destacado", "publicar horario", "pedir reseñas"]'::jsonb,
    '["respuesta reservas", "mensaje horario", "etiqueta reserva caliente"]'::jsonb,
    '[]'::jsonb
  ),
  (
    'Dentista',
    'Primeras visitas y revisiones',
    '["Miedo", "Aplazar revisiones", "Dolor", "Falta de confianza"]'::jsonb,
    'Profesional, tranquilo, claro y humano',
    '["Reel", "Carrusel", "Post", "GBP", "WhatsApp"]'::jsonb,
    '["primera visita sin miedo", "senales para revisar"]'::jsonb,
    '["proceso explicado", "equipo cercano"]'::jsonb,
    '["pedir revision", "resolver dudas"]'::jsonb,
    '60-150 EUR',
    '["actualizar servicios", "publicar consejo", "responder reseñas"]'::jsonb,
    '["respuesta primera visita", "etiqueta pendiente cita", "recordatorio amable"]'::jsonb,
    '[]'::jsonb
  ),
  (
    'Gimnasio',
    'Pruebas, altas y reservas de clase',
    '["Empezar y sentirse perdido", "Falta de constancia", "Verguenza del primer dia"]'::jsonb,
    'Energetico, motivador, directo y acompanado',
    '["Reel", "Story", "Carrusel", "GBP", "WhatsApp"]'::jsonb,
    '["primer dia", "grupo entrenando"]'::jsonb,
    '["reto corto", "progreso real"]'::jsonb,
    '["reservar prueba", "plaza esta semana"]'::jsonb,
    '60-150 EUR',
    '["publicar clase", "actualizar horarios", "subir foto de grupo"]'::jsonb,
    '["respuesta clase prueba", "etiqueta prueba reservada", "bienvenida"]'::jsonb,
    '[]'::jsonb
  )
on conflict (sector) do update set
  objective = excluded.objective,
  pains = excluded.pains,
  tone = excluded.tone,
  content_types = excluded.content_types,
  tofu_ideas = excluded.tofu_ideas,
  mofu_ideas = excluded.mofu_ideas,
  bofu_ideas = excluded.bofu_ideas,
  recommended_ads_budget = excluded.recommended_ads_budget,
  gbp_checklist = excluded.gbp_checklist,
  whatsapp_checklist = excluded.whatsapp_checklist,
  calendar_30_days = excluded.calendar_30_days,
  updated_at = now();
