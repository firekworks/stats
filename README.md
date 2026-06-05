# Firekworks Stats

Firekworks Stats es el portal privado para clientes de Firekworks. Vive separado de Firekworks Leads, pero usa el mismo Supabase existente llamado `Leads` porque ambos trabajan sobre los mismos comercios.

## Qué Es Cada Cosa

- GitHub guarda el código. El repo correcto de Stats es `https://github.com/firekworks/stats`.
- Vercel publica la web online. El proyecto correcto es `https://vercel.com/firekworks-projects/stats`.
- Supabase guarda usuarios, base de datos, Storage, Edge Functions y RLS. El proyecto correcto es `Leads`.
- Firekworks Leads es el CRM interno de prospección y seguimiento. El cliente nunca lo ve.
- Firekworks Stats es el portal de cliente y dashboard interno de métricas.
- Radar pertenece a Fiestas España. No se usa ni se toca para Firekworks.

## Arquitectura

```text
Firekworks Leads: leads -> clients -> lead_to_client_links
Firekworks Stats: clients -> client_users -> métricas, campañas, contenido, informes, facturas
```

El cliente de Stats no consulta `leads`, `lead_scores`, `lead_notes`, `lead_tasks`, `lead_activities` ni `audit_logs`.

## Variables De Entorno

En Vercel, proyecto `stats`, configura:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xmkhdjjnxlpwqeatiwfx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=https://stats.vercel.app
ADMIN_EMAILS=tu-email@firekworks.es
CRON_SECRET=un-secreto-largo
SUPABASE_REPORTS_BUCKET=stats-reports
SUPABASE_INVOICES_BUCKET=stats-invoices
```

`SUPABASE_SERVICE_ROLE_KEY` solo debe existir en servidor/Vercel. Nunca debe llevar `NEXT_PUBLIC_`.

## Supabase Leads

Proyecto usado:

- Nombre: `Leads`
- Ref: `xmkhdjjnxlpwqeatiwfx`
- URL: `https://xmkhdjjnxlpwqeatiwfx.supabase.co`

Migración preparada:

- `supabase/migrations/202606050001_stats_extension_for_leads.sql`

Esa migración:

- No recrea `leads`.
- No recrea `profiles`.
- No recrea `clients`.
- No recrea `audit_logs`.
- Añade `role='client'` a `profiles`.
- Añade campos de portal a `clients`.
- Crea tablas nuevas de Stats.
- Activa RLS en tablas nuevas.
- Crea vistas seguras para el portal cliente.
- No crea policies para `anon`.

Antes de aplicarla en Supabase remoto, revisar el resumen de riesgos y confirmar.

## Crear Usuario Admin

1. En Supabase Auth, crea un usuario con email y contraseña.
2. En SQL editor, añade su perfil:

```sql
insert into public.profiles (user_id, email, full_name, role)
values ('AUTH_USER_ID', 'email@firekworks.es', 'Firekworks Admin', 'admin');
```

Roles internos disponibles:

- `admin`: puede administrar.
- `sales`: puede editar datos comerciales.
- `viewer`: puede ver datos internos.

El rol `client` es solo para clientes del portal y no cuenta como usuario interno.

## Dar Acceso A Un Cliente

1. Convierte el lead en cliente desde Firekworks Leads o crea una fila en `clients`.
2. Crea usuario en Supabase Auth.
3. Crea perfil:

```sql
insert into public.profiles (user_id, email, full_name, role)
values ('AUTH_USER_ID', 'cliente@email.com', 'Cliente', 'client');
```

4. Relaciona el usuario con su cliente:

```sql
insert into public.client_users (client_id, user_id, role, is_active)
values ('CLIENT_ID', 'AUTH_USER_ID', 'owner', true);
```

El cliente solo podrá ver datos vinculados a su `client_id`.

## Despliegue En Vercel

Proyecto correcto:

- `https://vercel.com/firekworks-projects/stats`

Configuración:

- Framework: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output: automático de Next.js
- Git repo: `firekworks/stats`

Cada push a `main` debería crear un deploy nuevo si Vercel está conectado al repo.

## Operativa

- Métricas: se cargan en `monthly_metrics`.
- Campañas: se cargan en `campaigns` y `campaign_metrics`.
- Contenido: se carga en `content_items` y `content_metrics`.
- Informes: se registran en `monthly_reports` y PDFs en Storage.
- Facturas: se registran en `invoices`, `invoice_items`, `payments` y PDFs en Storage.
- Client Score: se gestiona en `client_scores` y `client_score_events`.
- Integraciones futuras: se preparan en `integrations` e `integration_sync_logs`.

## Seguridad

- No exponer `SUPABASE_SERVICE_ROLE_KEY` en frontend.
- No usar el proyecto Supabase `radar`.
- No desplegar encima de Radar.
- No consultar `leads` desde rutas de cliente.
- No mostrar `internal_notes`, `diagnosis_internal`, `next_month_plan_internal`, `profitability_score`, `churn_risk_score` ni `audit_logs` al cliente.
- La facturación actual es operativa, no fiscal definitiva. Validar con asesoría antes de usarla como emisión fiscal final en España.

## Desarrollo Local Opcional

El objetivo final es Vercel + GitHub + Supabase. El Mac solo es temporal.

```bash
npm install
npm run dev
```

Sin variables de Supabase, la app usa datos demo para poder revisar la interfaz.
