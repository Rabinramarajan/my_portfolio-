import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type LoaderState = 'initializing' | 'loading' | 'ready' | 'complete';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private readonly platformId = inject(PLATFORM_ID);
  
  // The state of the cinematic loading sequence
  readonly state = signal<LoaderState>('initializing');
  
  // Expose whether this is a fast return visit
  readonly isReturnVisit = signal<boolean>(false);

  private timeoutId?: ReturnType<typeof setTimeout>;
  private readonly MAX_DURATION = 2000;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      // Server-side rendering should never block on a cinematic loader
      this.state.set('complete');
      return;
    }

    try {
      const visited = sessionStorage.getItem('portfolio_loader_played');
      if (visited === 'true') {
        this.isReturnVisit.set(true);
      }
    } catch {
      // sessionStorage might be blocked by privacy settings
    }
  }

  /**
   * Starts the loader sequence, setting the failsafe timeout.
   */
  start(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.state.set('loading');
    
    // Safety net: never trap the user indefinitely
    this.timeoutId = setTimeout(() => {
      this.markReady();
    }, this.MAX_DURATION);
  }

  /**
   * Signals that the application (fonts, key images, data) is ready to be revealed.
   */
  markReady(): void {
    if (this.state() === 'complete' || !isPlatformBrowser(this.platformId)) return;
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
    
    this.state.set('ready');
  }

  /**
   * Called by the Loader Component when its GSAP exit animation finishes.
   */
  complete(): void {
    this.state.set('complete');
    
    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.setItem('portfolio_loader_played', 'true');
      } catch {
        // ignore storage errors
      }
    }
  }
}
