import { Injectable, signal } from '@angular/core';

export type CursorMode = 'default' | 'hover' | 'link' | 'image' | 'project' | 'drag' | 'text';

export interface CursorIntent {
  readonly mode: CursorMode;
  /** Short label rendered inside the cursor, e.g. "VIEW PROJECT". */
  readonly label?: string;
}

const DEFAULT: CursorIntent = { mode: 'default' };

/**
 * Shared state between the `appCursor` directive (which declares intent on
 * hover) and the single `<app-cursor>` renderer. Keeping this in a service
 * avoids threading state through the component tree for a purely visual concern.
 */
@Injectable({ providedIn: 'root' })
export class CursorState {
  readonly intent = signal<CursorIntent>(DEFAULT);
  readonly pressed = signal(false);
  readonly visible = signal(false);

  set(intent: CursorIntent): void {
    this.intent.set(intent);
  }

  reset(): void {
    this.intent.set(DEFAULT);
  }
}
