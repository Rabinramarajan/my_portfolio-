import { Component, Input, ViewChild, ElementRef, inject, OnChanges, OnInit, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GsapUtils } from '../../shared/animations/gsap.utils';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="svc-container" #svcContainer>
      <div class="svc-bg"><div class="sg"></div><div class="sb1"></div><div class="sb2"></div></div>

      <div class="svc-scroll">
        <div class="svc-inner">

          <div class="section-label stagger-item">
            <span class="svn">04.</span><span class="svt">Services</span><div class="svl"></div>
          </div>
          <h2 class="svc-main-heading stagger-item">Frontend services focused on scalable and modern web applications.</h2>
          <p class="svc-sub stagger-item">I help businesses and teams build responsive, maintainable, and performance-focused frontend applications using Angular and modern web technologies. My services are shaped by hands-on experience in enterprise, financial, and government platforms.</p>

          <div class="svc-grid">
            @for (s of services; track s.title; let i = $index) {
              <div class="svc-card stagger-item" [style.--cc]="'rgb(' + s.color + ')'" [style.--cc-rgb]="s.color" [style.animation-delay.ms]="i * 90">
                <div class="card-bg-gradient"></div>
                <div class="card-index">0{{ i + 1 }}</div>
                <div class="svc-hdr">
                  <div class="svc-icon-wrap">
                    <span class="se">{{ s.icon }}</span>
                  </div>
                  <h3 class="sc-title">{{ s.title }}</h3>
                </div>
                <p class="sc-desc">{{ s.description }}</p>
                <div class="sc-footer">
                  <div class="sc-tags">
                    @for (t of s.tags; track t) {
                      <span class="stg">{{ t }}</span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="cta-banner stagger-item">
            <div class="cta-text">
              <h3>Have a project, role, or collaboration in mind?</h3>
              <p>Let’s connect and build modern, high-performance web applications together.</p>
            </div>
            <div class="cta-btns">
              <a href="mailto:rabinr2607@gmail.com" class="cta-primary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Let’s Connect
              </a>
              <a href="mailto:rabinr2607@gmail.com" class="cta-ghost">Discuss a Project</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .svc-container { width:100vw; height:100vh; background:#050d1a; display:flex; flex-direction:column; position:relative; overflow:hidden; padding-top:60px; box-sizing:border-box; }
    .svc-bg { position:absolute; inset:0; pointer-events:none; }
    .sg { position:absolute; inset:0; background-image:radial-gradient(rgba(100,255,218,0.03) 1px,transparent 1px); background-size:40px 40px; }
    .sb1 { position:absolute; width:600px; height:600px; background:radial-gradient(circle, rgba(100,255,218,0.05), transparent 60%); top:-200px; right:-100px; animation:sbp 14s ease-in-out infinite alternate; }
    .sb2 { position:absolute; width:500px; height:500px; background:radial-gradient(circle, rgba(123,97,255,0.05), transparent 60%); bottom:-150px; left:-100px; animation:sbp 18s ease-in-out infinite alternate-reverse; }
    @keyframes sbp { from{transform:scale(1)} to{transform:scale(1.2) translate(30px,20px)} }

    .svc-scroll { flex:1; overflow:hidden; display:flex; align-items:center; justify-content:center; padding:0 100px; box-sizing:border-box; }
    .svc-inner { width:100%; max-width:1180px; z-index:2; display:flex; flex-direction:column; gap:8px; }

    .section-label { display:flex; align-items:center; gap:12px; margin-bottom:-4px; }
    .svn { color:#64ffda; font-family:'Fira Code',monospace; font-size:13px; }
    .svt { color:#ccd6f6; font-family:'Inter',sans-serif; font-size:clamp(16px,2vw,22px); font-weight:700; white-space:nowrap; }
    .svl { flex:1; max-width:200px; height:1px; background:linear-gradient(90deg,#233554,transparent); }
    .svc-main-heading { font-family:'Inter',sans-serif; font-size:clamp(16px,2vw,22px); font-weight:800; color:#e6f1ff; line-height:1.2; margin:6px 0; }
    .svc-sub { font-family:'Inter',sans-serif; font-size:12px; color:#8892b0; line-height:1.5; max-width:800px; margin:0 0 8px; }

    .svc-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:4px; margin-bottom:12px; }

    .svc-card { 
      position:relative; 
      background:rgba(10, 20, 40, 0.4); 
      border:1px solid rgba(255,255,255,0.05); 
      border-radius:14px; 
      padding:16px 18px; 
      display:flex; 
      flex-direction:column; 
      gap:10px; 
      overflow:hidden; 
      animation:scIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; 
      transition:all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      backdrop-filter: blur(8px);
    }
    .svc-card::before {
      content:''; position:absolute; left:0; top:0; bottom:0; width:3px;
      background: linear-gradient(to bottom, var(--cc), transparent);
      opacity:0.3; transition:opacity 0.4s; z-index:10;
    }
    .svc-card:hover { 
      transform:translateY(-6px) scale(1.02); 
      background:rgba(13, 27, 53, 0.6); 
      border-color:rgba(var(--cc-rgb),0.3); 
      box-shadow:0 15px 35px rgba(0,0,0,0.4), 0 0 20px rgba(var(--cc-rgb),0.08); 
    }
    .svc-card:hover::before { opacity:1; box-shadow:0 0 12px var(--cc); }
    .svc-card:hover .card-bg-gradient { opacity:1; }
    .svc-card:hover .svc-icon-wrap { transform:scale(1.1) rotate(5deg); background:rgba(var(--cc-rgb),0.15); border-color:var(--cc); box-shadow:0 0 10px rgba(var(--cc-rgb),0.3); }
    .svc-card:hover .card-index { transform:translate(5px,-5px) scale(1.1); color:rgba(var(--cc-rgb),0.05); }

    .card-bg-gradient { position:absolute; inset:0; background:radial-gradient(circle at top right, rgba(var(--cc-rgb),0.12), transparent 60%); opacity:0; transition:opacity 0.4s; z-index:0; pointer-events:none; }
    .card-index { position:absolute; bottom:-20px; right:-15px; font-family:'Inter',sans-serif; font-size:85px; font-weight:900; color:rgba(255,255,255,0.02); z-index:0; pointer-events:none; line-height:1; transition:all 0.4s; letter-spacing:-0.05em; }

    .svc-hdr, .sc-desc, .sc-footer { position:relative; z-index:1; }
    .svc-hdr { display:flex; align-items:center; gap:10px; }
    .svc-icon-wrap { position:relative; width:36px; height:36px; border-radius:8px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; transition:all 0.4s; flex-shrink:0; box-shadow:0 4px 10px rgba(0,0,0,0.2); }
    .se { font-size:16px; line-height:1; position:relative; z-index:2; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }
    .sc-title { font-family:'Inter',sans-serif; font-size:clamp(13px,1.2vw,15px); font-weight:800; color:#e6f1ff; margin:0; line-height:1.2; letter-spacing:-0.01em; }
    
    .sc-desc { font-family:'Inter',sans-serif; font-size:11.5px; color:#8892b0; line-height:1.55; margin:0; flex:1; }
    
    .sc-footer { display:flex; flex-direction:column; gap:8px; margin-top:2px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.05); }
    .sc-tags { display:flex; flex-wrap:wrap; gap:5px; }
    .stg { font-family:'Fira Code',monospace; font-size:9.5px; color:var(--cc); background:rgba(var(--cc-rgb),0.06); border:1px solid rgba(var(--cc-rgb),0.15); border-radius:4px; padding:3px 6px; transition:all 0.3s; }
    .stg:hover { background:rgba(var(--cc-rgb),0.15); transform:translateY(-1px); }

    /* CTA */
    .cta-banner { display:flex; align-items:center; justify-content:space-between; background:linear-gradient(135deg,rgba(100,255,218,0.04),rgba(123,97,255,0.04)); border:1px solid rgba(100,255,218,0.1); border-radius:10px; padding:10px 16px; gap:8px; flex-wrap:wrap; margin-top:0; }
    .cta-text { h3 { font-family:'Inter',sans-serif; font-size:13px; font-weight:700; color:#e6f1ff; margin:0 0 2px; } p { font-family:'Inter',sans-serif; font-size:11px; color:#8892b0; margin:0; } }
    .cta-btns { display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
    .cta-primary { display:inline-flex; align-items:center; gap:6px; background:#64ffda; color:#050d1a; font-weight:700; font-family:'Fira Code',monospace; font-size:11px; padding:7px 14px; border-radius:6px; text-decoration:none; transition:all 0.3s; &:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(100,255,218,0.25); } }
    .cta-ghost { font-family:'Fira Code',monospace; font-size:11px; color:#8892b0; border:1px solid #233554; border-radius:6px; padding:7px 14px; text-decoration:none; transition:all 0.3s; &:hover { color:#ccd6f6; border-color:#495670; } }

    .stagger-item { opacity:0; transform:translateY(24px); }

    @media (max-width: 1400px) { .svc-scroll { padding: 10px 80px; } }
    @media (max-width: 1200px) { .svc-scroll { padding: 10px 60px; } }
    @media (max-width: 1024px) { 
      .svc-scroll { padding: 10px 40px; overflow-y:auto; align-items:flex-start; } 
      .svc-grid { grid-template-columns: repeat(2,1fr); } 
      .svc-container { height: auto; min-height: 100vh; overflow: visible; }
    }
    @media (max-width: 768px) { 
      .svc-container { padding-top:70px; } 
      .svc-scroll { padding: 10px 20px; } 
      .svc-grid { grid-template-columns: 1fr; } 
      .cta-banner { flex-direction:column; text-align:center; } 
    }
  `]
})
export class ServicesComponent implements OnChanges, OnInit {
  @Input() isActive = false;
  @ViewChild('svcContainer') container!: ElementRef;
  private platformId = inject(PLATFORM_ID);
  private animated = false;

  services = [
    { icon:'⚡', title:'Angular Development', color:'221, 0, 49', description:'End-to-end development of scalable Angular applications using modern architecture, standalone components, reactive forms, Signals, and reusable UI patterns.', tags:['Angular 17+','Signals','Architecture'] },
    { icon:'📊', title:'Dashboard Systems', color:'100, 255, 218', description:'Building role-based dashboards, admin panels, and workflow systems with clean component architecture and responsive design.', tags:['Admin Panels','RBAC','Workflows'] },
    { icon:'🔗', title:'API Integration', color:'123, 97, 255', description:'Secure and efficient API integration with HTTP interceptors, JWT authentication flows, RBAC support, data handling, and frontend validation.', tags:['REST APIs','JWT','Interceptors'] },
    { icon:'🚀', title:'Performance Tuning', color:'255, 159, 67', description:'Improving load time, bundle size, rendering efficiency, and application responsiveness using lazy loading, code splitting, OnPush strategy, and optimized state handling.', tags:['OnPush','Lazy Loading','Core Web Vitals'] },
    { icon:'📱', title:'Mobile-First UI', color:'56, 128, 255', description:'Creating responsive interfaces for desktop, tablet, and mobile, including hybrid mobile app development with Ionic and Capacitor.', tags:['Ionic','Capacitor','Responsive'] },
    { icon:'🧩', title:'Reusable Components', color:'255, 107, 107', description:'Designing reusable components, scalable folder structures, maintainable UI systems, and clean frontend architecture for long-term projects.', tags:['UI Library','Scalability','Clean Code'] },
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
