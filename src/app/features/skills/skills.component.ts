import { Component, Input, ViewChild, ElementRef, inject, OnChanges, OnInit, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GsapUtils } from '../../shared/animations/gsap.utils';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="about-container" #aboutContainer>
      <div class="about-bg">
        <div class="bg-dots"></div>
        <div class="bg-glow gl"></div>
        <div class="bg-glow gr"></div>
      </div>

      <div class="about-scroll">
        <div class="about-inner">

          <div class="section-label stagger-item">
            <span class="lnum">01.</span>
            <span class="ltxt">About Me</span>
            <div class="lline"></div>
          </div>

          <div class="about-grid">

            <!-- LEFT -->
            <div class="about-left">
              <h2 class="about-heading stagger-item">
                Building frontends that are<br>
                <span class="accent">scalable, fast, and user-focused.</span>
              </h2>

              <div class="bio-block stagger-item">
                <p>
                  Hi! I'm <strong class="hi-name">Rabin Ramarajan</strong>, a Frontend Developer
                  specializing in <span class="tp">Angular</span>,
                  <span class="tp">TypeScript</span>, <span class="tp">RxJS</span>, <span class="tp">NgRx</span>,
                  and <span class="tp">Angular Signals</span>.
                  I build scalable, maintainable, and responsive enterprise web applications for government and business platforms.
                </p>
                <p>
                  I have <strong class="hi-name">3.7+ years</strong> of hands-on experience in frontend development. I hold a Bachelor’s degree in Information Technology, completed a professional Web Development course, and I am currently studying Artificial Intelligence and Machine Learning through IIT Patna. My focus is on creating clean UI architecture, smooth user experiences, and high-performance applications.
                </p>
                <p>
                  I enjoy turning complex requirements into practical digital solutions. From multi-step workflows and dashboard systems to API integrations and responsive layouts, I aim to deliver products that are reliable, efficient, and easy to scale.
                </p>
              </div>

              <div class="stats-row stagger-item">
                @for (s of stats; track s.label) {
                  <div class="stat-card">
                    <span class="stat-num">{{ s.display }}</span>
                    <span class="stat-label">{{ s.label }}</span>
                  </div>
                }
              </div>

              <div class="about-ctas stagger-item">
                <a class="btn-outline" href="#" target="_blank">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Download CV
                </a>
                <a class="btn-ghost" href="https://github.com" target="_blank">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                  GitHub Profile
                </a>
              </div>
            </div>

            <!-- RIGHT -->
            <div class="about-right">
              <!-- Avatar card -->
              <div class="avatar-card stagger-item">
                <div class="ac-inner">
                  <div class="ac-ring-wrap">
                    <div class="ac-spin-ring"></div>
                    <img src="/image/hero_image.png" alt="Profile" class="ac-img">
                  </div>
                  <div class="ac-info">
                    <p class="ac-name">Rabin Ramarajan</p>
                    <p class="ac-role">Frontend Developer</p>
                    <div class="ac-avail">
                      <span class="avail-dot"></span> Available for work
                    </div>
                  </div>
                </div>
              </div>

              <!-- Skills grid -->
              <div class="skills-grid stagger-item">
                @for (sk of skills; track sk.name; let i = $index) {
                  <div class="skill-chip" [style.animation-delay.ms]="i * 60 + 400">
                    <img [src]="sk.icon" [alt]="sk.name" class="chip-icon">
                    <span class="chip-label">{{ sk.name }}</span>
                    <div class="chip-bar">
                      <div class="chip-fill" [attr.data-w]="sk.level" style="width:0%"></div>
                    </div>
                  </div>
                }
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .about-container {
      width: 100vw; height: 100vh;
      background: #060e1f;
      display: flex; flex-direction: column;
      position: relative; overflow: hidden;
      padding-top: 75px; box-sizing: border-box;
    }
    .about-bg { position: absolute; inset: 0; pointer-events: none; }
    .bg-dots { position: absolute; inset: 0; background-image: radial-gradient(rgba(100,255,218,0.08) 1px, transparent 1px); background-size: 32px 32px; }
    .bg-glow { position: absolute; width: 500px; height: 500px; border-radius: 50%; filter: blur(120px); opacity: 0.08; }
    .gl { background: #64ffda; top: -100px; left: -100px; animation: gp 8s ease-in-out infinite; }
    .gr { background: #7b61ff; bottom: -100px; right: 0; animation: gp 10s ease-in-out infinite 2s; }
    @keyframes gp { 0%,100%{transform:scale(1);opacity:0.07} 50%{transform:scale(1.2);opacity:0.13} }

    .about-scroll { flex: 1; overflow-y: auto; display: flex; align-items: center; justify-content: center; padding: 2vh 10vw; box-sizing: border-box; }
    .about-inner { width: 100%; max-width: 1240px; z-index: 2; display: flex; flex-direction: column; gap: 16px; margin-top: -30px; }

    /* Label */
    .section-label { display: flex; align-items: center; gap: 10px; }
    .lnum { color: #64ffda; font-family: 'Fira Code', monospace; font-size: 14px; }
    .ltxt { color: #ccd6f6; font-family: 'Inter', sans-serif; font-size: clamp(18px, 2vw, 24px); font-weight: 700; white-space: nowrap; }
    .lline { flex: 1; max-width: 250px; height: 1px; background: linear-gradient(90deg, #233554, transparent); }

    /* Grid */
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start; }

    /* Left */
    .about-left { display: flex; flex-direction: column; gap: 14px; }
    .about-heading { font-family: 'Inter', sans-serif; font-size: clamp(16px, 2.2vw, 26px); font-weight: 800; color: #e6f1ff; line-height: 1.25; margin: 0; .accent { color: #64ffda; } }
    .bio-block p { color: #8892b0; font-family: 'Inter', sans-serif; font-size: clamp(12px, 1.05vw, 15px); line-height: 1.6; margin: 0 0 10px; &:last-child { margin: 0; } }
    .hi-name { color: #ccd6f6; font-weight: 700; }
    .tp { display: inline-block; background: rgba(100,255,218,0.07); border: 1px solid rgba(100,255,218,0.2); color: #64ffda; font-family: 'Fira Code', monospace; font-size: 10.5px; padding: 1px 6px; border-radius: 3px; vertical-align: middle; }

    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 4px; }
    .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(100,255,218,0.1); border-radius: 8px; padding: 12px 6px; text-align: center; transition: all 0.3s; cursor: default; &:hover { border-color: rgba(100,255,218,0.35); background: rgba(100,255,218,0.05); transform: translateY(-3px); box-shadow: 0 6px 20px rgba(100,255,218,0.08); } }
    .stat-num { display: block; font-family: 'Inter', sans-serif; font-size: clamp(14px, 1.4vw, 20px); font-weight: 800; color: #64ffda; line-height: 1; margin-bottom: 3px; }
    .stat-label { display: block; font-family: 'Fira Code', monospace; font-size: 8.5px; color: #495670; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.06em; }

    .about-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 6px; }
    .btn-outline, .btn-ghost { display: inline-flex; align-items: center; gap: 6px; font-family: 'Fira Code', monospace; font-size: 12px; border-radius: 6px; padding: 9px 16px; text-decoration: none; transition: all 0.3s; }
    .btn-outline { color: #64ffda; border: 1px solid #64ffda; background: transparent; &:hover { background: rgba(100,255,218,0.1); transform: translateY(-2px); box-shadow: 0 0 16px rgba(100,255,218,0.2); } }
    .btn-ghost { color: #8892b0; border: 1px solid #233554; background: rgba(255,255,255,0.02); &:hover { color: #ccd6f6; border-color: #495670; transform: translateY(-2px); } }

    /* Right */
    .about-right { display: flex; flex-direction: column; gap: 14px; }

    /* Avatar card */
    .avatar-card { background: linear-gradient(135deg, #0d1b2e, #112240); border: 1px solid rgba(100,255,218,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.4); transition: border-color 0.3s; &:hover { border-color: rgba(100,255,218,0.3); } }
    .ac-inner { display: flex; align-items: center; padding: 14px 16px; gap: 14px; }
    .ac-ring-wrap { position: relative; width: 56px; height: 56px; flex-shrink: 0; }
    .ac-spin-ring { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(#64ffda 0deg, #7b61ff 120deg, #3880ff 240deg, #64ffda 360deg); animation: acSpin 6s linear infinite; }
    @keyframes acSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .ac-img { position: absolute; inset: 4px; border-radius: 50%; object-fit: cover; border: 2px solid #0d1b2e; z-index: 2; }
    .ac-info { flex: 1; }
    .ac-name { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700; color: #e6f1ff; margin: 0 0 2px; }
    .ac-role { font-family: 'Fira Code', monospace; font-size: 10.5px; color: #495670; margin: 0 0 8px; }
    .ac-avail { display: flex; align-items: center; gap: 6px; font-family: 'Fira Code', monospace; font-size: 10px; color: #64ffda; }
    .avail-dot { width: 6px; height: 6px; border-radius: 50%; background: #64ffda; animation: dp 2s ease-in-out infinite; @keyframes dp { 0%,100%{box-shadow:0 0 3px #64ffda} 50%{box-shadow:0 0 10px #64ffda, 0 0 16px rgba(100,255,218,0.4)} } }

    /* Skills */
    .skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .skill-chip { background: rgba(255,255,255,0.025); border: 1px solid rgba(100,255,218,0.08); border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; gap: 5px; animation: chipIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; transition: all 0.3s; cursor: default; &:hover { border-color: rgba(100,255,218,0.3); background: rgba(100,255,218,0.04); transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.3); } }
    @keyframes chipIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
    .chip-icon { width: 20px; height: 20px; object-fit: contain; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.5)); }
    .chip-label { font-family: 'Fira Code', monospace; font-size: 10.5px; color: #8892b0; }
    .chip-bar { height: 2px; background: rgba(255,255,255,0.06); border-radius: 1px; overflow: hidden; }
    .chip-fill { height: 100%; background: linear-gradient(90deg, #64ffda, #7b61ff); border-radius: 1px; transition: width 1.2s cubic-bezier(0.165,0.84,0.44,1); }

    .stagger-item { opacity: 0; transform: translateY(24px); }

    /* Responsive */
    @media (max-width: 1400px) { .about-scroll { padding: 16px 100px; } }
    @media (max-width: 1200px) { .about-scroll { padding: 16px 80px; } }
    @media (max-width: 1024px) {
      .about-scroll { padding: 16px 50px; }
      .about-grid { grid-template-columns: 1fr; gap: 24px; }
      .about-right { order: -1; }
      .skills-grid { grid-template-columns: repeat(4, 1fr); }
      .stats-row { grid-template-columns: repeat(4, 1fr); }
    }
    @media (max-width: 768px) {
      .about-container { padding-top: 70px; }
      .about-scroll { padding: 12px 20px; align-items: flex-start; }
      .skills-grid { grid-template-columns: repeat(2, 1fr); }
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .about-ctas { flex-direction: column; }
    }
    @media (max-width: 480px) {
      .skills-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class SkillsComponent implements OnChanges, OnInit {
  @Input() isActive = false;
  @ViewChild('aboutContainer') container!: ElementRef;
  private platformId = inject(PLATFORM_ID);
  private animated = false;

  stats = [
    { display: '3.7+',       label: 'Years Experience'   },
    { display: '10+',        label: 'Projects Delivered' },
    { display: 'Enterprise', label: 'Product Focus'      },
    { display: 'Open',       label: 'To Opportunities'   },
  ];

  skills = [
    { name: 'Angular',    level: 95, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
    { name: 'TypeScript', level: 90, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg' },
    { name: 'RxJS',       level: 85, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rxjs/rxjs-original.svg' },
    { name: 'NgRx',       level: 80, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ngrx/ngrx-original.svg' },
    { name: 'Signals',    level: 90, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
    { name: 'JavaScript', level: 88, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
    { name: 'HTML5',      level: 95, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
    { name: 'SCSS',       level: 93, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sass/sass-original.svg' },
    { name: 'Tailwind',   level: 85, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg' },
    { name: 'Ionic',      level: 80, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ionic/ionic-original.svg' },
    { name: 'REST API',   level: 85, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
    { name: 'Git',        level: 85, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg' },
  ];

  ngOnInit() {}

  ngOnChanges() {
    if (this.isActive && !this.animated) {
      if (!isPlatformBrowser(this.platformId)) return;
      setTimeout(() => {
        if (!this.container) return;
        const staggerEls = this.container.nativeElement.querySelectorAll('.stagger-item');
        GsapUtils.staggerTextUp(staggerEls);
        setTimeout(() => {
          const fills = this.container.nativeElement.querySelectorAll('.chip-fill');
          fills.forEach((f: HTMLElement) => { f.style.width = (f.getAttribute('data-w') || '0') + '%'; });
        }, 600);
        this.animated = true;
      }, 80);
    }
  }
}
