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
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_o_anon_key
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=https://stats.vercel.app
ADMIN_EMAILS=tu-email@firekworks.es
CRON_SECRET=un-secreto-largo
SUPABASE_REPORTS_BUCKET=stats-reports
SUPABASE_INVOICES_BUCKET=stats-invoices
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` puede contener la publishable/anon key pública. Nunca debe contener una `sb_secret_...`.
`SUPABASE_SERVICE_ROLE_KEY` solo debe existir en servidor/Vercel. Nunca debe llevar `NEXT_PUBLIC_`.

## Supabase Leads

Proyecto usado:

- Nombre: `Leads`
- Ref: `xmkhdjjnxlpwqeatiwfx`
- URL: `https://xmkhdjjnxlpwqeatiwfx.supabase.co`

Migracion preparada en este repo y compatible con la base remota actual:

- `supabase/migrations/20260605_stats_auth_and_portal_compat.sql`

Esa migración:

- No recrea `leads`.
- No recrea `profiles`; amplía sus roles para aceptar `client`.
- No recrea `clients`.
- No recrea `audit_logs`.
- Añade campos de portal a `clients`.
- Mantiene `profiles` para roles internos (`admin`, `sales`, `viewer`) y clientes (`client`).
- Usa `client_users` y `client_login_aliases` para vincular clientes externos sin exponer su email técnico.
- Crea tablas nuevas de Stats.
- Activa RLS en tablas nuevas.
- Crea vistas seguras para el portal cliente.
- Permite lectura `anon` solo de textos publicos de `app_texts` para el login.

Antes de aplicarla en Supabase remoto, revisar con el otro trabajo activo de Leads para evitar pisar cambios paralelos.

## Crear Usuario Admin

1. En Supabase Auth, crea un usuario con email y contraseña.
2. En SQL editor, añade su perfil:

```sql
insert into public.profiles (user_id, email, full_name, role)
values ('AUTH_USER_ID', 'email@firekworks.es', 'Firekworks Admin', 'admin');
```

Roles disponibles en `profiles`:

- `admin`: puede administrar.
- `sales`: puede editar datos comerciales.
- `viewer`: puede ver datos internos.
- `client`: puede entrar solo en el portal de cliente asociado.

Los clientes del portal necesitan fila `profiles.role = 'client'` y se autorizan además por `client_users` y alias privado de login.

## Dar Acceso A Un Cliente

1. Convierte el lead en cliente desde Firekworks Leads o crea una fila en `clients`.
2. Entra en Stats como admin.
3. Abre `/admin/client-access`.
4. Selecciona cliente, revisa usuario sugerido y crea contraseña temporal.

El sistema crea el Auth user, `profiles`, `client_users`, `client_login_aliases` y habilita `client_portal_enabled`. El cliente inicia sesión con usuario/contraseña; el email técnico no se muestra en la UI cliente.

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
