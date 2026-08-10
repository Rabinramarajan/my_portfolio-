import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  afterNextRender,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Cursor } from './shared/components/cursor/cursor';
import { DeviceCapability } from './core/services/device-capability';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';
import { ScrollProgress } from './shared/components/scroll-progress/scroll-progress';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Cursor, ScrollProgress],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly device = inject(DeviceCapability);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  constructor() {
    // One place establishes device capability for the whole app; every motion
    // decision downstream reads the signals it publishes.
    this.destroyRef.onDestroy(this.device.initialize());

    // Marks the point where the client has finished taking over the server
    // render — before this, input typed into a form writes to the DOM without
    // reaching the reactive model. E2E tests gate interaction on it.
    afterNextRender(() => this.document.documentElement.setAttribute('data-hydrated', 'true'));
  }

  /**
   * The skip link keeps its `href="#main"` so it still works without JS, but
   * the click is handled here: with `<base href="/">` a bare fragment resolves
   * against the base URL, so letting the browser follow it would navigate a
   * keyboard user off whatever page they were on and back to the home page.
   */
  protected skipToMain(event: Event): void {
    const main = this.document.getElementById('main');
    if (!main) return;
    event.preventDefault();
    main.focus();
    main.scrollIntoView({ block: 'start' });
  }
}
