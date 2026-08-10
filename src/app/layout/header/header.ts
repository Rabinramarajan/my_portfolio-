import { DOCUMENT } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { Button } from '../../shared/components/button/button';
import { CursorTarget } from '../../shared/directives/cursor-target';
import { PortfolioStore } from '../../core/services/portfolio-store';

interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly fragment?: string;
}

const NAV: readonly NavItem[] = [
  { label: 'About', path: '/', fragment: 'about' },
  { label: 'Services', path: '/', fragment: 'services' },
  { label: 'Work', path: '/work' },
  { label: 'Experience', path: '/', fragment: 'experience' },
  { label: 'Process', path: '/', fragment: 'process' },
  { label: 'Résumé', path: '/resume' },
];

/**
 * Site header: pinned to the top of the viewport at all times, transparent over
 * the hero and condensed once scrolled, with a fullscreen menu below the large
 * breakpoint.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Button, CursorTarget],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(PortfolioStore);

  protected readonly nav = NAV;
  protected readonly profile = this.store.profile;
  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly menuLabel = computed(() => (this.menuOpen() ? 'Close menu' : 'Open menu'));

  constructor() {
    // Any navigation closes the menu — including back/forward, which a click
    // handler on the links alone would miss.
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.menuOpen.set(false));

    // Scroll-locking is a side effect on a DOM outside this component's tree,
    // which is exactly what `effect` is for.
    effect(() => {
      this.document.body.style.overflow = this.menuOpen() ? 'hidden' : '';
    });
    this.destroyRef.onDestroy(() => (this.document.body.style.overflow = ''));

    afterNextRender(() => this.watchScroll());
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  /**
   * Navigation from inside the open fullscreen menu.
   *
   * Closing the menu and navigating in the same frame makes the router's view
   * transition capture the menu mid-animation — which crashes WebKit outright.
   * Deferring the navigation by a frame also reads better: the menu starts
   * closing, then the page changes.
   */
  protected navigateFromMenu(event: MouseEvent, path: string, fragment?: string): void {
    // Modified clicks and non-primary buttons belong to the browser.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    this.menuOpen.set(false);
    requestAnimationFrame(() => {
      void this.router.navigate([path], fragment ? { fragment } : {});
    });
  }

  /**
   * The header stays pinned; this only tracks whether the page has scrolled at
   * all, which swaps it from transparent-over-hero to its condensed treatment.
   */
  private watchScroll(): void {
    let frame = 0;

    const measure = () => {
      frame = 0;
      this.scrolled.set(window.scrollY > 40);
    };

    const onScroll = () => {
      frame ||= requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    measure();
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    });
  }
}
