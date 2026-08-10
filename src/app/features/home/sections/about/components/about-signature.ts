import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { DeviceCapability } from '../../../../../core/services/device-capability';

@Component({
  selector: 'app-about-signature',
  standalone: true,
  template: `
    <div class="about-signature" [style.--mx.px]="mouseX()" [style.--my.px]="mouseY()">
      <svg class="about-signature__svg" viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sigGrid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--color-accent, #c9f24d)" stop-opacity="0.12" />
            <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.06" />
            <stop offset="100%" stop-color="var(--color-accent, #c9f24d)" stop-opacity="0.02" />
          </linearGradient>
        </defs>

        <!-- Subtle Geometric Engineering Grid Lines -->
        <path d="M 100 0 V 600 M 350 0 V 600 M 600 0 V 600 M 850 0 V 600 M 1100 0 V 600" stroke="url(#sigGrid)" stroke-width="1" stroke-dasharray="4 8" />
        <path d="M 0 100 H 1200 M 0 280 H 1200 M 0 460 H 1200" stroke="url(#sigGrid)" stroke-width="1" stroke-dasharray="4 8" />

        <!-- Intersecting Connection Nodes -->
        <g class="about-signature__nodes">
          <circle cx="350" cy="100" r="3" fill="var(--color-accent, #c9f24d)" opacity="0.4" />
          <circle cx="850" cy="280" r="3" fill="var(--color-accent, #c9f24d)" opacity="0.4" />
          <circle cx="600" cy="460" r="3" fill="var(--color-accent, #c9f24d)" opacity="0.4" />
        </g>
      </svg>
    </div>
  `,
  styles: [`
    .about-signature {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      z-index: 0;
      opacity: 0.7;
      transition: opacity 0.5s ease;
    }
    .about-signature__svg {
      width: 100%;
      height: 100%;
      transform: translate(calc(var(--mx, 0) * 0.015), calc(var(--my, 0) * 0.015));
      transition: transform 0.2s ease-out;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSignature {
  private readonly device = inject(DeviceCapability);
  protected readonly mouseX = signal(0);
  protected readonly mouseY = signal(0);

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (!this.device.animationsEnabled()) return;
    this.mouseX.set(e.clientX - window.innerWidth / 2);
    this.mouseY.set(e.clientY - window.innerHeight / 2);
  }
}
