import { Directive, inject, input } from '@angular/core';

import { CursorState, type CursorMode } from '../../core/services/cursor-state';

/** Declares what the custom cursor should become while this element is hovered. */
@Directive({
  selector: '[appCursorTarget]',
  host: {
    '(pointerenter)': 'enter()',
    '(pointerleave)': 'leave()',
    '(focusin)': 'enter()',
    '(focusout)': 'leave()',
  },
})
export class CursorTarget {
  private readonly cursor = inject(CursorState);

  readonly mode = input<CursorMode>('hover', { alias: 'appCursorTarget' });
  readonly label = input<string>();

  protected enter(): void {
    this.cursor.set({ mode: this.mode(), label: this.label() });
  }

  protected leave(): void {
    this.cursor.reset();
  }
}
