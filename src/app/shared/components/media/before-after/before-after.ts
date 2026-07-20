import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

/**
 * Before/after image comparison slider — drag (or arrow-key) the handle to wipe
 * between two overlaid images at the same size.
 *
 * The wipe is driven by a native `<input type="range">`, so it is keyboard
 * accessible and screen-reader announceable for free, and it renders identically
 * on the server (the range sits at its initial value during prerendering; no
 * pointer or effect code runs until hydration). The clip is a pure CSS
 * `clip-path` fed by one signal, so there is no per-frame layout thrash.
 */
@Component({
  selector: 'app-before-after',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  template: `
    <figure class="ba" [style.aspect-ratio]="aspectRatio()">
      <img class="ba__img" [src]="afterSrc()" [alt]="afterAlt()" loading="lazy" decoding="async" />
      <img
        class="ba__img ba__img--clip"
        [src]="beforeSrc()"
        [alt]="beforeAlt()"
        [style.clip-path]="clip()"
        loading="lazy"
        decoding="async"
      />

      <span class="ba__label ba__label--before" [style.opacity]="beforeLabelOpacity()">
        {{ beforeLabel() }}
      </span>
      <span class="ba__label ba__label--after" [style.opacity]="afterLabelOpacity()">
        {{ afterLabel() }}
      </span>

      <span class="ba__divider" aria-hidden="true" [style.left.%]="position()">
        <span class="ba__knob">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M9 7 4 12l5 5V7zm6 0v10l5-5-5-5z" />
          </svg>
        </span>
      </span>

      <input
        class="ba__range"
        type="range"
        min="0"
        max="100"
        step="0.1"
        [value]="position()"
        (input)="onInput($event)"
        [attr.aria-label]="ariaLabel()"
        aria-valuetext="{{ position() | number: '1.0-0' }}% revealing the before image"
      />
    </figure>
  `,
  styles: `
    :host {
      display: block;
    }
    .ba {
      position: relative;
      margin: 0;
      width: 100%;
      overflow: hidden;
      border-radius: var(--radius-card, 1rem);
      border: 1px solid var(--color-border-subtle);
      background: var(--color-bg-elevated);
      user-select: none;
      touch-action: pan-y;
    }
    .ba__img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      pointer-events: none;
    }
    .ba__label {
      position: absolute;
      top: 0.75rem;
      padding: 0.2rem 0.6rem;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #fff;
      background: rgb(0 0 0 / 65%);
      border-radius: var(--radius-pill, 999px);
      transition: opacity 0.2s ease;
      pointer-events: none;
    }
    .ba__label--before {
      left: 0.75rem;
    }
    .ba__label--after {
      right: 0.75rem;
    }
    .ba__divider {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background: rgb(255 255 255 / 90%);
      transform: translateX(-50%);
      pointer-events: none;
      box-shadow: 0 0 0 1px rgb(0 0 0 / 15%);
    }
    .ba__knob {
      position: absolute;
      top: 50%;
      left: 50%;
      display: grid;
      place-items: center;
      width: 2.25rem;
      height: 2.25rem;
      color: var(--color-brand-purple);
      background: #fff;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 4px 16px rgb(0 0 0 / 30%);
    }
    .ba__range {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      cursor: ew-resize;
      opacity: 0;
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
    }
    .ba__range::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 2.5rem;
      height: 100%;
    }
    .ba__range::-moz-range-thumb {
      width: 2.5rem;
      height: 100%;
      border: 0;
      background: transparent;
    }
    .ba__range:focus-visible {
      outline: none;
    }
    .ba:has(.ba__range:focus-visible) .ba__knob {
      outline: 2px solid var(--color-brand-cyan);
      outline-offset: 3px;
    }
    @media (prefers-reduced-motion: reduce) {
      .ba__label {
        transition: none;
      }
    }
  `,
})
export class BeforeAfter {
  /** The "after"/redesigned image — fills the frame; revealed on the right. */
  readonly afterSrc = input.required<string>();
  readonly afterAlt = input('After');
  readonly afterLabel = input('After');

  /** The "before"/original image — clipped, revealed on the left. */
  readonly beforeSrc = input.required<string>();
  readonly beforeAlt = input('Before');
  readonly beforeLabel = input('Before');

  /** Starting handle position, 0–100 (% from the left). */
  readonly start = input(50);

  /** CSS `aspect-ratio` for the frame. Defaults to 16:9. */
  readonly aspectRatio = input('16 / 9');

  readonly ariaLabel = input('Comparison slider: drag to compare before and after');

  private readonly override = signal<number | null>(null);

  protected readonly position = computed(() => {
    const o = this.override();
    return o ?? Math.min(100, Math.max(0, this.start()));
  });

  protected readonly clip = computed(() => `inset(0 ${100 - this.position()}% 0 0)`);

  protected readonly beforeLabelOpacity = computed(() => (this.position() > 12 ? 1 : 0));
  protected readonly afterLabelOpacity = computed(() => (this.position() < 88 ? 1 : 0));

  protected onInput(event: Event): void {
    this.override.set(Number((event.target as HTMLInputElement).value));
  }
}
