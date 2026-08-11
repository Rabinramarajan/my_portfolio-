import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Decorative engineering environment behind the hero.
 *
 * This is the static, SSR-safe layer: hairline construction lines, sparse
 * coordinate readouts and a thin node network — "digital architecture", not
 * cyberpunk. It sits under the WebGL particle field, which is the progressive
 * enhancement on top, and every particle of it is pure CSS so it costs nothing
 * to render. Purely decorative: hidden from assistive technology.
 */
@Component({
  selector: 'app-hero-background',
  standalone: true,
  template: `
    <div class="hb" aria-hidden="true">
      <div class="hb__rule hb__rule--h1"></div>
      <div class="hb__rule hb__rule--h2"></div>
      <div class="hb__rule hb__rule--v"></div>

      <span class="hb__crosshair hb__crosshair--tl"></span>
      <span class="hb__crosshair hb__crosshair--br"></span>

      <svg class="hb__nodes" viewBox="0 0 1200 520" fill="none" preserveAspectRatio="xMidYMid slice">
        <path d="M168 402 L332 210 L491 328 L672 96 L861 204 L1032 62" stroke="var(--color-line-strong)" stroke-width="1" stroke-dasharray="3 7" />
        <circle cx="168" cy="402" r="2.5" fill="var(--color-accent)" opacity="0.55" />
        <circle cx="332" cy="210" r="2" fill="var(--color-text-faint)" opacity="0.7" />
        <circle cx="491" cy="328" r="2.5" fill="var(--color-accent)" opacity="0.4" />
        <circle cx="672" cy="96" r="2" fill="var(--color-text-faint)" opacity="0.7" />
        <circle cx="861" cy="204" r="3" fill="var(--color-accent)" opacity="0.7" />
        <circle cx="1032" cy="62" r="2" fill="var(--color-text-faint)" opacity="0.6" />
      </svg>

      <span class="hb__data hb__data--1">13.0827° N · 80.2707° E</span>
      <span class="hb__data hb__data--2">ANGULAR 22 · ZONELESS</span>
      <span class="hb__data hb__data--3">COMPONENT: HERO / 0.1.0</span>
      <span class="hb__data hb__data--4">BUILD · SSR · SIGNALS</span>

      <div class="hb__shade"></div>
    </div>
  `,
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
        z-index: 0;
        overflow: hidden;
        pointer-events: none;
      }

      .hb {
        position: absolute;
        inset: 0;
        opacity: 1;
        will-change: opacity;
      }

      .hb__rule {
        position: absolute;
        background: linear-gradient(90deg, transparent, var(--color-line) 18%, var(--color-line) 82%, transparent);
        height: 1px;
      }

      .hb__rule--h1 {
        top: 30%;
        left: 0;
        right: 0;
      }

      .hb__rule--h2 {
        top: 64%;
        left: 0;
        right: 0;
        opacity: 0.5;
      }

      .hb__rule--v {
        top: 12%;
        bottom: 0;
        right: 12%;
        width: 1px;
        background: linear-gradient(180deg, transparent, var(--color-line) 30%, var(--color-line) 60%, transparent);
        opacity: 0.6;
      }

      .hb__crosshair {
        position: absolute;
        width: 18px;
        height: 18px;

        &::before,
        &::after {
          content: '';
          position: absolute;
          background: var(--color-accent);
          opacity: 0.5;
        }

        &::before {
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
        }

        &::after {
          top: 0;
          bottom: 0;
          left: 50%;
          width: 1px;
        }
      }

      .hb__crosshair--tl {
        top: 22%;
        left: 4%;
      }

      .hb__crosshair--br {
        bottom: 18%;
        right: 5%;
      }

      .hb__nodes {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0.7;
      }

      .hb__data {
        position: absolute;
        font-family: var(--font-mono);
        font-size: 0.6rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--color-text-faint);
        white-space: nowrap;
      }

      .hb__data--1 {
        bottom: 20%;
        left: 7%;
      }

      .hb__data--2 {
        top: 16%;
        left: 55%;
      }

      .hb__data--3 {
        bottom: 8%;
        right: 6%;
      }

      .hb__data--4 {
        top: 38%;
        right: 20%;
        opacity: 0.65;
      }

      /* Settles the environment into the page: a band of base colour at the
         bottom so the grid does not bleed into the About transition. */
      .hb__shade {
        position: absolute;
        inset: auto 0 0 0;
        height: 18%;
        background: linear-gradient(to bottom, transparent, var(--color-bg));
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBackground {}