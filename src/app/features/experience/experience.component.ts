import { Component, Input, ViewChild, ElementRef, inject, OnChanges, OnInit, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GsapUtils } from '../../shared/animations/gsap.utils';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="exp-container" #expContainer>
      <div class="exp-bg"><div class="dots"></div><div class="eb1"></div><div class="eb2"></div></div>

      <div class="exp-scroll">
        <div class="exp-inner">

          <div class="section-label stagger-item">
            <span class="en">03.</span><span class="et">Experience</span><div class="el"></div>
          </div>
          <h2 class="exp-main-heading stagger-item">Delivering enterprise-grade frontend solutions with Angular.</h2>

          <div class="exp-layout">

            <!-- Timeline selector -->
            <div class="timeline-col stagger-item">
              @for (exp of experiences; track exp.company; let i = $index) {
                <div class="t-item" [class.active]="activeExp === i" (click)="activeExp = i">
                  <div class="t-dot" [class.active]="activeExp === i"><div class="dot-inner"></div></div>
                  <div class="t-meta">
                    <span class="t-co">{{ exp.company }}</span>
                    <span class="t-per">{{ exp.period }}</span>
                  </div>
                </div>
              }
              <div class="track-line"></div>
            </div>

            <!-- Detail -->
            <div class="detail-panel stagger-item">
              <div class="detail-header">
                <div class="d-logo">{{ experiences[activeExp].icon }}</div>
                <div>
                  <h3 class="d-role">
                    {{ experiences[activeExp].role }}
                    <span class="at">@ {{ experiences[activeExp].company }}</span>
                  </h3>
                  <div class="d-meta">
                    <span class="d-period">⏱ {{ experiences[activeExp].period }}</span>
                    <span class="d-tag">{{ experiences[activeExp].type }}</span>
                    <span class="d-tag">{{ experiences[activeExp].location }}</span>
                  </div>
                </div>
              </div>

              <p class="d-desc">{{ experiences[activeExp].description }}</p>

              <div class="exp-metrics">
                @for (m of experiences[activeExp].metrics; track m.label) {
                  <div class="em"><span class="emv">{{ m.value }}</span><span class="eml">{{ m.label }}</span></div>
                }
              </div>

              <h4 class="ach-heading">Key Achievements</h4>
              <ul class="ach-list">
                @for (a of experiences[activeExp].achievements; track a) {
                  <li><span class="ab">▹</span>{{ a }}</li>
                }
              </ul>

              <div class="exp-tech">
                @for (t of experiences[activeExp].tech; track t) {
                  <span class="tchip">{{ t }}</span>
                }
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .exp-container { width:100vw; height:100vh; background:#060d1e; display:flex; flex-direction:column; position:relative; overflow:hidden; padding-top:60px; box-sizing:border-box; }
    .exp-bg { position:absolute; inset:0; pointer-events:none; }
    .dots { position:absolute; inset:0; background-image:radial-gradient(rgba(100,255,218,0.07) 1px,transparent 1px); background-size:30px 30px; }
    .eb1 { position:absolute; width:500px; height:500px; background:rgba(100,255,218,0.06); border-radius:50%; filter:blur(100px); top:-100px; left:-100px; animation:ebp 12s ease-in-out infinite alternate; }
    .eb2 { position:absolute; width:400px; height:400px; background:rgba(123,97,255,0.06); border-radius:50%; filter:blur(100px); bottom:-100px; right:0; animation:ebp 16s ease-in-out infinite alternate-reverse; }
    @keyframes ebp { from{transform:scale(1)} to{transform:scale(1.3)} }

    .exp-scroll { flex:1; overflow-y:auto; display:flex; align-items:center; justify-content:center; padding:2vh 10vw; box-sizing:border-box; }
    .exp-inner { width:100%; max-width:1200px; z-index:2; display:flex; flex-direction:column; gap:8px; margin-top:0; }

    .section-label { display:flex; align-items:center; gap:10px; margin-bottom: 10px; }
    .en { color:#64ffda; font-family:'Fira Code',monospace; font-size:14px; }
    .et { color:#ccd6f6; font-family:'Inter',sans-serif; font-size:clamp(18px,2.2vw,24px); font-weight:700; z-index: 5; }
    .el { flex:1; max-width:250px; height:1px; background:linear-gradient(90deg,#233554,transparent); }
    .exp-main-heading { font-family:'Inter',sans-serif; font-size:clamp(15px,2vw,22px); font-weight:800; color:#e6f1ff; line-height:1.2; margin: 8px 0 14px; position:relative; z-index: 10;}

    .exp-layout { display:grid; grid-template-columns:250px 1fr; gap:26px; align-items:start; }

    /* Timeline */
    .timeline-col { position:relative; display:flex; flex-direction:column; gap:6px; padding-left:0; margin-top:2px; }
    .track-line { position:absolute; left:23px; top:24px; bottom:24px; width:2px; transform:translateX(-50%); background:linear-gradient(to bottom,#64ffda,#7b61ff,transparent); z-index:0; border-radius:2px; }
    
    .t-item { display:flex; align-items:flex-start; gap:14px; padding:12px 14px; cursor:pointer; border-radius:10px; transition:all 0.3s ease; position:relative; z-index:1; border:1px solid transparent; 
      &:hover { background:rgba(255,255,255,0.02); border-color:rgba(255,255,255,0.04); } 
      &.active { background:rgba(100,255,218,0.06); border-color:rgba(100,255,218,0.15); box-shadow: 0 10px 30px rgba(0,0,0,0.15); } 
    }
    
    .t-dot { width:16px; height:16px; border-radius:50%; border:2px solid #233554; background:#060d1e; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:2px; transition:border-color 0.3s, transform 0.3s; position:relative; z-index:2; 
      &.active { border-color:#64ffda; transform:scale(1.1); box-shadow:0 0 12px rgba(100,255,218,0.2); } 
      .dot-inner { width:6px; height:6px; border-radius:50%; background:transparent; transition:background 0.3s; } 
      &.active .dot-inner { background:#64ffda; animation:dg 2s ease-in-out infinite; } 
    }
    @keyframes dg { 0%,100%{box-shadow:0 0 0 2px rgba(100,255,218,0.2)} 50%{box-shadow:0 0 0 5px rgba(100,255,218,0.1)} }
    
    .t-meta { display:flex; flex-direction:column; gap:3px; margin-top: 2px; }
    .t-co { font-family:'Inter',sans-serif; font-size:13.5px; font-weight:700; color:#8892b0; transition:color 0.2s; line-height:1.1; }
    .t-item.active .t-co,.t-item:hover .t-co { color:#64ffda; }
    .t-per { font-family:'Fira Code',monospace; font-size:9.5px; color:#495670; }

    /* Detail */
    .detail-panel { background:rgba(255,255,255,0.025); border:1px solid rgba(100,255,218,0.08); border-radius:12px; padding:14px 18px; transition:border-color 0.3s; &:hover { border-color:rgba(100,255,218,0.15); } }
    .detail-header { display:flex; gap:12px; align-items:flex-start; margin-bottom:10px; }
    .d-logo { font-size:20px; width:38px; height:38px; border-radius:10px; background:rgba(100,255,218,0.06); border:1px solid rgba(100,255,218,0.1); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .d-role { font-family:'Inter',sans-serif; font-size:clamp(14px,1.3vw,16px); font-weight:700; color:#e6f1ff; margin:0 0 4px; line-height:1.2; .at { color:#64ffda; font-weight:400; } }
    .d-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .d-period { font-family:'Fira Code',monospace; font-size:10px; color:#64ffda; }
    .d-tag { font-family:'Fira Code',monospace; font-size:9px; color:#495670; background:rgba(255,255,255,0.04); border:1px solid #1e2d45; border-radius:20px; padding:2px 8px; }
    .d-desc { font-family:'Inter',sans-serif; font-size:clamp(11px,1vw,12.5px); color:#8892b0; line-height:1.5; margin:0 0 10px; }

    .exp-metrics { display:flex; gap:8px; margin-bottom:10px; padding:8px 10px; background:rgba(100,255,218,0.03); border-radius:8px; border:1px solid rgba(100,255,218,0.06); flex-wrap:wrap; }
    .em { text-align:center; flex:1; min-width:70px; }
    .emv { display:block; font-family:'Inter',sans-serif; font-size:clamp(12.5px,1.2vw,16px); font-weight:800; color:#64ffda; margin-bottom: 2px; }
    .eml { display:block; font-family:'Fira Code',monospace; font-size:7.5px; color:#495670; text-transform:uppercase; letter-spacing:0.06em; line-height:1.1; }

    .ach-heading { font-family:'Inter',sans-serif; font-size:11px; font-weight:700; color:#ccd6f6; margin:0 0 6px; }
    .ach-list { list-style:none; padding:0; margin:0 0 10px; display:flex; flex-direction:column; gap:4px; li { display:flex; align-items:flex-start; gap:8px; font-family:'Inter',sans-serif; font-size:clamp(11px,0.9vw,12px); color:#8892b0; line-height:1.4; .ab { color:#64ffda; font-size:11px; flex-shrink:0; margin-top:2px; } } }
    .exp-tech { display:flex; flex-wrap:wrap; gap:5px; }
    .tchip { font-family:'Fira Code',monospace; font-size:9px; color:#64ffda; background:rgba(100,255,218,0.06); border:1px solid rgba(100,255,218,0.2); border-radius:4px; padding:2px 6px; }

    .stagger-item { opacity:0; transform:translateY(24px); }

    @media (max-width: 1400px) { .exp-scroll { padding: 14px 100px; } }
    @media (max-width: 1200px) { .exp-scroll { padding: 14px 80px; } }
    @media (max-width: 1024px) {
      .exp-scroll { padding: 14px 50px; }
      .exp-layout { grid-template-columns: 1fr; }
      .timeline-col { flex-direction: row; flex-wrap: wrap; gap: 8px; padding: 0; }
      .track-line { display: none; }
      .t-item { border: 1px solid #1e2d45; border-radius: 10px; padding: 10px 14px; width: auto; }
      .t-dot { display: none; }
    }
    @media (max-width: 768px) {
      .exp-container { padding-top: 70px; }
      .exp-scroll { padding: 12px 20px; }
      .detail-panel { padding: 16px 18px; }
    }
  `]
})
export class ExperienceComponent implements OnChanges, OnInit {
  @Input() isActive = false;
  @ViewChild('expContainer') container!: ElementRef;
  private platformId = inject(PLATFORM_ID);
  private animated = false;
  activeExp = 0;

  experiences = [
    {
      company:'ITGalax Solution',
      role:'Frontend / Angular Developer',
      period:'Jun 2022 – Jan 2026',
      type:'Full-time',
      location:'📍 Chennai',
      icon:'🚀',
      description:'Frontend / Angular Developer with 3.7+ years of experience delivering enterprise applications for government and financial domains. Skilled in Angular, TypeScript, RxJS, API integration, performance optimization, reusable architecture, and modern frontend best practices.',
      metrics:[
        {label:'Professional Experience',value:'3.7+ Years'},
        {label:'Enterprise Scale',value:'10,000+ Users'},
        {label:'Core Expertise',value:'Angular 13–20'},
        {label:'Domain Experience',value:'Enterprise & Govt'}
      ],
      achievements:[
        'Built scalable, high-performance web applications for enterprise, government, and financial platforms.',
        'Developed modular Angular applications, optimizing load times through OnPush change detection, lazy loading, and code splitting.',
        'Architected secure API-driven workflows using HTTP interceptors, JWT authentication, and RBAC-based access control.',
        'Built multi-step reactive forms and scalable component architectures suitable for complex business logic.',
        'Collaborated with backend teams on API contracts to improve maintainability through reusable modules.',
        'Supported modern Angular migration strategies using Standalone Components and Signals.',
        'Contributed to debugging, testing, performance tuning, and cross-functional team collaboration.'
      ],
      tech:['Angular 13–20','TypeScript','RxJS','NgRx','Signals','SCSS','REST APIs','JWT','Git']
    },
    {
      company:'Freelance',
      role:'Freelance Frontend Developer',
      period:'Feb 2026 – Present',
      type:'Contract',
      location:'🌐 Remote',
      icon:'💻',
      description:'Operating as an independent Frontend Developer, delivering custom, high-performance web applications and UI solutions for diverse clients while focusing on modern architecture and responsive design.',
      metrics:[
        {label:'Role Focus',value:'Frontend Arc.'},
        {label:'Delivery',value:'On-Time'},
        {label:'Core Expertise',value:'Angular & JS'},
        {label:'Work Mode',value:'Remote'}
      ],
      achievements:[
        'Collaborating directly with clients to define requirements, design intuitive UIs, and architect scalable frontend solutions.',
        'Building responsive, mobile-first web applications using Angular, TypeScript, and modern CSS strategies.',
        'Integrating with third-party RESTful APIs, headless CMS systems, and custom backend services to construct data-driven interfaces.',
        'Providing strategic consulting on frontend performance optimizations, SEO routing, and codebase modernization.'
      ],
      tech:['Angular','TypeScript','Tailwind CSS','RxJS','REST APIs','Signals','Git']
    }
  ];

  ngOnInit() {}

  ngOnChanges() {
    if (this.isActive && !this.animated) {
      if (!isPlatformBrowser(this.platformId)) return;
      setTimeout(() => {
        if (!this.container) return;
        GsapUtils.staggerTextUp(this.container.nativeElement.querySelectorAll('.stagger-item'));
        this.animated = true;
      }, 80);
    }
  }
}
