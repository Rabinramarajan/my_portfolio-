import { DOCUMENT } from '@angular/common';
import { Injectable, Inject, NgZone } from '@angular/core';
import { fromEvent, map, pairwise, startWith, distinctUntilChanged, throttleTime, shareReplay, Observable, Subject } from 'rxjs';

export type ScrollTarget = string | Element | null | undefined;

export interface ScrollOptions {
  behavior?: ScrollBehavior | 'animate'; // 'smooth' uses native if available; 'animate' forces rAF animation
  offset?: number; // positive lowers target, negative raises
  block?: ScrollLogicalPosition; // for scrollIntoView
  inline?: ScrollLogicalPosition; // for scrollIntoView
  container?: Element | Window; // defaults to window
  durationMs?: number; // used for 'animate' fallback
  easing?: (t: number) => number; // easing for rAF animation
  focus?: boolean; // focus the element after scrolling
}

export interface ScrollPosition {
  x: number;
  y: number;
}

export type ScrollDirection = 'up' | 'down' | 'none';

@Injectable({ providedIn: 'root' })
export class Scroll {
  private locks = 0;
  private previousBodyOverflow: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    private zone: NgZone,
  ) { }

  // Basic helpers
  get win(): Window | null {
    return this.doc.defaultView ?? null;
  }

  getScrollPosition(container?: Element | Window): ScrollPosition {
    const c = container ?? this.win!;
    if (this.isElement(c)) {
      return { x: (c as Element).scrollLeft, y: (c as Element).scrollTop };
    }
    const w = this.win!;
    return { x: w.scrollX, y: w.scrollY };
  }

  // Observe scroll with direction, throttled
  observeScroll(container?: Element | Window, throttleMs = 50): Observable<{ pos: ScrollPosition; direction: ScrollDirection; }>
  {
    const c = container ?? this.win!;
    const target = this.isElement(c) ? (c as Element) : this.win!;
    return this.zone.runOutsideAngular(() =>
      fromEvent(target as any, 'scroll').pipe(
        throttleTime(throttleMs, undefined, { trailing: true, leading: true }),
        map(() => this.getScrollPosition(c)),
        startWith(this.getScrollPosition(c)),
        pairwise(),
        map(([prev, curr]) => ({
          pos: curr,
          direction: curr.y === prev.y ? 'none' : (curr.y > prev.y ? 'down' : 'up') as ScrollDirection,
        })),
        shareReplay({ bufferSize: 1, refCount: true })
      )
    );
  }

  // Smoothly scroll to top/bottom
  scrollToTop(options: Partial<ScrollOptions> = {}): void {
    const container = options.container ?? this.win!;
    this.scrollToY(0, { ...options, container });
  }

  scrollToBottom(options: Partial<ScrollOptions> = {}): void {
    const container = options.container ?? this.win!;
    const maxY = this.maxScrollY(container);
    this.scrollToY(maxY, { ...options, container });
  }

  // Scroll to element or selector with optional offset
  scrollTo(target: ScrollTarget, options: Partial<ScrollOptions> = {}): void {
    const el = this.resolveTarget(target);
    if (!el) return;
    const container = options.container ?? this.win!;

    const offset = options.offset ?? 0;
    const rect = el.getBoundingClientRect();
    const containerTop = this.isElement(container) ? (container as Element).getBoundingClientRect().top : 0;
    const currentY = this.getScrollPosition(container).y;
    const targetY = currentY + rect.top - containerTop - offset;

    // Prefer position-based scroll to support offset across browsers
    this.scrollToY(targetY, options as ScrollOptions);

    if (options.focus) {
      // Try focusing the element for a11y after scroll completes
      this.zone.runOutsideAngular(() => {
        setTimeout(() => {
          const node = el as HTMLElement;
          if (!this.isFocusable(node)) {
            node.setAttribute('tabindex', '-1');
          }
          node.focus({ preventScroll: true });
        }, 0);
      });
    }
  }

  // Core scroll implementation: native smooth if available, else rAF animate
  scrollToY(y: number, options: Partial<ScrollOptions> = {}): void {
    const container = options.container ?? this.win!;
    const behavior = options.behavior ?? 'smooth';

    if (behavior !== 'animate' && 'scrollTo' in (container as any)) {
      if (this.isElement(container)) {
        (container as Element).scrollTo({ top: y, behavior: behavior as ScrollBehavior });
      } else {
        this.win!.scrollTo({ top: y, behavior: behavior as ScrollBehavior });
      }
      return;
    }

    // rAF fallback/forced animation
    const start = this.getScrollPosition(container).y;
    const change = y - start;
    const duration = Math.max(0, options.durationMs ?? 400);
    if (duration === 0 || change === 0) {
      this.setScrollY(container, y);
      return;
    }
    const ease = options.easing ?? ((t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t); // easeInOutQuad

    this.zone.runOutsideAngular(() => {
      const startTime = performance.now();
      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const pos = start + change * ease(t);
        this.setScrollY(container, pos);
        if (t < 1) this.win!.requestAnimationFrame(step);
      };
      this.win!.requestAnimationFrame(step);
    });
  }

  // Section spy: returns the id of the most visible section
  spySections(targets: Array<Element | string>, opts?: { root?: Element | null; rootMargin?: string; threshold?: number | number[]; }): Observable<string> {
    const elements = targets
      .map(t => typeof t === 'string' ? this.doc.getElementById(t) : t)
      .filter((e): e is Element => !!e);
    if (elements.length === 0) {
      return new Observable<string>((sub) => sub.complete());
    }
    if (!this.win || typeof (this.win as any).IntersectionObserver === 'undefined') {
      // Fallback: emit first element id immediately
      return new Observable<string>((sub) => {
        const first = elements[0] as HTMLElement;
        if (first && first.id) sub.next(first.id);
        sub.complete();
      });
    }

    return new Observable<string>((subscriber) => {
      const visibility = new Map<Element, number>();
      const onChange = () => {
        let bestId: string | null = null;
        let bestRatio = -1;
        visibility.forEach((ratio, el) => {
          const node = el as HTMLElement;
          if (ratio > bestRatio) { bestRatio = ratio; bestId = node.id || null; }
        });
        if (bestId) subscriber.next(bestId);
      };

      const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          visibility.set(entry.target, entry.intersectionRatio);
        }
        onChange();
      }, {
        root: opts?.root ?? null,
        rootMargin: opts?.rootMargin ?? '0px 0px -40% 0px', // favor upper sections
        threshold: opts?.threshold ?? [0, 0.25, 0.5, 0.75, 1],
      });

      elements.forEach(el => io.observe(el));

      return () => io.disconnect();
    }).pipe(
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  // Lock/unlock body scroll (e.g., when showing modals)
  lockScroll(): void {
    if (!this.doc || !this.doc.body) return;
    if (this.locks === 0) {
      this.previousBodyOverflow = this.doc.body.style.overflow || '';
      this.doc.body.style.overflow = 'hidden';
    }
    this.locks++;
  }

  unlockScroll(): void {
    if (!this.doc || !this.doc.body) return;
    if (this.locks > 0) this.locks--;
    if (this.locks === 0) {
      this.doc.body.style.overflow = this.previousBodyOverflow ?? '';
      this.previousBodyOverflow = null;
    }
  }

  // Utilities
  private isElement(obj: any): obj is Element {
    return obj && typeof obj === 'object' && 'nodeType' in obj && obj.nodeType === 1;
  }

  private resolveTarget(target: ScrollTarget): Element | null {
    if (!target) return null;
    if (typeof target === 'string') return this.doc.getElementById(target) || this.doc.querySelector(target);
    if (this.isElement(target)) return target as Element;
    return null;
  }

  private setScrollY(container: Element | Window, y: number): void {
    if (this.isElement(container)) {
      (container as Element).scrollTop = y;
    } else {
      this.win!.scrollTo(0, y);
    }
  }

  private maxScrollY(container: Element | Window): number {
    if (this.isElement(container)) {
      const el = container as Element;
      return el.scrollHeight - el.clientHeight;
    }
    const d = this.doc.documentElement;
    const b = this.doc.body;
    return Math.max(d.scrollHeight, b.scrollHeight) - this.win!.innerHeight;
  }

  private isFocusable(el: HTMLElement): boolean {
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    const focusableTags = ['a', 'button', 'input', 'select', 'textarea'];
    const hasHref = tag === 'a' && (el as HTMLAnchorElement).href;
    const tabIndexAttr = el.getAttribute('tabindex');
    const tabIndex = tabIndexAttr !== null ? parseInt(tabIndexAttr, 10) : el.tabIndex;
    const enabled = !(el as HTMLButtonElement).disabled;
    return !!(
      (focusableTags.includes(tag) && enabled) ||
      hasHref ||
      (typeof tabIndex === 'number' && tabIndex >= 0)
    );
  }
}
