update public.billing_settings
set
  logo_url = '/brand/firekworks-icon.png',
  updated_at = now()
where logo_url is null
  or logo_url = ''
  or logo_url = '/brand/firekworks-mark.svg';

update public.app_texts
set
  value = 'Accede a tus métricas, informes y facturas desde un único panel.',
  updated_at = now()
where app = 'stats'
  and key = 'stats.login.subtitle'
  and value = 'Accede con tu usuario de cliente.';
