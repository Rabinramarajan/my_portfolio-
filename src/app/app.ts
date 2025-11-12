import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs';
import { AnalyticsService } from './services/analytics/analytics';
import { FooterComponent } from './components/general/footer/footer.component';
import { HeaderComponent } from './components/general/header/header.component';
import { SplashScreenComponent } from './components/general/splash-screen/splash-screen.component';
import Lenis from 'lenis';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { LanguageService } from './services/language/language.service';
import { ParticlesService } from './services/particles/particles.service';
import { LoadingService } from './services/loading/loading.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SplashScreenComponent
  ],
  providers: [
  ],
  template: `
      <app-splash-screen (animationCompleted)="onSplashAnimationCompleted()"></app-splash-screen>

      <div class="app-content" [style.visibility]="appContentVisible ? 'visible' : 'hidden'">
        <app-header></app-header>
        <router-outlet></router-outlet>
        <app-footer></app-footer>
      </div>
  `,
  styles: [`
   @use '../variables' as *;

    :host {
      background-color: $Navy;
      min-height: 100vh;
      display: block;
    }

    .app-content {
      background-color: $Navy;
      min-height: 100vh;
    }
  `]
})
export class App {

  protected readonly title = signal('my_resume');

  appContentVisible = false;
  private lenis!: Lenis;

  private updates = inject(SwUpdate);
  private router = inject(Router);
  private analytics = inject(AnalyticsService);
  private titles = inject(Title);
  private meta = inject(Meta);
  private translate = inject(TranslateService);
  private location = inject(Location);
  private language = inject(LanguageService);
  private particles = inject(ParticlesService);
  private loading = inject(LoadingService);


  constructor() {
    debugger;
    // Automatic pageview tracking on navigation end.
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(ev => {
      try {
        this.analytics.sendAnalyticPageView(ev.urlAfterRedirects);
      } catch (e) {
        // swallow analytics errors so app navigation isn't affected
        console.warn('Analytics pageview failed', e);
      }
    });
    if (this.updates.isEnabled) {
      this.updates.versionUpdates.subscribe(evt => {
        if (evt.type === 'VERSION_READY') {
          if (confirm('New version available. Reload now?')) {
            this.updates.activateUpdate().then(() => document.location.reload());
          }
        }
      });
    }
  }

  ngOnInit(): void {
    debugger
    this.language.initLanguage();

    this.titles.setTitle("Rabin R | Frontend Developer");

    this.meta.addTags([
      { name: 'keywords', content: 'Frontend, Angular, Ionic, TypeScript, Web Developer, PWA, UI/UX' },
      {
        name: 'description',
        content: 'Frontend Developer with 3.5 years of experience building scalable, responsive, and high-performance web & mobile applications. Skilled in Angular, Ionic, TypeScript, REST APIs, and modern UI/UX practices.'
      },
    ]);

    setTimeout(() => {
      this.particles.init();
    }, 100);
  }

  private initLenis(): void {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false
    });

    const raf = (time: number) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  ngOnDestroy(): void {
    if (this.lenis) {
      this.lenis.destroy();
    }
    this.particles.destroy();
  }

  onSplashAnimationCompleted(): void {
    this.appContentVisible = true;

    // Initialize Lenis after content is visible
    setTimeout(() => {
      this.initLenis();
    }, 100);

    // Start component animations
    this.loading.startAnimations();
  }

}
