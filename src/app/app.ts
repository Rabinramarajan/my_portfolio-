import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { CursorComponent } from './shared/components/cursor/cursor.component';
import { FIREBASE_ANALYTICS } from './core/firebase/firebase.di';
import { logEvent } from 'firebase/analytics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CursorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private analytics = inject(FIREBASE_ANALYTICS);

  constructor() {
    if (this.analytics) {
      console.log(this.analytics);

      logEvent(this.analytics, 'app_open');
    }
  }

}
