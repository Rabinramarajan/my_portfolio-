import { Component, HostListener, signal, inject, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';

import { SeoService } from '../core/services/seo.service';
import { ContactComponent } from '../features/contact/contact.component';
import { ExperienceComponent } from '../features/experience/experience.component';
import { HeroComponent } from '../features/hero/hero.component';
import { ProjectsComponent } from '../features/projects/projects.component';
import { ServicesComponent } from '../features/services/services.component';
import { SkillsComponent } from '../features/skills/skills.component';
import { TestimonialsComponent } from '../features/testimonials/testimonials.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { CursorComponent } from '../shared/components/cursor/cursor.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    HeroComponent,
    SkillsComponent,
    ProjectsComponent,
    ExperienceComponent,
    ServicesComponent,
    TestimonialsComponent,
    ContactComponent,
    LoaderComponent,
    CursorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ── System Cursor Override ── -->
    <app-cursor></app-cursor>

    <!-- ── Page Loader ── -->
    <app-loader (loadComplete)="loaderDone.set(true)"></app-loader>

    <!-- ── Top Navigation ── -->
    <header class="header" [class.scrolled]="activeSlide() > 0">
      <div class="logo">
        <a href="javascript:void(0)" aria-label="home" (click)="goToSlide(0)">
          <svg id="logo" xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 80 80">
            <title>Rabin Ramarajan</title>
            <defs>
              <linearGradient id="navG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#64ffda"/>
                <stop offset="100%" stop-color="#7b61ff"/>
              </linearGradient>
            </defs>
            <!-- Outer diamond -->
            <polygon points="40,2 78,40 40,78 2,40"
              fill="rgba(100,255,218,0.04)"
              stroke="url(#navG)" stroke-width="1.6" stroke-linejoin="miter"/>
            <!-- Inner diamond accent -->
            <polygon points="40,14 66,40 40,66 14,40"
              fill="none"
              stroke="rgba(100,255,218,0.15)" stroke-width="0.8" stroke-linejoin="miter"/>
            <!-- Corner tick marks (circuit style) -->
            <line x1="35" y1="2"  x2="45" y2="2"  stroke="#64ffda" stroke-width="1.5"/>
            <line x1="78" y1="35" x2="78" y2="45" stroke="#7b61ff" stroke-width="1.5"/>
            <line x1="35" y1="78" x2="45" y2="78" stroke="#7b61ff" stroke-width="1.5"/>
            <line x1="2"  y1="35" x2="2"  y2="45" stroke="#64ffda" stroke-width="1.5"/>
            <!-- Cardinal glow dots -->
            <circle cx="40" cy="2"  r="2.5" fill="#64ffda"/>
            <circle cx="78" cy="40" r="2.5" fill="#7b61ff"/>
            <circle cx="40" cy="78" r="2.5" fill="#7b61ff"/>
            <circle cx="2"  cy="40" r="2.5" fill="#64ffda"/>
            <!-- RR monogram -->
            <text x="40" y="46"
              font-family="Inter, sans-serif" font-size="22"
              font-weight="900" text-anchor="middle"
              fill="url(#navG)" letter-spacing="-1">RR</text>
          </svg>
        </a>
      </div>
      <nav class="nav">
        <ol class="nav-links">
          @for (link of navLinks; track link.label) {
            <li>
              <a href="javascript:void(0)"
                 (click)="goToSlide(link.slide)"
                 [class.active-nav]="activeSlide() === link.slide">
                {{ link.label }}
              </a>
            </li>
          }
        </ol>
        <!-- <a href="javascript:void(0)" class="resume-button">Resume</a> -->
      </nav>
    </header>

    <!-- ── Slide Container ── -->
    <div class="slides-container" [style.transform]="'translateY(' + (-activeSlide() * 100) + 'vh)'">

      <section class="slide" id="hero">
        <app-hero [isActive]="activeSlide() === 0"></app-hero>
      </section>

      <section class="slide" id="about" #aboutSlide>
        @defer (on viewport(aboutSlide); prefetch on idle) {
          <app-skills [isActive]="activeSlide() === 1"></app-skills>
        }
      </section>

      <section class="slide" id="projects" #projectsSlide>
        @defer (on viewport(projectsSlide); prefetch on idle) {
          <app-projects [isActive]="activeSlide() === 2"></app-projects>
        }
      </section>

      <section class="slide" id="experience" #experienceSlide>
        @defer (on viewport(experienceSlide); prefetch on idle) {
          <app-experience [isActive]="activeSlide() === 3"></app-experience>
        }
      </section>

      <section class="slide" id="services" #servicesSlide>
        @defer (on viewport(servicesSlide); prefetch on idle) {
          <app-services [isActive]="activeSlide() === 4"></app-services>
        }
      </section>

      <!-- <section class="slide" id="testimonials" #testimonialsSlide>
        @defer (on viewport(testimonialsSlide); prefetch on idle) {
          <app-testimonials [isActive]="activeSlide() === 5"></app-testimonials>
        }
      </section> -->

      <section class="slide" id="contact" #contactSlide>
        @defer (on viewport(contactSlide); prefetch on idle) {
          <app-contact [isActive]="activeSlide() === 5"></app-contact>
        }
      </section>

    </div>

    <!-- ── Slide Progress Bar ── -->
    <div class="scroll-progress-bar">
      <div class="scroll-progress-fill" [style.width.%]="(activeSlide() / (totalSlides - 1)) * 100"></div>
    </div>

    <!-- ── Slide Progress Indicator ── -->
    <div class="slide-nav-dots">
      @for (s of slideNames; track s; let i = $index) {
        <div class="dot-wrap" (click)="goToSlide(i)" [title]="s">
          <div class="dot-pill" [class.active]="activeSlide() === i">
            <div class="dot-inner"></div>
          </div>
          <span class="dot-label">{{ s }}</span>
        </div>
      }
    </div>

    <!-- ── Fixed Left Social Bar ── -->
    <div class="fixed-left-panel">
      <ul class="social-list">

        <!-- github -->
        <li><a href="https://github.com/Rabinramarajan" target="_blank" aria-label="GitHub" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
        </a></li>

        <!-- instagram -->
        <li><a href="https://www.instagram.com/heyitsrabin" target="_blank" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </a></li>

        <!-- linkedin -->
        <li><a href="https://www.linkedin.com/in/rabinr" target="_blank" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
        </a></li>

        <!-- codepen -->
        <!-- <li><a href="https://codepen.io" target="_blank" aria-label="CodePen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon><line x1="12" y1="22" x2="12" y2="15.5"></line><polyline points="22 8.5 12 15.5 2 8.5"></polyline><polyline points="2 15.5 12 8.5 22 15.5"></polyline><line x1="12" y1="2" x2="12" y2="8.5"></line></svg>
        </a></li> -->
      </ul>
    </div>

    <!-- ── Fixed Right Email Bar ── -->
    <div class="fixed-right-panel">
      <div class="email-wrapper">
        <a href="mailto:rabinr2607@gmail.com">rabinr2607&#64;gmail.com</a>
      </div>
    </div>

    <!-- ── Copyright Bar ── -->
    <div class="copyright-bar" [class.cr-visible]="loaderDone()">
      <div class="cr-inner">
        <span class="cr-dot"></span>
        <span class="cr-text">
          &copy; {{ currentYear }} <strong>Rabin Ramarajan</strong>.
          Crafted with
          <span class="cr-heart">&#10084;</span>
          in Angular {{ currentYear > 2025 ? currentYear : 2025 }}.
        </span>
        <span class="cr-divider">|</span>
        <span class="cr-status">Open to Opportunities</span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      position: relative;
    }

    /* ── Copyright Bar ── */
    .copyright-bar {
      position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
      z-index: 90;
      padding: 10px 24px;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.8s ease 0.3s;
      pointer-events: none;
    }
    .copyright-bar.cr-visible { opacity: 1; pointer-events: auto; }
    .cr-inner {
      display: flex; align-items: center; gap: 10px;
      background: rgba(5, 13, 26, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(100,255,218,0.08);
      border-radius: 30px;
      padding: 6px 18px;
      box-shadow: 0 -2px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(100,255,218,0.05);
    }
    .cr-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #64ffda;
      box-shadow: 0 0 6px #64ffda, 0 0 12px rgba(100,255,218,0.4);
      flex-shrink: 0;
      animation: crPulse 2s ease-in-out infinite;
    }
    @keyframes crPulse {
      0%,100% { box-shadow: 0 0 4px #64ffda; }
      50%      { box-shadow: 0 0 12px #64ffda, 0 0 24px rgba(100,255,218,0.4); }
    }
    .cr-text {
      font-family: 'Fira Code', monospace; font-size: 10px;
      color: #495670; letter-spacing: 0.03em; white-space: nowrap;
      strong { color: #8892b0; font-weight: 600; }
    }
    .cr-heart { color: #ff6b6b; }
    .cr-divider { color: #233554; font-size: 12px; }
    .cr-status {
      font-family: 'Fira Code', monospace; font-size: 10px;
      color: #64ffda; letter-spacing: 0.05em;
    }
    @media (max-width: 768px) { .copyright-bar { display: none; } }

    /* ── Header ── */
    .header {
      position: fixed;
      top: 0; width: 100%;
      padding: 0 50px;
      height: 90px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 100;
      background: transparent;
      transition: background 0.4s ease, box-shadow 0.4s ease;
      &.scrolled {
        background: rgba(5, 13, 26, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        box-shadow: 0 1px 0 rgba(100,255,218,0.08);
      }
    }

    .logo a {
      display: inline-block; width: 42px; height: 42px;
      svg { width: 100%; height: 100%; transition: transform 0.25s; &:hover { transform: translateY(-3px); } }
    }

    .nav {
      display: flex; align-items: center;
      .nav-links {
        display: flex; margin: 0; padding: 0; list-style: none;
        counter-reset: item;
        li { margin: 0 4px; counter-increment: item;
          a {
            padding: 10px 12px;
            font-family: 'Fira Code', monospace; font-size: 13px;
            color: #8892b0; text-decoration: none;
            transition: color 0.25s;
            position: relative;
            &::before { content: '0' counter(item) '.'; margin-right: 5px; color: #64ffda; font-size: 12px; }
            &:hover, &.active-nav { color: #64ffda; }
          }
        }
      }
      .resume-button {
        color: #64ffda; background: transparent;
        border: 1px solid #64ffda; border-radius: 4px;
        padding: 8px 16px;
        font-family: 'Fira Code', monospace; font-size: 13px;
        text-decoration: none; margin-left: 16px;
        transition: all 0.2s;
        &:hover { background: rgba(100,255,218,0.1); transform: translateY(-2px); }
      }
    }

    /* ── Slides ── */
    .slides-container {
      width: 100%; height: 100%;
      will-change: transform;
      transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
    }
    .slide {
      width: 100%; height: 100vh;
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      position: relative; overflow: hidden;
    }

    /* ── Scroll Progress Bar ── */
    .scroll-progress-bar {
      position: fixed; top: 0; left: 0; right: 0;
      height: 2px; z-index: 1000;
      background: rgba(255,255,255,0.04);
    }
    .scroll-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #64ffda, #7b61ff, #3880ff);
      border-radius: 0 2px 2px 0;
      box-shadow: 0 0 10px rgba(100,255,218,0.5), 0 0 20px rgba(123,97,255,0.3);
      transition: width 0.6s cubic-bezier(0.65, 0, 0.35, 1);
      position: relative;
      &::after {
        content: '';
        position: absolute;
        right: 0; top: 50%;
        transform: translateY(-50%);
        width: 6px; height: 6px;
        border-radius: 50%;
        background: #64ffda;
        box-shadow: 0 0 8px #64ffda, 0 0 16px rgba(100,255,218,0.5);
      }
    }

    /* ── Dot nav ── */
    .slide-nav-dots {
      position: fixed; right: 28px; top: 50%;
      transform: translateY(-50%);
      display: flex; flex-direction: column; gap: 6px;
      z-index: 200;
    }
    .dot-wrap {
      display: flex; align-items: center; gap: 8px;
      cursor: pointer;
      justify-content: flex-end;
      &:hover .dot-pill { width: 28px; }
      &:hover .dot-label { opacity: 1; transform: translateX(0); }
    }
    .dot-label {
      font-family: 'Fira Code', monospace; font-size: 9px;
      color: #495670; letter-spacing: 0.06em; text-transform: uppercase;
      opacity: 0; transform: translateX(6px);
      transition: opacity 0.2s, transform 0.2s;
      white-space: nowrap; pointer-events: none;
    }
    .dot-pill {
      width: 6px; height: 6px;
      border-radius: 10px;
      background: #233554;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
      display: flex; align-items: center; justify-content: center;
      position: relative;
      overflow: hidden;
      &.active {
        width: 6px; height: 28px;
        background: linear-gradient(180deg, #64ffda, #7b61ff);
        border-color: rgba(100,255,218,0.3);
        box-shadow: 0 0 10px rgba(100,255,218,0.4), 0 0 20px rgba(123,97,255,0.2);
      }
      &.active .dot-inner {
        animation: dotPulse 2s ease-in-out infinite;
      }
      &:not(.active):hover {
        background: #3d4f6e;
        width: 20px;
      }
    }
    .dot-inner {
      width: 3px; height: 3px; border-radius: 50%;
      background: rgba(255,255,255,0.6);
    }
    @keyframes dotPulse {
      0%, 100% { opacity: 0.4; transform: scale(0.8); }
      50%       { opacity: 1;   transform: scale(1.2); }
    }

    /* ── Fixed Left ── */
    .fixed-left-panel {
      width: 40px; position: fixed; bottom: 0; left: 40px; z-index: 50; color: #8892b0;
      .social-list {
        display: flex; flex-direction: column; align-items: center;
        margin: 0; padding: 0; list-style: none;
        &::after {
          content: ''; display: block; width: 1px; height: 90px; margin: 0 auto;
          background: linear-gradient(to bottom, #495670, transparent);
        }
        li:last-of-type { margin-bottom: 20px; }
        a {
          padding: 10px; display: inline-block; color: inherit;
          transition: transform 0.2s, color 0.2s;
          &:hover { color: #64ffda; transform: translateY(-3px); }
          svg { width: 20px; height: 20px; }
        }
      }
    }

    /* ── Fixed Right ── */
    .fixed-right-panel {
      width: 40px; position: fixed; bottom: 0; right: 40px; z-index: 50; color: #8892b0;
      .email-wrapper {
        display: flex; flex-direction: column; align-items: center; position: relative;
        &::after {
          content: ''; display: block; width: 1px; height: 90px; margin: 0 auto;
          background: linear-gradient(to bottom, #495670, transparent);
        }
        a {
          margin: 20px auto; padding: 10px;
          font-family: 'Fira Code', monospace; font-size: 12px;
          letter-spacing: 0.1em; color: inherit; text-decoration: none;
          writing-mode: vertical-rl;
          transition: transform 0.2s, color 0.2s;
          &:hover { color: #64ffda; transform: translateY(-3px); }
        }
      }
    }

    @media (max-width: 1080px) { .header { padding: 0 40px; } }
    @media (max-width: 768px) {
      .fixed-left-panel, .fixed-right-panel, .slide-nav-dots { display: none; }
      .header { padding: 0 20px; height: 70px; }
      .nav .nav-links { display: none; }
    }
  `]
})
export class MainComponent implements AfterViewInit {
  activeSlide = signal<number>(0);
  loaderDone = signal<boolean>(false);
  readonly currentYear = new Date().getFullYear();
  private isAnimating = false;
  readonly totalSlides = 6;

  slideNames = ['Hero', 'About', 'Projects', 'Experience', 'Services', 'Contact'];

  navLinks = [
    { label: 'About', slide: 1 },
    { label: 'Projects', slide: 2 },
    { label: 'Experience', slide: 3 },
    { label: 'Services', slide: 4 },
    { label: 'Contact', slide: 5 },
  ];

  private seo = inject(SeoService);
  private touchStartY = 0;
  private touchEndY = 0;
  private touchStartScrollable: HTMLElement | null = null;

  ngAfterViewInit() { this.updateSeo(); }

  @HostListener('window:touchstart', ['$event'])
  onTouchStart(e: TouchEvent) {
    this.touchStartY = e.changedTouches[0].screenY;
    this.touchStartScrollable = this.findScrollableAncestor(e.target as HTMLElement);
  }

  @HostListener('window:touchend', ['$event'])
  onTouchEnd(e: TouchEvent) {
    if (this.isAnimating) return;
    this.touchEndY = e.changedTouches[0].screenY;
    const diff = this.touchStartY - this.touchEndY;

    // If inside a scrollable panel, only slide-switch when content is at its boundary
    if (this.touchStartScrollable) {
      const { scrollTop, scrollHeight, clientHeight } = this.touchStartScrollable;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
      if ((diff > 50 && !atBottom) || (diff < -50 && !atTop)) return;
    }

    if (diff > 50) this.nextSlide();
    else if (diff < -50) this.prevSlide();
  }

  @HostListener('window:wheel', ['$event'])
  onWheel(e: WheelEvent) {
    if (this.isAnimating) return;

    // Check if the event is inside an internally-scrollable element
    const scrollable = this.findScrollableAncestor(e.target as HTMLElement);
    if (scrollable) {
      const { scrollTop, scrollHeight, clientHeight } = scrollable;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

      // Allow native scroll if not at boundary
      if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) return;
    }

    if (e.deltaY > 50) this.nextSlide();
    else if (e.deltaY < -50) this.prevSlide();
  }

  /** Walk up the DOM and return the first ancestor (below :host) that can actually scroll vertically */
  private findScrollableAncestor(el: HTMLElement | null): HTMLElement | null {
    while (el && el !== document.documentElement) {
      const style = window.getComputedStyle(el);
      const overflow = style.overflowY;
      const canScroll = overflow === 'auto' || overflow === 'scroll' || overflow === 'overlay';
      if (canScroll && el.scrollHeight > el.clientHeight) return el;
      el = el.parentElement;
    }
    return null;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (this.isAnimating) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') this.nextSlide();
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') this.prevSlide();
  }

  goToSlide(index: number) {
    if (this.isAnimating || this.activeSlide() === index) return;
    this.activeSlide.set(index);
    this.cooldown();
    this.updateSeo();
  }

  private nextSlide() {
    if (this.activeSlide() < this.totalSlides - 1) {
      this.activeSlide.update(v => v + 1);
      this.cooldown();
      this.updateSeo();
    }
  }

  private prevSlide() {
    if (this.activeSlide() > 0) {
      this.activeSlide.update(v => v - 1);
      this.cooldown();
      this.updateSeo();
    }
  }

  private cooldown() {
    this.isAnimating = true;
    setTimeout(() => { this.isAnimating = false; }, 700);
  }

  private updateSeo() {
    const seoData = [
      {
        title: 'Rabin Ramarajan | Senior Angular Developer',
        desc: 'Senior Angular Developer with 3.7+ years building scalable enterprise apps. Expert in Angular 13–20, RxJS, NgRx, Angular Signals. 40% faster apps.',
        url: ''
      },
      {
        title: 'About Me | Senior Angular Developer',
        desc: 'Learn about Rabin Ramarajan, a Senior Frontend Developer specializing in high-performance Angular applications, UI architecture, and enterprise solutions.',
        url: '#about'
      },
      {
        title: 'Projects & Case Studies | Angular Developer Portfolio',
        desc: 'Explore enterprise Angular projects, including the Fiji Immigration Portal and PRIMS Pension System. See how I improved performance by 40%.',
        url: '#projects'
      },
      {
        title: 'Work Experience | Frontend Engineer',
        desc: 'Details of my 3.7+ years of experience as an Angular Developer, building secure and performant government and enterprise platforms.',
        url: '#experience'
      },
      {
        title: 'Services | Angular Performance Optimization',
        desc: 'Freelance frontend services: Angular architecture, performance optimization (lazy loading, Signals), custom enterprise features, and Ionic mobile development.',
        url: '#services'
      },
      // {
      //   title: 'Testimonials | Client Reviews',
      //   desc: 'Read reviews and testimonials from clients and managers who have worked with Rabin Ramarajan on complex Angular applications.',
      //   url: '#testimonials'
      // },
      {
        title: 'Hire an Angular Developer | Contact',
        desc: 'Looking for a Senior Angular Developer? Contact Rabin Ramarajan for freelance or remote full-time opportunities. Available globally.',
        url: '#contact'
      }
    ];

    const current = seoData[this.activeSlide()];
    this.seo.updateMetadata({
      title: current.title,
      description: current.desc,
      url: current.url
    });
  }
}
