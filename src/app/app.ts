import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/templates/header/header';
import { Footer } from './shared/templates/footer/footer';
import { ToastComponent } from './shared/components/toast/toast.component';
import { BackToTopComponent } from './shared/components/back-to-top/back-to-top.component';
import { WhatsAppWidgetComponent } from './shared/components/whatsapp-widget/whatsapp-widget.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    Footer,
    ToastComponent,
    BackToTopComponent,
    WhatsAppWidgetComponent,
  ],
  templateUrl: './app.html'
})
export class App {}
