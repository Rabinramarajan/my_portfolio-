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
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';

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

  /** The current route as a signal, kept in step with the router. */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /**
   * The nav item matching the current route, for the mobile menu. The body is
   * scroll-locked while the menu is open, so only the route can change — the
   * menu highlights the page you are on, never a scroll position.
   */
  protected readonly activePath = computed(() => {
    const route = (this.currentUrl() ?? '').split(/[?#]/)[0];
    if (route === '/') {
      return null;
    }
    return (
      this.nav.find(
        (item) => item.path !== '/' && (route === item.path || route.startsWith(`${item.path}/`)),
      )?.path ?? route
    );
  });

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

    afterNextRender(() => {
      this.watchScroll();
      this.document.addEventListener('keydown', this.onKeydown);
    });
    this.destroyRef.onDestroy(() => this.document.removeEventListener('keydown', this.onKeydown));
  }

  protected toggleMenu(): void {
    const open = !this.menuOpen();
    this.menuOpen.set(open);
    this.focusMenu(open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
    this.focusMenu(false);
  }

  /**
   * Keyboard support for the fullscreen menu: Escape closes it, and Tab keeps
   * focus trapped inside while it is open.
   */
  private onKeydown = (event: KeyboardEvent): void => {
    if (!this.menuOpen()) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.menuOpen.set(false);
      this.focusMenu(false);
    } else if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  };

  /**
   * Moves focus to the first menu link when the menu opens (dialog pattern) and
   * back to the toggle when it closes. Runs after a frame so the is-open class
   * has flipped the menu from `visibility: hidden`.
   */
  private focusMenu(open: boolean): void {
    requestAnimationFrame(() => {
      if (open) {
        this.document.querySelector<HTMLElement>('#mobile-menu a')?.focus();
      } else {
        this.document.querySelector<HTMLElement>('.hd__toggle')?.focus();
      }
    });
  }

  /**
   * Keeps Tab/Shift+Tab cycling within the open menu instead of leaking out.
   *
   * The menu intercepts every Tab and moves focus itself, because relying on
   * the browser's native focus order is not portable — WebKit, for instance,
   * walks the menu in a different order than the DOM.
   */
  private trapFocus(event: KeyboardEvent): void {
    const menu = this.document.querySelector<HTMLElement>('#mobile-menu');
    const focusables = [
      ...(menu?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []),
    ];
    if (focusables.length === 0) {
      return;
    }
    event.preventDefault();
    const current = focusables.indexOf(this.document.activeElement as HTMLElement);
    const next =
      current === -1
        ? event.shiftKey
          ? focusables[focusables.length - 1]
          : focusables[0]
        : focusables[(current + (event.shiftKey ? -1 : 1) + focusables.length) % focusables.length];
    next.focus();
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
