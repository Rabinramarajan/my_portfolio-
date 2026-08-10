import { describe, expect, it } from 'vitest';

import { contactSchema, toFieldErrors } from './contact.schema.js';
import { escapeHtml, stripNewlines } from './sanitize.js';

const valid = {
  name: 'Dana Okoye',
  email: 'dana@example.com',
  projectType: 'SaaS',
  budget: '₹50,000 – ₹1,00,000',
  message: 'We are building a SaaS dashboard and need a senior Angular engineer for the frontend.',
} as const;

describe('contact schema', () => {
  it('accepts a well-formed enquiry', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts an optional service, url and add-ons', () => {
    const result = contactSchema.safeParse({
      ...valid,
      service: 'Angular Development',
      url: 'https://example.com',
      addOns: ['Additional Page', 'Advanced SEO'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.addOns).toEqual(['Additional Page', 'Advanced SEO']);
      expect(result.data.service).toBe('Angular Development');
      expect(result.data.url).toBe('https://example.com');
    }
  });

  it('rejects an invalid email', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) expect(toFieldErrors(result.error)).toHaveProperty('email');
  });

  it('rejects a message too short to act on', () => {
    const result = contactSchema.safeParse({ ...valid, message: 'hi' });
    expect(result.success).toBe(false);
  });

  it('rejects an oversized message rather than relaying it', () => {
    const result = contactSchema.safeParse({ ...valid, message: 'x'.repeat(3001) });
    expect(result.success).toBe(false);
  });

  it('rejects a project type outside the published list', () => {
    const result = contactSchema.safeParse({ ...valid, projectType: 'Crypto scheme' });
    expect(result.success).toBe(false);
  });

  it('rejects an oversized add-on list', () => {
    const result = contactSchema.safeParse({
      ...valid,
      addOns: Array.from({ length: 13 }, (_, i) => `Add-on ${i}`),
    });
    expect(result.success).toBe(false);
  });

  it('rejects a filled honeypot', () => {
    const result = contactSchema.safeParse({ ...valid, website: 'http://spam.example' });
    expect(result.success).toBe(false);
  });

  it('trims surrounding whitespace from free text', () => {
    const result = contactSchema.safeParse({ ...valid, name: '  Dana Okoye  ' });
    expect(result.success && result.data.name).toBe('Dana Okoye');
  });
});

describe('sanitisers', () => {
  it('escapes HTML so a message cannot inject markup into the email', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('strips newlines so a name cannot inject an SMTP header', () => {
    expect(stripNewlines('Dana\r\nBcc: victim@example.com')).toBe('Dana Bcc: victim@example.com');
  });
});
