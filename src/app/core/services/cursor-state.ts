import { Injectable, signal } from '@angular/core';

export type CursorMode = 'default' | 'hover' | 'link' | 'view' | 'explore' | 'image' | 'project';

export interface CursorIntent {
  readonly mode: CursorMode;
  readonly label?: string;
}

const DEFAULT: CursorIntent = { mode: 'default' };

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
