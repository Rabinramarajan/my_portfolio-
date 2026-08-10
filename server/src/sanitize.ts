/**
 * Output-side hardening for the notification email.
 *
 * The payload is already schema-validated; these functions defend the *email*
 * specifically — HTML injection into the body, and header injection via any
 * value that ends up in a Reply-To or Subject line.
 */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]!);
}

/** Strips CR/LF so a value can never inject an extra SMTP header. */
export function stripNewlines(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

/** Collapses control characters and clamps length before anything is logged. */
export function forLog(value: string, max = 120): string {
  // eslint-disable-next-line no-control-regex
  const cleaned = value.replace(/[\x00-\x1f\x7f]/g, ' ').trim();
  return cleaned.length > max ? `${cleaned.slice(0, max)}…` : cleaned;
}
