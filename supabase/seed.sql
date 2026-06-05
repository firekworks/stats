insert into public.plans (id, name, description, monthly_price, included_services)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Growth Local', 'Contenido, Meta Ads y optimizacion local.', 790, '["Meta Ads", "Contenido", "Google Business Profile"]'::jsonb),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Performance Local', 'Campanas, contenido y seguimiento comercial.', 990, '["Meta Ads", "Instagram", "WhatsApp Business"]'::jsonb),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'Premium Ads + Contenido', 'Produccion, reporting avanzado y optimizacion mensual.', 1290, '["Meta Ads", "Contenido", "Landing", "Reporting"]'::jsonb)
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    monthly_price = excluded.monthly_price,
    included_services = excluded.included_services;

insert into public.services (id, name, category, base_price)
values
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'Meta Ads', 'ads', 490),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'Contenido mensual', 'content', 390),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'Google Business Profile', 'local_seo', 250),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4', 'WhatsApp Business', 'conversion', 220),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5', 'Landing local', 'landing', 390)
on conflict (id) do update
set name = excluded.name,
    category = excluded.category,
    base_price = excluded.base_price;

insert into public.clients (
  id,
  lead_id,
  name,
  sector,
  city,
  billing_name,
  tax_id,
  billing_email,
  status,
  source,
  legal_name,
  average_ticket,
  monthly_budget,
  service_fee,
  plan_id,
  show_in_leaderboard,
  public_leaderboard_name,
  client_portal_enabled,
  portal_status
)
values
  ('11111111-1111-4111-8111-111111111111', null, 'Casa Lumbre', 'Restaurante', 'Valencia', 'Restaurante Casa Lumbre SL', 'B00000001', 'admin@casalumbre.demo', 'Activo', 'manual', 'Restaurante Casa Lumbre SL', 32, 940, 790, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', true, 'Casa Lumbre', true, 'active'),
  ('22222222-2222-4222-8222-222222222222', null, 'PrimeFit Studio', 'Gimnasio', 'Alicante', 'PrimeFit Studio CB', 'B00000002', 'admin@primefit.demo', 'Activo', 'manual', 'PrimeFit Studio CB', 48, 1120, 990, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', false, 'Cliente local #02', true, 'active'),
  ('33333333-3333-4333-8333-333333333333', null, 'Derma Nova', 'Clinica estetica', 'Murcia', 'Clinica Derma Nova SL', 'B00000003', 'admin@dermanova.demo', 'Activo', 'manual', 'Clinica Derma Nova SL', 185, 1680, 1290, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', false, 'Clinica estetica', true, 'active')
on conflict (id) do update
set name = excluded.name,
    sector = excluded.sector,
    city = excluded.city,
    legal_name = excluded.legal_name,
    average_ticket = excluded.average_ticket,
    monthly_budget = excluded.monthly_budget,
    service_fee = excluded.service_fee,
    plan_id = excluded.plan_id,
    public_leaderboard_name = excluded.public_leaderboard_name,
    client_portal_enabled = excluded.client_portal_enabled,
    portal_status = excluded.portal_status;

insert into public.client_subscriptions (id, client_id, plan_id, status, monthly_fee)
values
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'active', 790),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc2', '22222222-2222-4222-8222-222222222222', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'active', 990),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc3', '33333333-3333-4333-8333-333333333333', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'active', 1290)
on conflict (id) do update
set status = excluded.status,
    monthly_fee = excluded.monthly_fee;

insert into public.campaigns (id, client_id, name, platform, objective, status, start_date, end_date, budget, spend, client_visible_summary)
values
  ('ffffffff-ffff-4fff-8fff-fffffffffff1', '11111111-1111-4111-8111-111111111111', 'Reservas cenas de fin de semana', 'Meta Ads', 'Reservas', 'active', '2026-04-01', '2026-04-30', 1150, 940, 'Campana centrada en reservas por WhatsApp con mejores resultados en jueves y viernes.'),
  ('ffffffff-ffff-4fff-8fff-fffffffffff2', '11111111-1111-4111-8111-111111111111', 'Google Business Profile - llamadas', 'Google Business', 'Llamadas', 'learning', '2026-04-01', null, 0, 0, 'Optimizacion organica de ficha con publicaciones, fotos y mejora de llamadas.'),
  ('ffffffff-ffff-4fff-8fff-fffffffffff3', '22222222-2222-4222-8222-222222222222', 'Prueba semanal PrimeFit', 'Instagram', 'Leads', 'active', '2026-04-03', '2026-04-30', 1350, 1120, 'Captacion de pruebas con creatividades de transformacion y mensajes directos.'),
  ('ffffffff-ffff-4fff-8fff-fffffffffff4', '33333333-3333-4333-8333-333333333333', 'Diagnostico facial primavera', 'Meta Ads', 'Reservas', 'learning', '2026-04-01', '2026-04-30', 1900, 1680, 'Campana educativa para generar consultas cualificadas sin promesas agresivas.')
on conflict (id) do update
set spend = excluded.spend,
    client_visible_summary = excluded.client_visible_summary;

insert into public.content_items (id, client_id, campaign_id, type, platform, title, caption, status, published_at, url, storage_path, client_visible)
values
  ('dddddddd-dddd-4ddd-8ddd-dddddddddd01', '11111111-1111-4111-8111-111111111111', 'ffffffff-ffff-4fff-8fff-fffffffffff1', 'Reel', 'Instagram', 'Reel menu degustacion de abril', 'Menu degustacion y reservas.', 'published', '2026-04-12T12:00:00Z', 'https://instagram.com/firekworks-demo', '11111111-1111-4111-8111-111111111111/reels/menu-abril.mp4', true),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddd03', '22222222-2222-4222-8222-222222222222', 'ffffffff-ffff-4fff-8fff-fffffffffff3', 'Carrusel', 'Instagram', 'Transformacion 8 semanas', 'Caso real y prueba semanal.', 'published', '2026-04-09T12:00:00Z', 'https://instagram.com/firekworks-demo', '22222222-2222-4222-8222-222222222222/carousels/8-semanas.zip', true),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddd04', '33333333-3333-4333-8333-333333333333', 'ffffffff-ffff-4fff-8fff-fffffffffff4', 'Reel', 'Instagram', 'Caso real tratamiento manchas', 'Contenido educativo con prueba visual.', 'published', '2026-04-15T12:00:00Z', 'https://instagram.com/firekworks-demo', '33333333-3333-4333-8333-333333333333/reels/manchas.mp4', true)
on conflict (id) do update
set title = excluded.title,
    status = excluded.status,
    client_visible = excluded.client_visible;

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
  best_content_id,
  summary_client,
  diagnosis_client,
  next_month_plan_client
)
values
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02', '11111111-1111-4111-8111-111111111111', 4, 2026, 53600, 109200, 788, 181, 226, 91, 72, 306, 482, 940, 790, 0, 5792, 3.3480, 'estimated', 'dddddddd-dddd-4ddd-8ddd-dddddddddd01', 'Abril mejora en alcance, mensajes y reservas estimadas gracias a reels y retargeting.', 'La campana de WhatsApp funciona mejor cuando el copy incluye horarios y menu degustacion.', 'Escalar presupuesto en fines de semana, publicar prueba social y crear landing de comuniones.'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee03', '22222222-2222-4222-8222-222222222222', 4, 2026, 31700, 74700, 510, 94, 121, 42, 26, 192, 318, 1120, 990, 180, 4512, 1.9703, 'real', 'dddddddd-dddd-4ddd-8ddd-dddddddddd03', 'Los testimonios y los anuncios de prueba semanal generaron leads de mejor calidad.', 'Hay demanda, pero la respuesta comercial en horas punta aun puede mejorar.', 'Automatizar WhatsApp, crear campana de parejas y optimizar formulario de clase gratuita.'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee04', '33333333-3333-4333-8333-333333333333', 4, 2026, 64200, 138900, 959, 83, 147, 31, 38, 271, 688, 1680, 1290, 420, 15355, 4.5294, 'estimated', 'dddddddd-dddd-4ddd-8ddd-dddddddddd04', 'El contenido educativo eleva la confianza y reduce coste por consulta cualificada.', 'Se necesita confirmar ventas reales para cerrar ROI; los datos actuales son estimados.', 'Secuencia de tratamientos de primavera, retargeting y captacion de resenas verificadas.')
on conflict (client_id, month, year) do update
set reach = excluded.reach,
    impressions = excluded.impressions,
    leads = excluded.leads,
    estimated_revenue = excluded.estimated_revenue,
    estimated_roi = excluded.estimated_roi,
    roi_type = excluded.roi_type,
    summary_client = excluded.summary_client,
    diagnosis_client = excluded.diagnosis_client,
    next_month_plan_client = excluded.next_month_plan_client;

insert into public.monthly_reports (id, client_id, month, year, title, summary, status, generated_at, pdf_storage_path)
values
  ('99999999-9999-4999-8999-999999999991', '11111111-1111-4111-8111-111111111111', 4, 2026, 'Informe mensual - Abril 2026', 'Resumen ejecutivo de abril.', 'generated', '2026-05-02T09:10:00Z', '11111111-1111-4111-8111-111111111111/reports/2026-04.pdf'),
  ('99999999-9999-4999-8999-999999999992', '22222222-2222-4222-8222-222222222222', 4, 2026, 'Informe mensual - Abril 2026', 'Resumen ejecutivo de abril.', 'sent', '2026-05-03T11:30:00Z', '22222222-2222-4222-8222-222222222222/reports/2026-04.pdf'),
  ('99999999-9999-4999-8999-999999999993', '33333333-3333-4333-8333-333333333333', 4, 2026, 'Informe mensual - Abril 2026', 'Resumen ejecutivo de abril.', 'draft', null, null)
on conflict (client_id, month, year) do update
set title = excluded.title,
    status = excluded.status,
    pdf_storage_path = excluded.pdf_storage_path;

insert into public.invoices (id, client_id, invoice_number, status, issue_date, due_date, subtotal, tax_rate, tax_amount, withholding_rate, withholding_amount, total)
values
  ('12121212-1212-4121-8121-121212121211', '11111111-1111-4111-8111-111111111111', 'FW-2026-0051', 'sent', '2026-05-01', '2026-05-10', 790, 21, 165.90, 0, 0, 955.90),
  ('12121212-1212-4121-8121-121212121212', '22222222-2222-4222-8222-222222222222', 'FW-2026-0052', 'paid', '2026-05-01', '2026-05-07', 1170, 21, 245.70, 0, 0, 1415.70),
  ('12121212-1212-4121-8121-121212121213', '33333333-3333-4333-8333-333333333333', 'FW-2026-0053', 'overdue', '2026-05-01', '2026-05-08', 1710, 21, 359.10, 0, 0, 2069.10)
on conflict (invoice_number) do update
set status = excluded.status,
    total = excluded.total;

insert into public.leaderboards (id, name, metric, month, year, is_public)
values
  ('abababab-abab-4aba-8aba-ababababab01', 'Mejor crecimiento mensual', 'growth', 4, 2026, true),
  ('abababab-abab-4aba-8aba-ababababab02', 'Mejor ROI estimado', 'estimated_roi', 4, 2026, true)
on conflict (name, month, year) do update
set metric = excluded.metric,
    is_public = excluded.is_public;

insert into public.leaderboard_entries (leaderboard_id, client_id, position, value, display_name, is_anonymous)
values
  ('abababab-abab-4aba-8aba-ababababab01', '33333333-3333-4333-8333-333333333333', 1, 42.8, 'Cliente local #1', true),
  ('abababab-abab-4aba-8aba-ababababab01', '11111111-1111-4111-8111-111111111111', 2, 31.4, 'Casa Lumbre', false),
  ('abababab-abab-4aba-8aba-ababababab01', '22222222-2222-4222-8222-222222222222', 3, 18.6, 'Cliente local #3', true),
  ('abababab-abab-4aba-8aba-ababababab02', '33333333-3333-4333-8333-333333333333', 1, 4.5294, 'Cliente local #1', true),
  ('abababab-abab-4aba-8aba-ababababab02', '11111111-1111-4111-8111-111111111111', 2, 3.3480, 'Casa Lumbre', false),
  ('abababab-abab-4aba-8aba-ababababab02', '22222222-2222-4222-8222-222222222222', 3, 1.9703, 'Cliente local #3', true)
on conflict (leaderboard_id, client_id) do update
set position = excluded.position,
    value = excluded.value,
    display_name = excluded.display_name,
    is_anonymous = excluded.is_anonymous;

insert into public.client_scores (
  client_id,
  score,
  level,
  level_name,
  communication_score,
  approval_speed_score,
  ease_of_work_score,
  profitability_score,
  growth_potential_score,
  churn_risk_score,
  perceived_satisfaction_score,
  internal_recommendation,
  visible_label
)
values
  ('11111111-1111-4111-8111-111111111111', 82, 4, 'Partner', 5, 4, 5, 4, 4, 2, 5, 'Candidato a caso de exito y testimonio.', 'Colaboracion Partner'),
  ('22222222-2222-4222-8222-222222222222', 68, 3, 'Pro', 4, 3, 4, 3, 4, 3, 4, 'Proponer mejora de plan y automatizacion WhatsApp.', 'Colaboracion Pro'),
  ('33333333-3333-4333-8333-333333333333', 88, 5, 'VIP', 5, 5, 4, 5, 5, 2, 5, 'Prioridad alta y pedir testimonio.', 'Colaboracion VIP')
on conflict (client_id) do update
set score = excluded.score,
    level = excluded.level,
    level_name = excluded.level_name,
    communication_score = excluded.communication_score,
    approval_speed_score = excluded.approval_speed_score,
    ease_of_work_score = excluded.ease_of_work_score,
    profitability_score = excluded.profitability_score,
    growth_potential_score = excluded.growth_potential_score,
    churn_risk_score = excluded.churn_risk_score,
    perceived_satisfaction_score = excluded.perceived_satisfaction_score,
    internal_recommendation = excluded.internal_recommendation,
    visible_label = excluded.visible_label;

insert into public.alerts (id, client_id, type, severity, title, description, visible_to_client)
values
  ('45454545-4545-4454-8454-454545454511', '33333333-3333-4333-8333-333333333333', 'upsell', 'success', 'Alto potencial de upsell', 'ROI estimado alto y buen ritmo de aprobaciones.', false),
  ('45454545-4545-4454-8454-454545454512', '22222222-2222-4222-8222-222222222222', 'response_time', 'warning', 'Mejorar respuesta comercial', 'Los leads de tarde tardan mas de 4 horas en recibir respuesta.', false)
on conflict (id) do update
set severity = excluded.severity,
    title = excluded.title,
    description = excluded.description,
    visible_to_client = excluded.visible_to_client;

insert into public.tasks (id, client_id, title, description, status, due_date, visible_to_client)
values
  ('56565656-5656-4565-8565-565656565611', '11111111-1111-4111-8111-111111111111', 'Aprobar guion de reel de temporada', 'Validar platos destacados y horarios de reserva.', 'pending', '2026-05-08', true),
  ('56565656-5656-4565-8565-565656565612', '22222222-2222-4222-8222-222222222222', 'Enviar horarios de clases de junio', 'Necesario para campana de prueba semanal.', 'in_progress', '2026-05-10', true),
  ('56565656-5656-4565-8565-565656565613', '33333333-3333-4333-8333-333333333333', 'Confirmar ventas reales de abril', 'Permite convertir ROI estimado en ROI real.', 'pending', '2026-05-09', true)
on conflict (id) do update
set title = excluded.title,
    description = excluded.description,
    status = excluded.status,
    due_date = excluded.due_date,
    visible_to_client = excluded.visible_to_client;
