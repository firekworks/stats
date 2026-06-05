# Firekworks Stats

Portal SaaS privado para clientes de Firekworks. Esta app vive separada de `leads-app/` para no mezclar prospeccion con datos visibles de clientes.

## Stack

- Next.js App Router + React
- Tailwind CSS
- Supabase Auth, Postgres, Storage y Edge Functions
- Recharts para graficas
- pdf-lib para informes/facturas PDF

## Arranque local

```bash
cd stats-app
npm install
cp .env.example .env.local
npm run dev
```

Sin variables Supabase, la app entra en modo demo con tres clientes ficticios.

Rutas principales:

- `/login`
- `/client`
- `/admin`

## Supabase

1. Crea un proyecto Supabase.
2. Copia `.env.example` a `.env.local`.
3. Define `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Define `SUPABASE_SERVICE_ROLE_KEY` solo en entornos servidor.
5. Aplica `supabase/migrations/202606050001_create_stats_portal.sql`.
6. Carga `supabase/seed.sql`.
7. Crea usuarios en Auth y filas en `profiles` + `client_users`.

La migracion activa RLS en todas las tablas, usa `private.is_admin()` y `private.current_client_ids()`, separa notas internas en tablas privadas y revoca acceso cliente a `integration_tokens`.

## Auth

El login usa email y contraseña, no magic link obligatorio. El cliente browser usa sesion persistente y la UI incluye “Recordar este dispositivo”. En produccion, configura la duracion de sesion/refresh tokens en Supabase Auth para la ventana deseada de 30-90 dias en dispositivos confiables.

Recomendado antes de produccion:

- Politica de contraseña fuerte en Supabase Auth.
- Google login opcional.
- Passkeys cuando se decida adoptarlas.
- MFA para admins si el portal gestiona datos fiscales sensibles.

## PDFs

- Informe mensual: `/api/reports/monthly?clientId=<uuid>`
- Factura: `/api/invoices/<invoiceId>/pdf`

Si existe `SUPABASE_SERVICE_ROLE_KEY`, las rutas suben los PDFs a Supabase Storage (`reports` e `invoices`). Si no existe, devuelven el PDF directamente.

## Integraciones

Las llamadas futuras a Meta Ads, Instagram Graph API, Facebook Pages, WhatsApp Cloud API y Google Business Profile deben ir en Edge Functions o backend servidor. Los tokens externos deben guardarse cifrados o en Supabase Vault, nunca en el frontend.

## Facturacion

El modulo actual es una estructura operativa simple. No implementa aun VERI*FACTU ni emision fiscal definitiva. Antes de usarlo como sistema fiscal real en España, valida numeracion, firma, impuestos y obligaciones con asesoria.
