import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CursorTarget } from '../../directives/cursor-target';
import { Magnetic } from '../../directives/magnetic';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'lg';

/**
 * The single call-to-action primitive.
 *
 * Renders as `<a routerLink>`, `<a href>` or `<button>` depending on what it is
 * given — a link that navigates is always an anchor, so keyboard and
 * middle-click behaviour come from the platform rather than being re-created.
 */
@Component({
  selector: 'app-button',
  imports: [NgTemplateOutlet, RouterLink, Magnetic, CursorTarget],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  /** Internal route. Takes precedence over `href`. */
  readonly routerLink = input<string | readonly unknown[]>();
  readonly href = input<string>();
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  /** Trailing arrow that slides on hover. */
  readonly arrow = input(true);
  readonly ariaLabel = input<string>();

  protected readonly isExternal = computed(() => this.href()?.startsWith('http') ?? false);
  protected readonly hostClass = computed(() => `btn-host btn-host--${this.size()}`);
  protected readonly classes = computed(
    () => `btn btn--${this.variant()} btn--${this.size()}` + (this.loading() ? ' is-loading' : ''),
  );
}
