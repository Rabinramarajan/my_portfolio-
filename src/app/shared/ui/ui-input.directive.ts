import { Directive, input } from '@angular/core';

/**
 * Design-system input styling for <input> / <textarea>.
 * Styles live globally in `src/scss/_ui.scss`.
 *
 * Usage: <input uiInput /> · <input uiInput [invalid]="true" />
 */
@Directive({
  selector: '[uiInput]',
  host: {
    class: 'ui-input',
    '[class.ui-input--error]': 'invalid()',
  },
})
export class UiInputDirective {
  readonly invalid = input(false);
}
