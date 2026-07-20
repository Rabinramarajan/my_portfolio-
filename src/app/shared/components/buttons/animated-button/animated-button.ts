import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconName } from '../../../../core';
import { Icon } from '../../ui/icon/icon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type IconPosition = 'left' | 'right';

const ICON_SIZE: Readonly<Record<ButtonSize, number>> = { sm: 16, md: 18, lg: 20 };

/**
 * The one button used everywhere. Polymorphic: renders `<a routerLink>`,
 * `<a href>` or `<button>` based on inputs. Configurable via signal inputs;
 * emits `pressed` for click handling.
 */
@Component({
  selector: 'app-animated-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink, Icon],
  templateUrl: './animated-button.html',
  styleUrl: './animated-button.scss',
  host: { class: 'inline-flex' },
})
export class AnimatedButton {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly label = input<string>('');
  readonly icon = input<IconName | null>(null);
  readonly iconPosition = input<IconPosition>('right');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly block = input(false);
  readonly type = input<'button' | 'submit'>('button');

  /** Internal route (renders `<a routerLink>`). */
  readonly routerLink = input<string | null>(null);
  /** External URL (renders `<a href target=_blank>`). */
  readonly href = input<string | null>(null);
  /** Accessible label when the button is icon-only. */
  readonly ariaLabel = input<string | null>(null);

  readonly pressed = output<void>();

  protected readonly classes = computed(
    () => `btn btn--${this.variant()} btn--${this.size()}${this.block() ? ' btn--block' : ''}`,
  );

  protected readonly iconSize = computed(() => ICON_SIZE[this.size()]);
  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected emit(): void {
    if (!this.isDisabled()) {
      this.pressed.emit();
    }
  }
}
