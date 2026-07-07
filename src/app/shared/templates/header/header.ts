import { Component, HostListener, signal, inject, afterNextRender, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PortfolioDataService } from '../../services/portfolio-data.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header implements OnDestroy {
  protected readonly pds        = inject(PortfolioDataService);
  private readonly doc          = inject(DOCUMENT);
  protected readonly isScrolled = signal(false);
  protected readonly isMenuOpen = signal(false);

  // Scroll-spy: which in-page section is currently active.
  protected readonly activeSection = signal<string>('home');
  private observer?: IntersectionObserver;
  private navMenuElement?: HTMLElement;
  private menuTriggerButton?: HTMLElement;
  private setupFocusTrapOnce = false;

  constructor() {
    afterNextRender(() => this.setupScrollSpy());
  }

  @HostListener('window:scroll', [])
  onWindowScroll() { this.isScrolled.set(window.scrollY > 30); }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isMenuOpen()) {
      event.preventDefault();
      this.closeMenu();
      this.menuTriggerButton?.focus();
    }
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
    if (this.isMenuOpen() && !this.setupFocusTrapOnce) {
      this.setupFocusTrap();
    }
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  private setupFocusTrap(): void {
    this.setupFocusTrapOnce = true;
    this.menuTriggerButton = this.doc.querySelector('[data-nav-toggle]') || undefined;
    this.navMenuElement = this.doc.querySelector('nav.nav-menu') || undefined;

    if (!this.navMenuElement) return;

    const focusableSelectors = [
      'a[href]', 'button:not([disabled])', 'input:not([disabled])',
      'select:not([disabled])', 'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    const focusableElements = Array.from(
      this.navMenuElement.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    afterNextRender(() => {
      firstElement.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey && this.doc.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && this.doc.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      };
      this.navMenuElement!.addEventListener('keydown', handleKeyDown);
    });
  }

  /** True when the given nav href points at the currently-visible section. */
  protected isActive(href?: string): boolean {
    return !!href && href.startsWith('#') && href.slice(1) === this.activeSection();
  }

  private setupScrollSpy(): void {
    const ids = ((this.pds.nav()?.links ?? []) as Array<{ href?: string }>)
      .map(l => l.href)
      .filter((h): h is string => !!h && h.startsWith('#'))
      .map(h => h.slice(1));
    if (!ids.includes('home')) ids.unshift('home');

    const sections = ids
      .map(id => this.doc.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return; // e.g. on /blog or /hire-me routes

    // Narrow detection band around the viewport middle so the active section
    // switches as each one crosses the centre while scrolling.
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) this.activeSection.set(e.target.id);
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach(s => this.observer!.observe(s));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
