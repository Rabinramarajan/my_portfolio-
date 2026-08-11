/**
 * Output-side hardening for the notification email.
 *
 * The payload is already schema-validated; these functions defend the *email*
 * specifically — HTML injection into the body, and header injection via any
 * value that ends up in a Reply-To or Subject line.
 */
const HTML_ESCAPES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};
export function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}
/** Strips CR/LF so a value can never inject an extra SMTP header. */
export function stripNewlines(value) {
    return value.replace(/[\r\n]+/g, ' ').trim();
}
/** Collapses control characters and clamps length before anything is logged. */
export function forLog(value, max = 120) {
    // eslint-disable-next-line no-control-regex
    const cleaned = value.replace(/[\x00-\x1f\x7f]/g, ' ').trim();
    return cleaned.length > max ? `${cleaned.slice(0, max)}…` : cleaned;
}
//# sourceMappingURL=sanitize.js.map