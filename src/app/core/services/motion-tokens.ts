/**
 * Single source of truth for JS/GSAP-driven motion.
 *
 * The CSS half of the system lives in `styles/_tokens.scss` (`--ease-out-expo`,
 * `--duration-slow`, …). This module mirrors those exact values so the two
 * halves can never drift apart: where a stylesheet reads `--ease-out-expo`, GSAP
 * code reads `EASE.expo`; where it reads `--duration-slow`, it reads
 * `DURATION.slow`. That shared vocabulary is what makes the hero entrance, the
 * scroll reveals and the route transition read as one system rather than three.
 *
 * `EASE_CSS` carries the literal cubic-beziers for the Web Animations API
 * (reveals), `EASE` the GSAP-equivalent named eases (hero, text reveal). Both
 * are derived from the same design intent and kept in lock-step here.
 */
export const EASE_CSS = {
  /** Matches `--ease-out-expo`. The workhorse: rises, fades, scrubs. */
  expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Matches `--ease-spring`. CTAs and accents that overshoot gently. */
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Matches `--ease-in-out-quart`. Balanced in/out motion. */
  quart: 'cubic-bezier(0.76, 0, 0.24, 1)',
} as const;

/** GSAP-equivalent named eases for the curves above. */
export const EASE = {
  expo: 'expo.out',
  spring: 'back.out(1.7)',
  quart: 'power4.inOut',
} as const;

/** Seconds, mirroring the `--duration-*` tokens. */
export const DURATION = {
  fast: 0.18,
  base: 0.32,
  slow: 0.62,
  cinematic: 1.1,
} as const;
