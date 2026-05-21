import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/templates/header/header';
import { Footer } from './shared/templates/footer/footer';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    Footer
  ],
  templateUrl: './app.html'
})
export class App {
  protected readonly title = signal('portfolio');
}
