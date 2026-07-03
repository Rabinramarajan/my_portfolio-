/**
 * Color design tokens — TypeScript mirror of the CSS custom properties in
 * `src/scss/_variables.scss`. Use these when you need token values inside
 * TypeScript (e.g. Chart.js configs, canvas drawing, component inline styles).
 *
 * SCSS/HTML should keep using the CSS variables directly (e.g. `var(--accent-primary)`) —
 * `_variables.scss` remains the single source of truth for stylesheets.
 */
export const ColorTokens = {
  // --- Backgrounds ---
  background: {
    primary: '#080d18',
    secondary: '#0f172a',
    card: '#111827',
    cardHover: '#1e293b',
    elevated: '#1e293b',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },

  // --- Accents (indigo / violet brand) ---
  accent: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    tertiary: '#a855f7',
    blue: '#3b82f6',
    cyan: '#06b6d4',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
  },

  // --- Text ---
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
    tertiary: '#64748b',
    muted: '#475569',
  },

  // --- Borders ---
  border: {
    color: 'rgba(99, 102, 241, 0.15)',
    hover: 'rgba(99, 102, 241, 0.3)',
    active: 'rgba(99, 102, 241, 0.5)',
  },

  // --- Semantic (aliases onto the accent scale) ---
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#f43f5e',
    info: '#3b82f6',
  },

  // --- Gradients ---
  gradient: {
    primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    accent: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #06b6d4 100%)',
    card: 'linear-gradient(145deg, rgba(17, 24, 39, 0.8) 0%, rgba(30, 41, 59, 0.4) 100%)',
    glow: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
  },
} as const;

// Usage in TypeScript:
//   import { ColorTokens } from '../../styles/tokens';
//   ctx.fillStyle = ColorTokens.accent.primary;
