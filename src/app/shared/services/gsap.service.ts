import { Injectable } from '@angular/core';

interface ScrollTriggerConfig {
  [key: string]: unknown;
}

interface AnimationOptions {
  delay?: number;
  stagger?: number;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class GsapService {
  private gsapModule: any = null;
  private scrollTriggerModule: any = null;
  private loaded = false;

  async init(): Promise<void> {
    if (this.loaded) return;
    if (typeof window === 'undefined') return;

    const [gsapMod, stMod] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);

    this.gsapModule = gsapMod.gsap || gsapMod.default;
    this.scrollTriggerModule = stMod.ScrollTrigger || stMod.default;
    if (this.gsapModule && this.scrollTriggerModule) {
      this.gsapModule.registerPlugin(this.scrollTriggerModule);
    }
    this.loaded = true;
  }

  get gsap(): any {
    return this.gsapModule;
  }

  get ScrollTrigger(): any {
    return this.scrollTriggerModule;
  }

  get isLoaded(): boolean {
    return this.loaded;
  }

  fadeInUp(
    elements: Element | Element[] | string,
    options: AnimationOptions = {}
  ): any {
    if (!this.gsapModule) return null;
    return this.gsapModule.from(elements, {
      y: 40,
      opacity: 0,
      duration: options.duration ?? 0.8,
      delay: options.delay ?? 0,
      stagger: options.stagger ?? 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: elements,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }

  staggerIn(elements: Element[] | string, stagger = 0.08): any {
    if (!this.gsapModule) return null;
    return this.gsapModule.from(elements, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: elements,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }

  createTimeline(scrollTriggerConfig?: ScrollTriggerConfig): any {
    if (!this.gsapModule) return null;
    const config: any = { defaults: { ease: 'power3.out', duration: 0.8 } };
    if (scrollTriggerConfig) {
      config.scrollTrigger = scrollTriggerConfig;
    }
    return this.gsapModule.timeline(config);
  }

  refresh(): void {
    this.scrollTriggerModule?.refresh();
  }

  killAll(): void {
    this.scrollTriggerModule?.getAll().forEach((t: any) => t.kill());
  }
}
