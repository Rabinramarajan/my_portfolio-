/**
 * Typography design tokens. The site's base font family is Inter
 * (see `src/styles.scss`).
 */
export const TypographyTokens = {
  fontFamily: "'Inter', 'Roboto', sans-serif",
  h1: {
    fontSize: '40px',
    fontWeight: 700,
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '32px',
    fontWeight: 700,
    lineHeight: '1.25',
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: '1.33',
    letterSpacing: '0',
  },
  body: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '1.5',
    letterSpacing: '0',
  },
  small: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '1.43',
    letterSpacing: '0',
  },
} as const;
