export const environment = {
  production: false,
  dataBasePath: 'assets/data',
  /** EmailJS (https://dashboard.emailjs.com) — fill with your own values. */
  emailjs: {
    serviceId: 'service_fs34sui',
    templateId: 'template_r81m171',
    publicKey: '_dTIkiVF1c20MHREu',
  },
  /** Supabase (https://supabase.com) — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local */
  supabase: {
    url: 'https://gsrplaqsfynfhnxvqtnk.supabase.co',
    key: 'sb_publishable_HByWy8CGbcNGsztYB9VZXw_-MLpcSwt',
  },
} as const;

export type Environment = typeof environment;
