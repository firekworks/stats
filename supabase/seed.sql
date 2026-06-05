insert into public.plans (id, name, description, monthly_fee, included_ad_spend)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Growth Local', 'Contenido, campanas locales y optimizacion de ficha.', 790, 0),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Performance Local', 'Campanas, contenido y seguimiento comercial.', 990, 0),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'Premium Ads + Contenido', 'Gestion premium con produccion y reporting avanzado.', 1290, 0)
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    monthly_fee = excluded.monthly_fee;

insert into public.services (id, name, category, description, default_price)
values
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'Meta Ads', 'ads', 'Gestion de campanas Meta Ads.', 490),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'Contenido mensual', 'content', 'Reels, posts, carruseles y creatividades.', 390),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'Google Business Profile', 'local_seo', 'Publicaciones, fotos, llamadas y optimizacion GBP.', 250),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4', 'WhatsApp Business', 'conversion', 'Flujos, etiquetas y seguimiento de mensajes.', 220),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5', 'Landing local', 'landing', 'Landing de captacion para negocios locales.', 390)
on conflict (id) do update
set name = excluded.name,
    category = excluded.category,
    description = excluded.description,
    default_price = excluded.default_price;

insert into public.clients (
  id,
  slug,
  public_name,
  legal_name,
  public_leaderboard_name,
  allow_public_leaderboard_name,
  industry,
  city,
  status,
  average_ticket,
  tax_id,
  fiscal_email,
  onboarded_at
)
values
  ('11111111-1111-4111-8111-111111111111', 'casa-lumbre', 'Casa Lumbre', 'Restaurante Casa Lumbre SL', 'Casa Lumbre', true, 'Restaurante', 'Valencia', 'active', 32, 'B00000001', 'admin@casalumbre.demo', '2025-10-01'),
  ('22222222-2222-4222-8222-222222222222', 'primefit', 'PrimeFit Studio', 'PrimeFit Studio CB', 'Cliente local #02', false, 'Gimnasio', 'Alicante', 'active', 48, 'B00000002', 'admin@primefit.demo', '2025-08-15'),
  ('33333333-3333-4333-8333-333333333333', 'derma-nova', 'Derma Nova', 'Clinica Derma Nova SL', 'Clinica estetica', false, 'Clinica estetica', 'Murcia', 'active', 185, 'B00000003', 'admin@dermanova.demo', '2025-06-01')
on conflict (id) do update
set public_name = excluded.public_name,
    legal_name = excluded.legal_name,
    public_leaderboard_name = excluded.public_leaderboard_name,
    allow_public_leaderboard_name = excluded.allow_public_leaderboard_name,
    industry = excluded.industry,
    city = excluded.city,
    status = excluded.status,
    average_ticket = excluded.average_ticket;

insert into public.subscriptions (id, client_id, plan_id, status, starts_on, monthly_fee)
values
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'active', '2025-10-01', 790),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc2', '22222222-2222-4222-8222-222222222222', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'active', '2025-08-15', 990),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc3', '33333333-3333-4333-8333-333333333333', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'active', '2025-06-01', 1290)
on conflict (id) do update
set status = excluded.status,
    monthly_fee = excluded.monthly_fee;

insert into public.content_items (
  id,
  client_id,
  title,
  type,
  platform,
  publish_date,
  status,
  url,
  storage_path,
  views,
  reach,
  likes,
  comments,
  shares,
  saves,
  engagement_rate,
  performance,
  reusable,
  learning
)
values
  ('dddddddd-dddd-4ddd-8ddd-dddddddddd01', '11111111-1111-4111-8111-111111111111', 'Reel menu degustacion de abril', 'Reel', 'Instagram', '2026-04-12', 'published', 'https://instagram.com/firekworks-demo', '11111111-1111-4111-8111-111111111111/reels/menu-abril.mp4', 28400, 22100, 946, 82, 146, 312, 6.7, 'viral', true, 'Los planos de cocina y el remate con precio aproximado elevaron guardados y reservas.'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddd02', '11111111-1111-4111-8111-111111111111', 'Post brunch domingo', 'Post', 'Facebook', '2026-04-20', 'published', 'https://facebook.com/firekworks-demo', null, 3800, 3100, 71, 6, 4, 11, 3.0, 'ok', false, 'El formato estatico funciono peor que el video corto para producto gastronomico.'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddd03', '22222222-2222-4222-8222-222222222222', 'Transformacion 8 semanas', 'Carrusel', 'Instagram', '2026-04-09', 'published', 'https://instagram.com/firekworks-demo', '22222222-2222-4222-8222-222222222222/carousels/8-semanas.zip', 12100, 9400, 502, 44, 89, 166, 8.5, 'high', true, 'El antes/despues con historia concreta consigue leads mas decididos.'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddd04', '33333333-3333-4333-8333-333333333333', 'Caso real tratamiento manchas', 'Reel', 'Instagram', '2026-04-15', 'published', 'https://instagram.com/firekworks-demo', '33333333-3333-4333-8333-333333333333/reels/manchas.mp4', 34200, 28700, 1204, 96, 214, 481, 7.0, 'viral', true, 'La prueba visual con contexto clinico genera confianza y preguntas cualificadas.')
on conflict (id) do update
set title = excluded.title,
    views = excluded.views,
    reach = excluded.reach,
    engagement_rate = excluded.engagement_rate,
    performance = excluded.performance,
    learning = excluded.learning;

insert into public.monthly_metrics (
  id,
  client_id,
  month,
  year,
  reach,
  impressions,
  profile_visits,
  website_clicks,
  calls,
  whatsapp_clicks,
  messages,
  leads,
  bookings,
  estimated_revenue,
  real_revenue,
  ad_spend,
  service_fee,
  extras,
  estimated_roi,
  real_roi,
  roi_mode,
  best_content_id,
  worst_content_id,
  summary,
  diagnosis,
  next_month_plan
)
values
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01', '11111111-1111-4111-8111-111111111111', 3, 2026, 42800, 86100, 1890, 364, 57, 219, 173, 142, 68, 4544, null, 820, 790, 120, 2.6266, null, 'estimated', 'dddddddd-dddd-4ddd-8ddd-dddddddddd01', 'dddddddd-dddd-4ddd-8ddd-dddddddddd02', 'El contenido de producto y los anuncios de reservas concentraron el crecimiento del mes.', 'El coste por lead se mantiene sano; conviene reforzar cenas de jueves y viernes.', 'Nueva secuencia de reels de menu, campana de reservas y prueba de creatividades para grupos.'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02', '11111111-1111-4111-8111-111111111111', 4, 2026, 53600, 109200, 2540, 482, 72, 306, 226, 181, 91, 5792, null, 940, 790, 0, 3.3480, null, 'estimated', 'dddddddd-dddd-4ddd-8ddd-dddddddddd01', 'dddddddd-dddd-4ddd-8ddd-dddddddddd02', 'Abril mejora en alcance, mensajes y reservas estimadas gracias a reels y retargeting.', 'La campana de WhatsApp funciona mejor cuando el copy incluye horarios y menu degustacion.', 'Escalar presupuesto en fines de semana, publicar prueba social y crear landing de comuniones.'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee03', '22222222-2222-4222-8222-222222222222', 4, 2026, 31700, 74700, 1305, 318, 26, 192, 121, 94, 42, 4512, 4920, 1120, 990, 180, 1.9703, 2.1485, 'real', 'dddddddd-dddd-4ddd-8ddd-dddddddddd03', null, 'Los testimonios y los anuncios de prueba semanal generaron leads de mejor calidad.', 'Hay demanda, pero la respuesta comercial en horas punta aun puede mejorar.', 'Automatizar WhatsApp, crear campana de parejas y optimizar formulario de clase gratuita.'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee04', '33333333-3333-4333-8333-333333333333', 4, 2026, 64200, 138900, 2260, 688, 38, 271, 147, 83, 31, 15355, null, 1680, 1290, 420, 4.5294, null, 'estimated', 'dddddddd-dddd-4ddd-8ddd-dddddddddd04', null, 'El contenido educativo eleva la confianza y reduce coste por consulta cualificada.', 'Se necesita confirmar ventas reales para cerrar ROI; los datos actuales son estimados.', 'Secuencia de tratamientos de primavera, retargeting y captacion de resenas verificadas.')
on conflict (client_id, month, year) do update
set reach = excluded.reach,
    impressions = excluded.impressions,
    leads = excluded.leads,
    estimated_revenue = excluded.estimated_revenue,
    estimated_roi = excluded.estimated_roi,
    roi_mode = excluded.roi_mode,
    summary = excluded.summary,
    diagnosis = excluded.diagnosis,
    next_month_plan = excluded.next_month_plan;

insert into public.campaigns (
  id,
  client_id,
  name,
  platform,
  objective,
  budget,
  spend,
  start_date,
  end_date,
  status,
  ctr,
  cpc,
  cpm,
  leads,
  cost_per_lead,
  roas,
  visible_summary
)
values
  ('ffffffff-ffff-4fff-8fff-fffffffffff1', '11111111-1111-4111-8111-111111111111', 'Reservas cenas de fin de semana', 'Meta Ads', 'Reservas', 1150, 940, '2026-04-01', '2026-04-30', 'active', 2.9, 0.72, 8.6, 181, 5.19, 2.8, 'Campana centrada en reservas por WhatsApp con mejores resultados en jueves y viernes.'),
  ('ffffffff-ffff-4fff-8fff-fffffffffff2', '11111111-1111-4111-8111-111111111111', 'Google Business Profile - llamadas', 'Google Business', 'Llamadas', 0, 0, '2026-04-01', null, 'learning', 0, 0, 0, 72, 0, null, 'Optimizacion organica de ficha con publicaciones, fotos y mejora de llamadas.'),
  ('ffffffff-ffff-4fff-8fff-fffffffffff3', '22222222-2222-4222-8222-222222222222', 'Prueba semanal PrimeFit', 'Instagram', 'Leads', 1350, 1120, '2026-04-03', '2026-04-30', 'active', 2.4, 0.91, 7.8, 94, 11.91, 2.15, 'Captacion de pruebas con creatividades de transformacion y mensajes directos.'),
  ('ffffffff-ffff-4fff-8fff-fffffffffff4', '33333333-3333-4333-8333-333333333333', 'Diagnostico facial primavera', 'Meta Ads', 'Reservas', 1900, 1680, '2026-04-01', '2026-04-30', 'learning', 1.8, 1.62, 12.2, 83, 20.24, null, 'Campana educativa para generar consultas cualificadas sin promesas agresivas.')
on conflict (id) do update
set spend = excluded.spend,
    leads = excluded.leads,
    cost_per_lead = excluded.cost_per_lead,
    visible_summary = excluded.visible_summary;

insert into public.reports (id, client_id, month, year, title, status, storage_path, generated_at)
values
  ('99999999-9999-4999-8999-999999999991', '11111111-1111-4111-8111-111111111111', 4, 2026, 'Informe mensual - Abril 2026', 'generated', '11111111-1111-4111-8111-111111111111/reports/2026-04.pdf', '2026-05-02T09:10:00Z'),
  ('99999999-9999-4999-8999-999999999992', '22222222-2222-4222-8222-222222222222', 4, 2026, 'Informe mensual - Abril 2026', 'sent', '22222222-2222-4222-8222-222222222222/reports/2026-04.pdf', '2026-05-03T11:30:00Z'),
  ('99999999-9999-4999-8999-999999999993', '33333333-3333-4333-8333-333333333333', 4, 2026, 'Informe mensual - Abril 2026', 'draft', null, null)
on conflict (client_id, month, year) do update
set title = excluded.title,
    status = excluded.status,
    storage_path = excluded.storage_path,
    generated_at = excluded.generated_at;

insert into public.invoices (
  id,
  client_id,
  invoice_number,
  status,
  issue_date,
  due_date,
  taxable_base,
  vat_rate,
  withholding_rate,
  total,
  payment_method,
  public_notes
)
values
  ('12121212-1212-4121-8121-121212121211', '11111111-1111-4111-8111-111111111111', 'FW-2026-0051', 'sent', '2026-05-01', '2026-05-10', 790, 21, 0, 955.90, 'Transferencia', 'Servicio mensual Growth Local.'),
  ('12121212-1212-4121-8121-121212121212', '22222222-2222-4222-8222-222222222222', 'FW-2026-0052', 'paid', '2026-05-01', '2026-05-07', 1170, 21, 0, 1415.70, 'Domiciliacion', 'Gestion mensual y extra de creatividades.'),
  ('12121212-1212-4121-8121-121212121213', '33333333-3333-4333-8333-333333333333', 'FW-2026-0053', 'overdue', '2026-05-01', '2026-05-08', 1710, 21, 0, 2069.10, 'Transferencia', 'Gestion mensual Premium Ads + Contenido.')
on conflict (invoice_number) do update
set status = excluded.status,
    total = excluded.total;

insert into public.invoice_items (id, invoice_id, description, quantity, unit_price, total)
values
  ('13131313-1313-4131-8131-131313131311', '12121212-1212-4121-8121-121212121211', 'Gestion mensual Growth Local', 1, 790, 790),
  ('13131313-1313-4131-8131-131313131312', '12121212-1212-4121-8121-121212121212', 'Performance Local', 1, 990, 990),
  ('13131313-1313-4131-8131-131313131313', '12121212-1212-4121-8121-121212121212', 'Pack extra creatividades', 1, 180, 180),
  ('13131313-1313-4131-8131-131313131314', '12121212-1212-4121-8121-121212121213', 'Premium Ads + Contenido', 1, 1290, 1290),
  ('13131313-1313-4131-8131-131313131315', '12121212-1212-4121-8121-121212121213', 'Produccion extra de contenido', 1, 420, 420)
on conflict (id) do update
set description = excluded.description,
    total = excluded.total;

insert into public.leaderboards (id, category, month, year, visibility)
values
  ('14141414-1414-4141-8141-141414141411', 'Mejor crecimiento mensual', 4, 2026, 'client'),
  ('14141414-1414-4141-8141-141414141412', 'Mejor coste por lead', 4, 2026, 'client'),
  ('14141414-1414-4141-8141-141414141413', 'Mejor ROI estimado', 4, 2026, 'client')
on conflict (category, month, year) do update
set visibility = excluded.visibility;

insert into public.leaderboard_entries (id, leaderboard_id, client_id, rank, display_name, metric_label, trend)
values
  ('15151515-1515-4151-8151-151515151511', '14141414-1414-4141-8141-141414141411', '11111111-1111-4111-8111-111111111111', 1, 'Casa Lumbre', '+25,2% alcance', 25.2),
  ('15151515-1515-4151-8151-151515151512', '14141414-1414-4141-8141-141414141411', '33333333-3333-4333-8333-333333333333', 2, 'Clinica estetica', '+18,4% alcance', 18.4),
  ('15151515-1515-4151-8151-151515151513', '14141414-1414-4141-8141-141414141411', '22222222-2222-4222-8222-222222222222', 3, 'Cliente local #02', '+11,8% leads', 11.8),
  ('15151515-1515-4151-8151-151515151514', '14141414-1414-4141-8141-141414141412', '11111111-1111-4111-8111-111111111111', 1, 'Casa Lumbre', '5,19 EUR CPL', -13.1),
  ('15151515-1515-4151-8151-151515151515', '14141414-1414-4141-8141-141414141413', '33333333-3333-4333-8333-333333333333', 1, 'Clinica estetica', '4,53x estimado', 9.3)
on conflict (leaderboard_id, client_id) do update
set rank = excluded.rank,
    display_name = excluded.display_name,
    metric_label = excluded.metric_label,
    trend = excluded.trend;

insert into public.client_scores (
  id,
  client_id,
  score,
  level,
  level_name,
  punctual_payment,
  approvals_speed,
  collaboration,
  profitability,
  growth,
  churn_risk,
  communication,
  satisfaction,
  recommended_action
)
values
  ('16161616-1616-4161-8161-161616161611', '11111111-1111-4111-8111-111111111111', 84, 4, 'Partner', 5, 4, 4, 4, 5, 2, 4, 5, 'Candidato a caso de exito y testimonio local.'),
  ('16161616-1616-4161-8161-161616161612', '22222222-2222-4222-8222-222222222222', 76, 4, 'Partner', 5, 3, 4, 4, 4, 2, 3, 4, 'Proponer mejora de WhatsApp y mayor inversion.'),
  ('16161616-1616-4161-8161-161616161613', '33333333-3333-4333-8333-333333333333', 68, 3, 'Pro', 3, 4, 4, 5, 4, 3, 4, 4, 'Confirmar ventas reales y resolver factura vencida.')
on conflict (client_id) do update
set score = excluded.score,
    level = excluded.level,
    level_name = excluded.level_name,
    recommended_action = excluded.recommended_action;

insert into public.alerts (id, client_id, title, severity, visibility)
values
  ('17171717-1717-4171-8171-171717171711', '11111111-1111-4111-8111-111111111111', 'Alto potencial de upsell por rendimiento de reservas', 'success', 'internal'),
  ('17171717-1717-4171-8171-171717171712', '33333333-3333-4333-8333-333333333333', 'Factura vencida pendiente de seguimiento', 'warning', 'internal'),
  ('17171717-1717-4171-8171-171717171713', '11111111-1111-4111-8111-111111111111', 'Informe de abril listo para descargar', 'info', 'client')
on conflict (id) do update
set title = excluded.title,
    severity = excluded.severity,
    visibility = excluded.visibility;

insert into public.tasks (id, client_id, title, due_date, status, visible_to_client)
values
  ('18181818-1818-4181-8181-181818181811', '11111111-1111-4111-8111-111111111111', 'Enviar fotos del nuevo menu de temporada', '2026-05-08', 'in_progress', true),
  ('18181818-1818-4181-8181-181818181812', '11111111-1111-4111-8111-111111111111', 'Publicar landing de comuniones', '2026-05-12', 'open', true),
  ('18181818-1818-4181-8181-181818181813', '33333333-3333-4333-8333-333333333333', 'Pedir datos de ventas reales de abril', '2026-05-07', 'open', false)
on conflict (id) do update
set title = excluded.title,
    due_date = excluded.due_date,
    status = excluded.status,
    visible_to_client = excluded.visible_to_client;
