import { Component, Input, ElementRef, ViewChild, inject, OnChanges, OnInit, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GsapUtils } from '../../shared/animations/gsap.utils';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hero-container" #heroContainer>

      <!-- Stars -->
      <div class="stars-layer">
        @for (s of stars; track s.x) {
          <span class="star"
            [style.left.%]="s.x" [style.top.%]="s.y"
            [style.width.px]="s.size" [style.height.px]="s.size"
            [style.animation-duration.s]="s.dur"
            [style.animation-delay.s]="s.delay">
          </span>
        }
      </div>

      <div class="grid-overlay"></div>
      <div class="blob blob-teal"></div>
      <div class="blob blob-purple"></div>
      <div class="blob blob-blue"></div>

      <div class="hero-content">

        <!-- LEFT -->
        <section class="hero-text-section">
          <p class="stagger-item intro-hi">
            <span class="cursor-blink">_</span>&nbsp;Hi, my name is
          </p>
          <h1 class="stagger-item title-name glitch" data-text="Rabin Ramarajan.">
            Rabin Ramarajan.
          </h1>
          <h2 class="stagger-item title-role">Angular Developer & Frontend Specialist</h2>
          <p class="stagger-item bio-text">
            Frontend developer with <span class="highlight">3.7+ years</span> of experience building scalable, responsive, and maintainable enterprise web applications using Angular, TypeScript, RxJS, and Ionic. I hold a Bachelor’s degree in Information Technology, completed a professional Web Development course, and I am currently pursuing studies in Artificial Intelligence and Machine Learning through IIT Patna. I focus on creating high-performance user interfaces, clean architecture, and real-world business solutions for enterprise and government platforms.
          </p>

          <div class="stagger-item badge-row">
            @for (b of badges; track b) {
              <span class="badge">{{ b }}</span>
            }
          </div>

          <div class="stagger-item cta-container">
            <a class="btn-primary" href="javascript:void(0)" (click)="goToProjects()">
              <span class="btn-text">View My Projects</span>
              <span class="btn-arrow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </a>
            <a class="btn-secondary" href="/resume.pdf" target="_blank">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Resume
            </a>
            <a class="btn-tertiary" href="mailto:rabinr2607@gmail.com">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Let's Connect
            </a>
          </div>
        </section>

        <!-- RIGHT -->
        <section class="hero-visual-section">
          <div class="orbit-scene stagger-item">

            <div class="sonar-ring ring-1"></div>
            <div class="sonar-ring ring-2"></div>
            <div class="sonar-ring ring-3"></div>
            <div class="orbit-track"></div>
            <div class="radar-sweep"></div>

            <div class="avatar-wrap">
              <div class="avatar-halo halo-1"></div>
              <div class="avatar-halo halo-2"></div>
              <div class="avatar-border-spin"></div>
              <img src="/image/hero_image.png" alt="Hacker Profile" class="hacker-img">
              <div class="scan-line"></div>
            </div>

            @for (icon of techIcons; track icon.label) {
              <div class="tech-icon" [style.--i]="icon.index" [attr.data-label]="icon.label">
                <div class="icon-glow"></div>
                <img [src]="icon.src" [alt]="icon.label">
                <span class="tooltip">{{ icon.label }}</span>
              </div>
            }

          </div>
        </section>

      </div>
    </div>
  `,
  styles: [`
    .hero-container {
      width: 100vw; height: 100vh;
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden;
      background: #050d1a;
      padding: 80px 10vw 0;
      box-sizing: border-box;
    }

    /* Stars */
    .stars-layer { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
    .star { position: absolute; background: #fff; border-radius: 50%; opacity: 0; animation: twinkle var(--dur, 4s) ease-in-out infinite var(--delay, 0s); }
    @keyframes twinkle { 0%,100%{opacity:0;transform:scale(0.8)} 50%{opacity:0.7;transform:scale(1.2)} }

    /* Grid */
    .grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(100,255,218,0.025) 1px,transparent 1px), linear-gradient(90deg,rgba(100,255,218,0.025) 1px,transparent 1px); background-size: 60px 60px; pointer-events: none; z-index: 0; }

    /* Blobs */
    .blob { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.12; pointer-events: none; z-index: 1; }
    .blob-teal   { width: 700px; height: 700px; background: radial-gradient(circle,#64ffda,transparent 70%); top: -200px; right: 0; animation: blobMove 16s ease-in-out infinite alternate; }
    .blob-purple { width: 500px; height: 500px; background: radial-gradient(circle,#7b61ff,transparent 70%); bottom: -100px; left: -100px; animation: blobMove 22s ease-in-out infinite alternate-reverse; }
    .blob-blue   { width: 400px; height: 400px; background: radial-gradient(circle,#3880ff,transparent 70%); top: 50%; right: 25%; animation: blobMove 19s ease-in-out infinite alternate; }
    @keyframes blobMove { from{transform:translate(0,0) scale(1)} to{transform:translate(50px,40px) scale(1.15)} }

    /* Layout */
    .hero-content {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%; max-width: 1240px; z-index: 10;
      gap: 20px; position: relative;
    }

    /* Left */
    .hero-text-section { flex: 1; max-width: 680px; z-index: 2; margin-top: -30px; }

    .cursor-blink { color: #64ffda; animation: blink 1s step-end infinite; }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

    .intro-hi { color: #64ffda; font-family: 'Fira Code', monospace; font-size: clamp(12px,1.5vw,15px); margin-bottom: 12px; letter-spacing: 0.08em; display: flex; align-items: center; gap: 4px; }

    .title-name {
      color: #e6f1ff; font-family: 'Inter', sans-serif;
      font-size: clamp(28px, 4.5vw, 56px); font-weight: 800;
      line-height: 1.05; margin: 0; letter-spacing: -1px; position: relative;
    }
    .glitch { animation: glitch 6s infinite; }
    .glitch::before, .glitch::after { content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: transparent; }
    .glitch::before { color: #ff4d6d; clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%); animation: glitchSlice1 6s infinite; }
    .glitch::after  { color: #00f0ff; clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%); animation: glitchSlice2 6s infinite; }
    @keyframes glitch { 0%,90%,100%{transform:none} 91%{transform:skewX(-1deg)} 93%{transform:skewX(1deg)} }
    @keyframes glitchSlice1 { 0%,90%,100%{transform:none;opacity:0} 91%{transform:translateX(-4px);opacity:0.7} 93%{transform:translateX(4px);opacity:0.7} 95%{opacity:0} }
    @keyframes glitchSlice2 { 0%,90%,100%{transform:none;opacity:0} 92%{transform:translateX(4px);opacity:0.7} 94%{transform:translateX(-4px);opacity:0.7} 96%{opacity:0} }

    .title-role { color: #3d4f6e; font-family: 'Inter', sans-serif; font-size: clamp(16px, 2.5vw, 30px); font-weight: 700; line-height: 1.2; margin: 6px 0 0; letter-spacing: -0.5px; }

    .bio-text { color: #8892b0; font-family: 'Inter', sans-serif; font-size: clamp(12px, 1vw, 15px); line-height: 1.6; margin-top: 14px; max-width: 640px; }
    .highlight { color: #64ffda; font-weight: 500; border-bottom: 1px dashed rgba(100,255,218,0.4); }

    .badge-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
    .badge { font-family: 'Fira Code', monospace; font-size: 10px; color: #64ffda; background: rgba(100,255,218,0.06); border: 1px solid rgba(100,255,218,0.2); border-radius: 20px; padding: 3px 10px; transition: all 0.3s; cursor: default; }
    .badge:hover { background: rgba(100,255,218,0.15); border-color: #64ffda; box-shadow: 0 0 12px rgba(100,255,218,0.2); transform: translateY(-2px); }

    .cta-container { margin-top: 24px; display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }

    .btn-primary { display: inline-flex; align-items: center; gap: 0; color: #050d1a; background: #64ffda; border: 1px solid #64ffda; border-radius: 6px; font-family: 'Fira Code', monospace; font-size: 12.5px; font-weight: 600; text-decoration: none; overflow: hidden; position: relative; transition: box-shadow 0.3s, transform 0.3s; }
    .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(100,255,218,0.35); }
    .btn-text { padding: 11px 18px 11px 20px; }
    .btn-arrow { display: inline-flex; align-items: center; justify-content: center; padding: 11px 14px; background: rgba(0,0,0,0.1); border-left: 1px solid rgba(5,13,26,0.15); transition: background 0.3s; }
    .btn-primary:hover .btn-arrow { background: rgba(0,0,0,0.2); }
    .btn-primary:hover .btn-arrow svg { transform: translateX(4px); }
    .btn-arrow svg { stroke-width: 2.5px; transition: transform 0.3s; }

    .btn-secondary { display: inline-flex; align-items: center; gap: 8px; color: #64ffda; background: rgba(100,255,218,0.03); border: 1px solid rgba(100,255,218,0.3); border-radius: 6px; font-family: 'Fira Code', monospace; font-size: 12.5px; text-decoration: none; padding: 11px 20px; transition: all 0.3s; position: relative; }
    .btn-secondary:hover { background: rgba(100,255,218,0.1); border-color: #64ffda; transform: translateY(-3px); box-shadow: 0 8px 20px rgba(100,255,218,0.15); }

    .btn-tertiary { display: inline-flex; align-items: center; gap: 8px; color: #ccd6f6; font-family: 'Fira Code', monospace; font-size: 12.5px; text-decoration: none; padding: 11px 8px; transition: color 0.3s, transform 0.3s; position: relative; }
    .btn-tertiary::after { content: ''; position: absolute; bottom: 8px; left: 10px; right: 10px; height: 1px; background: #64ffda; transform: scaleX(0); transform-origin: right; transition: transform 0.3s ease-out; }
    .btn-tertiary:hover { color: #64ffda; transform: translateY(-2px); }
    .btn-tertiary:hover::after { transform: scaleX(1); transform-origin: left; }
    .btn-tertiary svg { color: #8892b0; transition: color 0.3s; }
    .btn-tertiary:hover svg { color: #64ffda; }

    /* RIGHT — Orbit */
    .hero-visual-section { flex: 0 0 auto; display: flex; justify-content: center; align-items: center; position: relative; }

    .orbit-scene { position: relative; width: 380px; height: 380px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }

    .sonar-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(100,255,218,0.5); animation: sonarPing 4s ease-out infinite; pointer-events: none; }
    .ring-1 { width: 140px; height: 140px; animation-delay: 0s; }
    .ring-2 { width: 140px; height: 140px; animation-delay: 1.3s; }
    .ring-3 { width: 140px; height: 140px; animation-delay: 2.6s; }
    @keyframes sonarPing { 0%{transform:scale(0.5);opacity:0.8} 100%{transform:scale(2.7);opacity:0} }

    .orbit-track { position: absolute; width: 360px; height: 360px; border-radius: 50%; border: 1px solid transparent; background: linear-gradient(#050d1a, #050d1a) padding-box, conic-gradient(rgba(100,255,218,0.6) 0deg, rgba(100,255,218,0.0) 120deg, rgba(100,255,218,0.0) 240deg, rgba(100,255,218,0.6) 360deg) border-box; animation: trackSpin 12s linear infinite; pointer-events: none; }
    @keyframes trackSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

    .radar-sweep { position: absolute; width: 360px; height: 360px; border-radius: 50%; overflow: hidden; pointer-events: none; z-index: 2; }
    .radar-sweep::before { content: ''; position: absolute; top: 50%; left: 50%; width: 50%; height: 50%; transform-origin: 0% 100%; background: conic-gradient(from 0deg, rgba(100,255,218,0) 0deg, rgba(100,255,218,0.18) 40deg, rgba(100,255,218,0) 60deg); animation: radarSpin 4s linear infinite; }
    @keyframes radarSpin { from{transform:rotate(-90deg)} to{transform:rotate(270deg)} }

    .avatar-wrap { position: relative; width: 220px; height: 220px; z-index: 4; flex-shrink: 0; }
    .avatar-halo { position: absolute; inset: -8px; border-radius: 50%; opacity: 0.5; pointer-events: none; }
    .halo-1 { background: radial-gradient(circle, rgba(100,255,218,0.25) 0%, transparent 70%); animation: haloPulse 3s ease-in-out infinite; }
    .halo-2 { background: radial-gradient(circle, rgba(123,97,255,0.2) 0%, transparent 70%); animation: haloPulse 3s ease-in-out infinite 1.5s; }
    @keyframes haloPulse { 0%,100%{transform:scale(0.9);opacity:0.3} 50%{transform:scale(1.15);opacity:0.6} }
    .avatar-border-spin { position: absolute; inset: -5px; border-radius: 50%; background: conic-gradient(#64ffda 0deg, #7b61ff 90deg, #3880ff 180deg, #64ffda 360deg); animation: borderSpin 5s linear infinite; z-index: 0; }
    @keyframes borderSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .hacker-img { position: relative; width: 100%; height: 100%; object-fit: cover; border-radius: 50%; z-index: 2; border: 5px solid #050d1a; box-shadow: 0 0 40px rgba(100,255,218,0.1), 0 30px 60px rgba(0,0,0,0.7); }
    .scan-line { position: absolute; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(100,255,218,0.7), transparent); z-index: 5; border-radius: 50%; animation: scanMove 3s linear infinite; box-shadow: 0 0 8px rgba(100,255,218,0.5); }
    @keyframes scanMove { 0%{top:0%;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }

    /* Tech Icons — CSS trig orbit */
    .tech-icon {
      --r: 178px; --size: 50px; --half: calc(var(--size) / 2);
      --angle: calc(var(--i, 0) * 45deg - 90deg);
      position: absolute;
      width: var(--size); height: var(--size); border-radius: 50%;
      left: calc(50% + var(--r) * cos(var(--angle)) - var(--half));
      top:  calc(50% + var(--r) * sin(var(--angle)) - var(--half));
      background: rgba(5, 15, 35, 0.8); backdrop-filter: blur(12px);
      border: 1px solid rgba(100,255,218,0.15);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
      display: flex; justify-content: center; align-items: center;
      cursor: pointer; z-index: 5;
      opacity: 0; transform: scale(0) rotate(-20deg);
      animation: iconEntrance 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards, iconFloat 5s ease-in-out infinite;
      animation-delay: calc(var(--i, 0) * 0.12s), calc(var(--i, 0) * 0.65s + 1s);
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.3s;

      img { width: 30px; height: 30px; object-fit: contain; pointer-events: none; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5)); transition: transform 0.3s; position: relative; z-index: 2; }

      .icon-glow { position: absolute; inset: -1px; border-radius: 50%; opacity: 0; animation: iconGlowPulse 3s ease-in-out infinite; animation-delay: calc(var(--i, 0) * 0.4s); }

      .tooltip { position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%) translateY(8px); background: rgba(5,15,35,0.95); color: #64ffda; font-family: 'Fira Code', monospace; font-size: 10px; letter-spacing: 0.06em; padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(100,255,218,0.25); white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.2s, transform 0.2s; z-index: 10; }
      .tooltip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 4px solid transparent; border-top-color: rgba(100,255,218,0.25); }

      &:hover { border-color: rgba(100,255,218,0.6); box-shadow: 0 0 24px rgba(100,255,218,0.35), 0 8px 32px rgba(0,0,0,0.5); img { transform: scale(1.15) rotate(8deg); } .tooltip { opacity: 1; transform: translateX(-50%) translateY(0); } }
    }
    @keyframes iconEntrance { from{opacity:0;transform:scale(0) rotate(-20deg)} to{opacity:1;transform:scale(1) rotate(0deg)} }
    @keyframes iconFloat { 0%,100%{translate:0 0px} 50%{translate:0 -12px} }
    @keyframes iconGlowPulse { 0%,100%{opacity:0} 50%{opacity:0.35} }

    /* ═══ RESPONSIVE ═══ */
    @media (max-width: 1400px) { .hero-container { padding: 90px 100px 0; } }
    @media (max-width: 1200px) { .hero-container { padding: 90px 80px 0; } .orbit-scene { width: 380px; height: 380px; } .orbit-track,.radar-sweep { width: 340px; height: 340px; } .tech-icon { --r: 168px; --size: 50px; img { width: 26px; height: 26px; } } .avatar-wrap { width: 210px; height: 210px; } }
    @media (max-width: 1024px) {
      .hero-container { padding: 80px 50px 0; }
      .hero-content { flex-direction: column; text-align: center; gap: 20px; }
      .hero-text-section { max-width: 100%; text-align: center; }
      .bio-text { margin: 14px auto 0; }
      .badge-row { justify-content: center; }
      .intro-hi { justify-content: center; }
      .cta-container { display: flex; justify-content: center; }
      .orbit-scene { width: 340px; height: 340px; }
      .orbit-track,.radar-sweep { width: 300px; height: 300px; }
      .tech-icon { --r: 148px; --size: 46px; img { width: 24px; height: 24px; } }
      .avatar-wrap { width: 190px; height: 190px; }
    }
    @media (max-width: 768px) {
      .hero-container { padding: 70px 20px 0; }
      .orbit-scene { width: 280px; height: 280px; }
      .orbit-track,.radar-sweep { width: 250px; height: 250px; }
      .tech-icon { --r: 122px; --size: 40px; img { width: 20px; height: 20px; } }
      .avatar-wrap { width: 160px; height: 160px; }
      .title-name { font-size: clamp(28px, 8vw, 44px); }
      .title-role { font-size: clamp(18px, 5vw, 30px); }
    }
    @media (max-width: 480px) {
      .orbit-scene { width: 240px; height: 240px; }
      .orbit-track,.radar-sweep { width: 215px; height: 215px; }
      .tech-icon { --r: 104px; --size: 36px; img { width: 18px; height: 18px; } }
      .avatar-wrap { width: 140px; height: 140px; }
    }
  `]
})
export class HeroComponent implements OnChanges, OnInit {
  @Input() isActive = false;
  @ViewChild('heroContainer') heroContainer!: ElementRef;
  private platformId = inject(PLATFORM_ID);
  private animated = false;

  stars: { x: number; y: number; size: number; dur: number; delay: number }[] = [];
  badges = ['Angular 13–20', 'TypeScript', 'RxJS', 'NgRx', 'Angular Signals', 'Ionic', 'REST API', 'Performance Optimization'];

  techIcons = [
    { index: 0, label: 'Ionic', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ionic/ionic-original.svg' },
    { index: 1, label: 'SCSS', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sass/sass-original.svg' },
    { index: 2, label: 'JavaScript', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
    { index: 3, label: 'TypeScript', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg' },
    { index: 4, label: 'Angular', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
    { index: 5, label: 'NgRx', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ngrx/ngrx-original.svg' },
    { index: 6, label: 'RxJS', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rxjs/rxjs-original.svg' },
    { index: 7, label: 'HTML5', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
  ];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.stars = Array.from({ length: 55 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        dur: Math.random() * 4 + 3,
        delay: Math.random() * 6,
      }));
    }
  }

  ngOnChanges() {
    if (this.isActive && !this.animated) {
      if (!isPlatformBrowser(this.platformId)) return;
      setTimeout(() => {
        if (!this.heroContainer) return;
        const els = this.heroContainer.nativeElement.querySelectorAll('.stagger-item');
        GsapUtils.staggerTextUp(els);
        this.animated = true;
      }, 50);
    }
  }

  goToProjects() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
      setTimeout(() => window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 })), 800);
    }
  }
}
