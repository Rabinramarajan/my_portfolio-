/**
 * Shadow design tokens — mirrors the `--shadow-*` custom properties in
 * `src/scss/_variables.scss` (tuned for the dark theme).
 */
export const ShadowTokens = {
  none: 'none',
  sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
  md: '0 4px 16px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.5)',
  xl: '0 16px 64px rgba(0, 0, 0, 0.6)',
  glow: '0 0 20px rgba(99, 102, 241, 0.3)',
  glowLg: '0 0 40px rgba(99, 102, 241, 0.4), 0 0 80px rgba(99, 102, 241, 0.2)',
} as const;
