import { Directive, input } from '@angular/core';

type ButtonVariant = 'primary' | 'outline' | 'ghost';

/**
 * Applies the design-system button styling to any <button> or <a>.
 * Styles live globally in `src/scss/_ui.scss` (a directive can't ship styles).
 *
 * Usage:
 *   <button uiButton>Primary</button>
 *   <a uiButton="outline" href="...">Outline</a>
 *   <button uiButton="ghost" size="sm">Ghost</button>
 */
@Directive({
  selector: '[uiButton]',
  host: {
    class: 'ui-btn',
    '[class.ui-btn--primary]': "variant() === 'primary'",
    '[class.ui-btn--outline]': "variant() === 'outline'",
    '[class.ui-btn--ghost]': "variant() === 'ghost'",
    '[class.ui-btn--sm]': "size() === 'sm'",
    '[class.ui-btn--lg]': "size() === 'lg'",
  },
})
export class UiButtonDirective {
  /** Visual variant. Empty attribute (`uiButton`) defaults to primary. */
  readonly variant = input<ButtonVariant, '' | ButtonVariant>('primary', {
    alias: 'uiButton',
    transform: (v) => (v === '' ? 'primary' : v),
  });
  readonly size = input<'sm' | 'md' | 'lg'>('md');
}
