import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ScrollService implements OnDestroy {
  private readonly doc = inject(DOCUMENT);

  readonly scrollY = signal(0);
  readonly scrollDirection = signal<'up' | 'down'>('up');
  readonly isAtTop = computed(() => this.scrollY() < 50);
  readonly scrollProgress = computed(() => {
    if (typeof window === 'undefined') return 0;
    const docHeight = this.doc.documentElement.scrollHeight - window.innerHeight;
    return docHeight > 0 ? Math.min((this.scrollY() / docHeight) * 100, 100) : 0;
  });

  private lastY = 0;
  private ticking = false;
  private boundOnScroll: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.boundOnScroll = () => this.onScroll();
      window.addEventListener('scroll', this.boundOnScroll, { passive: true });
    }
  }

  private onScroll(): void {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        this.scrollDirection.set(y > this.lastY ? 'down' : 'up');
        this.lastY = y;
        this.scrollY.set(y);
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  scrollToSection(id: string): void {
    const el = this.doc.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    if (this.boundOnScroll) {
      window.removeEventListener('scroll', this.boundOnScroll);
    }
  }
}
