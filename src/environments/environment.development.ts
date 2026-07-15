export const environment = {
  production: false,
  dataBasePath: 'assets/data',
  /** EmailJS (https://dashboard.emailjs.com) — fill with your own values. */
  emailjs: {
    serviceId: 'service_fs34sui',
    templateId: 'template_r81m171',
    publicKey: '_dTIkiVF1c20MHREu',
  },
} as const;

export type Environment = typeof environment;
