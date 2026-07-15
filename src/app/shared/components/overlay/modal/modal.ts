import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  model,
  viewChild,
} from '@angular/core';
import { MOTION, gsap, prefersReducedMotion } from '../../../animations';
import { Icon } from '../../ui/icon/icon';


/** Centered dialog. Visibility two-way bound via `open`; projects body + [slot=footer]. */
@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    @if (open()) {
      <div class="modal">
        <button
          type="button"
          class="modal__backdrop"
          aria-label="Close dialog"
          (click)="close()"
        ></button>
        <div
          #dialog
          class="modal__dialog"
          [class]="'modal__dialog--' + size()"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title()"
          (keydown.escape)="close()"
        >
          <div class="modal__header">
            <h2 class="modal__title">{{ title() }}</h2>
            <button type="button" class="modal__close" aria-label="Close" (click)="close()">
              <app-icon name="X" [size]="18" aria-hidden="true" />
            </button>
          </div>
          <div class="modal__body">
            <ng-content />
          </div>
          <div class="modal__footer"><ng-content select="[slot=footer]" /></div>
        </div>
      </div>
    }
  `,
  styles: `
    .modal {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal__backdrop {
      position: absolute;
      inset: 0;
      background: rgb(0 0 0 / 60%);
      backdrop-filter: blur(4px);
      border: 0;
      cursor: pointer;
    }
    .modal__dialog {
      position: relative;
      width: 100%;
      max-height: 90vh;
      overflow: hidden;
      border-radius: 1.5rem;
      border: 1px solid var(--color-border-subtle);
      background: var(--color-bg-elevated);
      padding: 1.25rem;
      box-shadow: 0 25px 50px -12px rgb(0 0 0 / 50%);
    }
    .modal__dialog--sm {
      max-width: 28rem;
    }
    .modal__dialog--md {
      max-width: 50rem;
    }
    .modal__dialog--lg {
      max-width: 70rem;
    }
    .modal__dialog--xl {
      max-width: 90rem;
    }
    .modal__header {
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .modal__title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--color-fg);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0;
    }
    .modal__close {
      color: var(--color-fg-muted);
      background: none;
      border: 0;
      cursor: pointer;
      transition: color 0.15s;
      display: inline-flex;
    }
    .modal__close:hover {
      color: var(--color-fg);
    }
    .modal__body {
      max-height: calc(90vh - 6rem);
      overflow-y: auto;
      padding-right: 0.5rem;
      font-size: 0.875rem;
      color: var(--color-fg-muted);
    }
    .modal__footer {
      margin-top: 1rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 0.75rem;
    }
  `,
})
export class Modal {
  readonly open = model(false);
  readonly title = input('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  private readonly dialog = viewChild<ElementRef<HTMLElement>>('dialog');
  /** Guards the enter tween so it plays once per open cycle, not on every CD. */
  private hasAnimatedIn = false;

  constructor() {
    // Pop the dialog in with GSAP when it enters the DOM (replaces @scaleIn).
    effect(() => {
      const el = this.dialog()?.nativeElement;
      if (!el) {
        this.hasAnimatedIn = false;
        return;
      }
      if (this.hasAnimatedIn) return;
      this.hasAnimatedIn = true;
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          duration: MOTION.duration.base,
          ease: MOTION.ease.emphasized,
        },
      );
    });
  }

  /** Animate the dialog out, then unmount it (replaces the @scaleIn `:leave`). */
  protected close(): void {
    const el = this.dialog()?.nativeElement;
    if (!el || prefersReducedMotion()) {
      this.open.set(false);
      return;
    }
    gsap.to(el, {
      opacity: 0,
      scale: 0.96,
      duration: MOTION.duration.fast,
      ease: MOTION.ease.accelerate,
      onComplete: () => this.open.set(false),
    });
  }
}
