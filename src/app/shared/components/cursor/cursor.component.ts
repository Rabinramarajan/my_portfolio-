import { Component, ChangeDetectionStrategy, HostListener, signal, OnInit, OnDestroy, PLATFORM_ID, inject, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-cursor',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!isHidden()) {
      <div class="cursor-ring" 
           [class.hovering]="isHovering()" 
           [class.clicking]="isClicking()"
           [style.transform]="'translate3d(' + ringX() + 'px, ' + ringY() + 'px, 0)'">
      </div>
      
      <div class="cursor-dot" 
           [class.hovering]="isHovering()"
           [style.transform]="'translate3d(' + dotX() + 'px, ' + dotY() + 'px, 0)'">
      </div>
    }
  `,
  styles: [`
    :host {
      display: block; pointer-events: none; z-index: 99999;
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    }

    .cursor-dot {
      position: fixed; top: -4px; left: -4px;
      width: 8px; height: 8px;
      background: #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(100, 255, 218, 0.6);
      will-change: transform;
      transition: width 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s, opacity 0.3s, top 0.3s, left 0.3s;
      z-index: 2;
    }

    .cursor-ring {
      position: fixed; top: -16px; left: -16px;
      width: 32px; height: 32px;
      border: 1.5px solid rgba(100, 255, 218, 0.5);
      border-radius: 50%;
      will-change: transform;
      transition: width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.4s, border-color 0.4s, transform 0.1s linear;
      z-index: 1;
    }

    /* ── Hover States ── */
    .cursor-dot.hovering {
      width: 0px; height: 0px; top: 0px; left: 0px;
      opacity: 0;
    }

    .cursor-ring.hovering {
      width: 50px; height: 50px; top: -25px; left: -25px;
      background: rgba(100, 255, 218, 0.08);
      border-color: rgba(100, 255, 218, 0.8);
      box-shadow: 0 0 20px rgba(100, 255, 218, 0.2);
    }

    /* ── Click States ── */
    .cursor-ring.clicking {
      width: 24px; height: 24px; top: -12px; left: -12px;
      background: rgba(100, 255, 218, 0.25);
      border-color: #64ffda;
      transition: all 0.1s ease;
    }
  `]
})
export class CursorComponent implements OnInit, OnDestroy {
  isHidden = signal(true);
  isHovering = signal(false);
  isClicking = signal(false);

  // Position Signals
  dotX = signal(0);
  dotY = signal(0);
  ringX = signal(0);
  ringY = signal(0);

  private platformId = inject(PLATFORM_ID);
  
  // Target position for the ring
  private targetX = 0;
  private targetY = 0;
  
  private reqId: number | null = null;
  private isMouseInside = false;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Hide default cursor over entire body when component loads
      document.body.style.cursor = 'none';
      this.initHoverListeners();
      this.animate();
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.cursor = 'auto'; // restore
      if (this.reqId) cancelAnimationFrame(this.reqId);
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.isMouseInside) {
      this.isMouseInside = true;
      this.isHidden.set(false);
    }
    
    // Dot instantly follows cursor
    this.dotX.set(e.clientX);
    this.dotY.set(e.clientY);
    
    // Ring targets cursor
    this.targetX = e.clientX;
    this.targetY = e.clientY;
  }

  @HostListener('window:mouseenter')
  onMouseEnter() {
    this.isMouseInside = true;
    this.isHidden.set(false);
  }

  @HostListener('window:mouseleave')
  onMouseLeave() {
    this.isMouseInside = false;
    this.isHidden.set(true);
  }
  
  @HostListener('window:mousedown')
  onMouseDown() { this.isClicking.set(true); }

  @HostListener('window:mouseup')
  onMouseUp() { this.isClicking.set(false); }

  private animate() {
    // Lerp (linear interpolation) for smooth trailing effect
    const curX = this.ringX();
    const curY = this.ringY();
    
    const dx = this.targetX - curX;
    const dy = this.targetY - curY;
    
    // Factor determines speed (0.15 is smooth and responsive)
    this.ringX.set(curX + dx * 0.15);
    this.ringY.set(curY + dy * 0.15);

    this.reqId = requestAnimationFrame(() => this.animate());
  }

  private initHoverListeners() {
    // Attach listeners to interactive elements globally
    const interactives = document.querySelectorAll('a, button, input, textarea, .dot-wrap');
    
    interactives.forEach(el => {
      // Avoid mutating elements style physically if not needed, just logic
      (el as HTMLElement).style.cursor = 'none'; // Force no default pointer
      
      el.addEventListener('mouseenter', () => this.isHovering.set(true));
      el.addEventListener('mouseleave', () => this.isHovering.set(false));
    });

    // We also want a MutationObserver in real environments to catch dynamically loaded anchors/buttons,
    // but a global mouseover event listener is much faster and catches everything instantly!
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, textarea, .dot-wrap')) {
         this.isHovering.set(true);
         // Override cursor on hover targets
         if (target.style) target.style.cursor = 'none';
      } else {
         this.isHovering.set(false);
      }
    });
  }
}
