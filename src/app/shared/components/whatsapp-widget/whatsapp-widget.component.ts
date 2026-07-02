import { Component, inject, ChangeDetectionStrategy, computed, afterNextRender, signal } from '@angular/core';
import { PortfolioDataService } from '../../services/portfolio-data.service';

@Component({
  selector: 'app-whatsapp-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isVisible()) {
      <div class="wa-widget">
        @if (showPopup()) {
          <div class="wa-popup">
            <button class="wa-popup-close" (click)="showPopup.set(false)" aria-label="Close">×</button>
            <p class="wa-popup-text">👋 Have a project in mind? Let's chat!</p>
          </div>
        }
        <a class="wa-button" [href]="waLink()" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" (mouseenter)="showPopup.set(true)">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="white" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>
    }
  `,
  styles: [`
    .wa-widget { position: fixed; bottom: 90px; right: 24px; z-index: 400; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .wa-popup { background: rgba(17, 24, 39, 0.95); backdrop-filter: blur(12px); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px; padding: 12px 16px; max-width: 220px; position: relative; animation: popupIn 0.3s ease-out forwards; }
    .wa-popup-close { position: absolute; top: 4px; right: 8px; background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; line-height: 1; }
    .wa-popup-text { font-size: 0.8rem; color: #f8fafc; line-height: 1.4; margin: 0; }
    .wa-button { width: 56px; height: 56px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4); transition: all 0.3s ease; animation: pulse 2s infinite; }
    .wa-button:hover { transform: scale(1.1); box-shadow: 0 6px 30px rgba(37, 211, 102, 0.6); }
    @keyframes popupIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0% { box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4); } 50% { box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4), 0 0 0 10px rgba(37, 211, 102, 0.1); } 100% { box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4); } }
    @media (max-width: 480px) { .wa-widget { bottom: 130px; right: 16px; } .wa-button { width: 48px; height: 48px; } }
  `]
})
export class WhatsAppWidgetComponent {
  private readonly pds = inject(PortfolioDataService);
  protected readonly isVisible = signal(false);
  protected readonly showPopup = signal(false);

  protected readonly waLink = computed(() => {
    const phone = (this.pds.meta()?.phone ?? '').replace(/\D/g, '');
    const text = encodeURIComponent('Hi Rabin! I found your portfolio and would like to discuss a project.');
    return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
  });

  constructor() {
    afterNextRender(() => setTimeout(() => this.isVisible.set(true), 3000));
  }
}
