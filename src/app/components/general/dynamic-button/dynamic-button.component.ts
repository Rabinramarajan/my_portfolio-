import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { AnalyticsService } from '../../../services/analytics/analytics';

@Component({
    selector: 'app-dynamic-button',
    templateUrl: './dynamic-button.component.html',
    styleUrls: ['./dynamic-button.component.scss'],
})
export class DynamicButtonComponent {
  @Input() text: string = '';
  @Input() href: string = '';
  @Input() target: string = '_blank';
  @Input() analyticsEvent: string = '';
  @Input() analyticsCategory: string = '';
  @Input() analyticsLabel: string = '';
  @Input() disabled: boolean = false;
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Input() size: 'default' | 'small' = 'default';

  private readonly analytics = inject(AnalyticsService);

  @Output() buttonClick = new EventEmitter<Event>();

  constructor() {}

  onButtonClick(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    // Enviar evento de analytics si está configurado
    if (this.analyticsEvent && this.analyticsCategory && this.analyticsLabel) {
      this.analytics.sendAnalyticEvent(
        this.analyticsEvent,
        this.analyticsCategory,
        this.analyticsLabel
      );
    }

    // Emitir evento personalizado
    this.buttonClick.emit(event);
  }
}
