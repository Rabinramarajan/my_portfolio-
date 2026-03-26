import { Component, Input, ViewChild, ElementRef, inject, OnChanges, OnInit, PLATFORM_ID, signal, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GsapUtils } from '../../shared/animations/gsap.utils';

interface Project {
  id: string; title: string; description: string; category: string;
  technologies: string[]; github: string; demo: string;
  color: string; icon: string; metrics: { label: string; value: string }[];
  highlights: string[]; year: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="projects-container" #projectsContainer>
      <div class="proj-bg"><div class="grid-pat"></div><div class="blob b1"></div><div class="blob b2"></div></div>

      <div class="proj-scroll">
        <div class="proj-inner">

          <div class="section-label stagger-item">
            <span class="pn">02.</span>
            <span class="pt">Projects</span>
            <div class="pl"></div>
          </div>
          <h2 class="proj-main-heading stagger-item">Selected projects built for scale, performance, and real-world impact.</h2>
          <p class="proj-intro stagger-item">Here are some of the enterprise and government platforms I have worked on, with a focus on scalability, usability, performance, and secure frontend architecture. These projects reflect my experience in Angular, Ionic, state management, API integration, and workflow-driven application design.</p>

          <!-- Filter -->
          <div class="filter-tabs stagger-item">
            @for (cat of categories; track cat) {
              <button class="tab-btn" [class.active]="activeFilter() === cat" (click)="setFilter(cat)">{{ cat }}</button>
            }
          </div>

          <!-- Grid -->
          <div class="projects-grid">
            @for (p of filteredProjects(); track p.id; let i = $index) {
              <div class="project-card stagger-item" [style.--accent]="p.color" [style.animation-delay.ms]="i * 80" (click)="openModal(p)">
                <div class="card-top">
                  <div class="card-icon" [style.background]="p.color + '22'"><span>{{ p.icon }}</span></div>
                  <div class="card-links" (click)="$event.stopPropagation()">
                    <a [href]="p.github" target="_blank" class="lbtn" title="GitHub">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.604-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/></svg>
                    </a>
                    <a [href]="p.demo" target="_blank" class="lbtn" title="Demo">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  </div>
                </div>
                <h3 class="card-title">{{ p.title }}</h3>
                <p class="card-desc">{{ p.description }}</p>
                <div class="card-metrics">
                  @for (m of p.metrics.slice(0,2); track m.label) {
                    <div class="metric"><span class="mv">{{ m.value }}</span><span class="ml">{{ m.label }}</span></div>
                  }
                </div>
                <div class="card-tags">
                  @for (t of p.technologies.slice(0,4); track t) {
                    <span class="tag">{{ t }}</span>
                  }
                </div>
                <div class="card-footer">
                  <span class="vd">View Case Study →</span>
                  <span class="yr">{{ p.year }}</span>
                </div>
                <div class="card-line"></div>
              </div>
            }
          </div>

        </div>
      </div>

      <!-- Modal -->
      @if (selectedProject()) {
        <div class="modal-overlay open" (click)="closeModal()">
          <div class="modal-panel" (click)="$event.stopPropagation()">
            <button class="modal-close" (click)="closeModal()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <div class="modal-hero" [style.--accent]="selectedProject()!.color">
              <div class="mico">{{ selectedProject()!.icon }}</div>
              <div>
                <h2 class="mtitle">{{ selectedProject()!.title }}</h2>
                <div class="mmeta">
                  <span class="mcat">{{ selectedProject()!.category }}</span>
                  <span class="myr">{{ selectedProject()!.year }}</span>
                </div>
              </div>
              <div class="macts">
                <a [href]="selectedProject()!.github" target="_blank" class="m-ghost">GitHub</a>
                <a [href]="selectedProject()!.demo" target="_blank" class="m-primary">Live Demo ↗</a>
              </div>
            </div>
            <div class="modal-body">
              <div class="modal-metrics">
                @for (m of selectedProject()!.metrics; track m.label) {
                  <div class="mmcard"><span class="mmv">{{ m.value }}</span><span class="mml">{{ m.label }}</span></div>
                }
              </div>
              <div class="modal-cols">
                <div>
                  <h4 class="msh">📋 Overview</h4>
                  <p class="mdesc">{{ selectedProject()!.description }}</p>
                  <h4 class="msh" style="margin-top:16px">✅ Key Achievements</h4>
                  <ul class="mlist">
                    @for (h of selectedProject()!.highlights; track h) {
                      <li>{{ h }}</li>
                    }
                  </ul>
                </div>
                <div>
                  <h4 class="msh">🛠 Technologies</h4>
                  <div class="tech-grid">
                    @for (t of selectedProject()!.technologies; track t) {
                      <span class="ttag">{{ t }}</span>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .projects-container { width:100vw; height:100vh; background:#070f20; display:flex; flex-direction:column; position:relative; overflow:hidden; padding-top:90px; box-sizing:border-box; }
    .proj-bg { position:absolute; inset:0; pointer-events:none; }
    .grid-pat { position:absolute; inset:0; background-image:linear-gradient(rgba(100,255,218,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(100,255,218,0.03) 1px,transparent 1px); background-size:50px 50px; }
    .blob { position:absolute; border-radius:50%; filter:blur(100px); opacity:0.08; }
    .b1 { width:500px; height:500px; background:#64ffda; top:-200px; right:-100px; animation:bp 14s ease-in-out infinite alternate; }
    .b2 { width:400px; height:400px; background:#7b61ff; bottom:-150px; left:-50px; animation:bp 18s ease-in-out infinite alternate-reverse; }
    @keyframes bp { from{transform:scale(1)} to{transform:scale(1.3) translate(30px,20px)} }

    .proj-scroll { flex:1; overflow-y:auto; display:flex; justify-content:center; padding:14px 150px; box-sizing:border-box; }
    .proj-inner { width:100%; max-width:1180px; z-index:2; display:flex; flex-direction:column; gap:16px; }

    .section-label { display:flex; align-items:center; gap:12px; }
    .pn { color:#64ffda; font-family:'Fira Code',monospace; font-size:15px; }
    .pt { color:#ccd6f6; font-family:'Inter',sans-serif; font-size:clamp(18px,2.5vw,26px); font-weight:700; white-space:nowrap; }
    .pl { flex:1; max-width:200px; height:1px; background:linear-gradient(90deg,#233554,transparent); }
    .proj-main-heading { font-family:'Inter',sans-serif; font-size:clamp(18px,2.2vw,28px); font-weight:800; color:#e6f1ff; line-height:1.2; margin: 16px 0 10px; }
    .proj-intro { font-family:'Inter',sans-serif; font-size:clamp(13px,1.1vw,15px); color:#8892b0; line-height:1.6; max-width:860px; margin: 0 0 24px; }

    .filter-tabs { display:flex; gap:8px; flex-wrap:wrap; }
    .tab-btn { font-family:'Fira Code',monospace; font-size:11px; padding:5px 14px; border-radius:20px; border:1px solid #233554; background:transparent; color:#8892b0; cursor:pointer; transition:all 0.25s; letter-spacing:0.04em; }
    .tab-btn.active,.tab-btn:hover { border-color:#64ffda; color:#64ffda; background:rgba(100,255,218,0.06); }

    .projects-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }

    .project-card { position:relative; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:18px 16px 14px; cursor:pointer; overflow:hidden; display:flex; flex-direction:column; gap:8px; animation:cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; transition:transform 0.3s,border-color 0.3s,box-shadow 0.3s;
      &:hover { transform:translateY(-6px); border-color:var(--accent,#64ffda); box-shadow:0 16px 40px rgba(0,0,0,0.4); .card-line { transform:scaleX(1); } .vd { color:var(--accent,#64ffda); } }
    }
    @keyframes cardIn { from{opacity:0;transform:translateY(30px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
    .card-line { position:absolute; bottom:0; left:0; right:0; height:2px; background:var(--accent,#64ffda); transform:scaleX(0); transform-origin:left; transition:transform 0.4s; }
    .card-top { display:flex; align-items:flex-start; justify-content:space-between; }
    .card-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; backdrop-filter:blur(4px); }
    .card-links { display:flex; gap:6px; }
    .lbtn { width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#495670; border:1px solid #233554; background:transparent; text-decoration:none; transition:all 0.2s; &:hover { color:#64ffda; border-color:#64ffda; } }
    .card-title { font-family:'Inter',sans-serif; font-size:clamp(13px,1.1vw,16px); font-weight:700; color:#e6f1ff; margin:0; line-height:1.3; }
    .card-desc { font-family:'Inter',sans-serif; font-size:12px; color:#8892b0; line-height:1.6; margin:0; flex:1; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .card-metrics { display:flex; gap:12px; }
    .metric { display:flex; flex-direction:column; gap:2px; }
    .mv { font-family:'Inter',sans-serif; font-size:clamp(14px,1.5vw,18px); font-weight:800; color:var(--accent,#64ffda); line-height:1; }
    .ml { font-family:'Fira Code',monospace; font-size:9px; color:#495670; text-transform:uppercase; letter-spacing:0.06em; }
    .card-tags { display:flex; flex-wrap:wrap; gap:5px; }
    .tag { font-family:'Fira Code',monospace; font-size:10px; color:#495670; background:rgba(255,255,255,0.04); border:1px solid #1e2d45; border-radius:4px; padding:2px 7px; }
    .card-footer { display:flex; justify-content:space-between; align-items:center; }
    .vd { font-family:'Fira Code',monospace; font-size:10px; color:#495670; transition:color 0.3s; }
    .yr { font-family:'Fira Code',monospace; font-size:10px; color:#233554; }

    /* Modal */
    .modal-overlay { position:fixed; inset:0; z-index:1000; background:rgba(5,13,30,0.85); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:20px; box-sizing:border-box; animation:mfade 0.25s ease; }
    @keyframes mfade { from{opacity:0} to{opacity:1} }
    .modal-panel { width:100%; max-width:860px; max-height:88vh; background:#0d1b35; border:1px solid #1e2d45; border-radius:20px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 40px 80px rgba(0,0,0,0.6); animation:mslide 0.35s cubic-bezier(0.34,1.56,0.64,1); }
    @keyframes mslide { from{transform:scale(0.9) translateY(20px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }
    .modal-close { position:absolute; top:16px; right:16px; width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.05); border:1px solid #1e2d45; color:#8892b0; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; z-index:10; &:hover { background:rgba(255,255,255,0.1); color:#e6f1ff; } }
    .modal-hero { padding:24px 28px 20px; background:linear-gradient(135deg,rgba(100,255,218,0.04),transparent); border-bottom:1px solid #1e2d45; display:flex; align-items:flex-start; gap:16px; position:relative; flex-wrap:wrap; }
    .mico { font-size:36px; line-height:1; }
    .mtitle { font-family:'Inter',sans-serif; font-size:20px; font-weight:800; color:#e6f1ff; margin:0 0 6px; }
    .mmeta { display:flex; gap:10px; align-items:center; }
    .mcat { font-family:'Fira Code',monospace; font-size:11px; color:var(--accent,#64ffda); background:rgba(100,255,218,0.1); padding:3px 10px; border-radius:20px; }
    .myr { font-family:'Fira Code',monospace; font-size:11px; color:#495670; }
    .macts { margin-left:auto; display:flex; gap:8px; align-items:center; }
    .m-ghost,.m-primary { font-family:'Fira Code',monospace; font-size:11px; padding:7px 14px; border-radius:6px; text-decoration:none; transition:all 0.2s; }
    .m-ghost { color:#8892b0; border:1px solid #233554; &:hover { color:#ccd6f6; border-color:#495670; } }
    .m-primary { color:#050d1a; background:var(--accent,#64ffda); font-weight:700; &:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(100,255,218,0.3); } }
    .modal-body { overflow-y:auto; padding:20px 28px; display:flex; flex-direction:column; gap:16px; }
    .modal-metrics { display:flex; gap:16px; padding-bottom:16px; border-bottom:1px solid #1e2d45; flex-wrap:wrap; }
    .mmcard { text-align:center; min-width:70px; }
    .mmv { display:block; font-family:'Inter',sans-serif; font-size:22px; font-weight:800; color:var(--accent,#64ffda); }
    .mml { font-family:'Fira Code',monospace; font-size:10px; color:#495670; text-transform:uppercase; letter-spacing:0.06em; }
    .modal-cols { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .msh { font-family:'Inter',sans-serif; font-size:13px; font-weight:700; color:#ccd6f6; margin:0 0 10px; }
    .mdesc { font-family:'Inter',sans-serif; font-size:13px; color:#8892b0; line-height:1.7; margin:0; }
    .mlist { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:7px; li { font-family:'Inter',sans-serif; font-size:13px; color:#8892b0; padding-left:16px; position:relative; line-height:1.5; &::before { content:'✓'; position:absolute; left:0; color:#64ffda; font-weight:700; } } }
    .tech-grid { display:flex; flex-wrap:wrap; gap:7px; }
    .ttag { font-family:'Fira Code',monospace; font-size:11px; color:#64ffda; background:rgba(100,255,218,0.06); border:1px solid rgba(100,255,218,0.2); border-radius:4px; padding:3px 9px; }

    .stagger-item { opacity:0; transform:translateY(24px); }

    @media (max-width: 1400px) { .proj-scroll { padding: 14px 100px; } }
    @media (max-width: 1200px) { .proj-scroll { padding: 14px 80px; } }
    @media (max-width: 1024px) { .proj-scroll { padding: 14px 50px; } .projects-grid { grid-template-columns: repeat(2,1fr); } .modal-cols { grid-template-columns: 1fr; } }
    @media (max-width: 768px) { .projects-container { padding-top:70px; } .proj-scroll { padding: 12px 20px; } .projects-grid { grid-template-columns: 1fr; } .modal-panel { max-height:94vh; } }
  `]
})
export class ProjectsComponent implements OnChanges, OnInit {
  @Input() isActive = false;
  @ViewChild('projectsContainer') container!: ElementRef;
  private platformId = inject(PLATFORM_ID);
  private animated = false;

  activeFilter = signal<string>('All');
  selectedProject = signal<Project | null>(null);
  filteredProjects = signal<Project[]>([]);
  categories = ['All', 'Government', 'Mobile', 'Pension'];

  projects: Project[] = [
    {
      id: 'p1',
      title: 'FID – Fiji Immigration Portal',
      description: 'Built scalable, role-based dashboards for a large government platform serving 10,000+ users.',
      category: 'Government',
      technologies: ['Angular 17', 'Angular Signals', 'Tailwind CSS', 'REST APIs'],
      github: 'https://github.com',
      demo: 'https://demo.example.com',
      color: '#64ffda',
      icon: '🏛️',
      year: '2024',
      metrics: [{ label: 'Impact', value: 'Government' }, { label: 'Module', value: 'Workflows' }],
      highlights: [
        'Built scalable, role-based dashboards for a large government platform serving 10,000+ users.',
        'Developed permit modules with document upload, workflow handling, and real-time status tracking.',
        'Supported multiple user roles such as applicants, reviewers, and administrators.',
        'Contributed to real-time user experiences using RxJS WebSockets.'
      ]
    },
    {
      id: 'p2',
      title: 'PRIMS – Pension & Retirement System',
      description: 'Worked on a pension and retirement management platform focused on performance optimization and reusable frontend modules.',
      category: 'Enterprise',
      technologies: ['Angular 20', 'RxJS', 'Angular Material', 'NgRx'],
      github: 'https://github.com',
      demo: 'https://demo.example.com',
      color: '#7b61ff',
      icon: '💰',
      year: '2023',
      metrics: [{ label: 'Focus', value: 'Optimization' }, { label: 'Design', value: 'Reusable' }],
      highlights: [
        'Improved application responsiveness through efficient RxJS state handling.',
        'Built reusable forms and complex document upload UI modules.',
        'Implemented client-side caching strategies to reduce redundant API calls.',
        'Significantly improved user experience for administrative dashboard operations.'
      ]
    },
    {
      id: 'p3',
      title: 'VNPF – Vanuatu National Provident Fund',
      description: 'Built a hybrid mobile and web experience designed for reliability and usability in real-world conditions.',
      category: 'Mobile',
      technologies: ['Ionic Angular', 'Capacitor', 'RxJS', 'JWT'],
      github: 'https://github.com',
      demo: 'https://demo.example.com',
      color: '#3880ff',
      icon: '📱',
      year: '2024',
      metrics: [{ label: 'Platform', value: 'Mobile & Web' }, { label: 'Network', value: 'Low-Bandwidth' }],
      highlights: [
        'Built a hybrid mobile and web experience designed for reliability and usability.',
        'Contributed to biometric authentication features such as Face ID / Touch ID.',
        'Optimized API handling for low-bandwidth scenarios in real-world conditions.',
        'Helped deliver a scalable mobile-first platform with secure access and strong performance.'
      ]
    }
  ];

  ngOnInit() { this.filteredProjects.set(this.projects); }

  setFilter(cat: string) {
    this.activeFilter.set(cat);
    this.filteredProjects.set(cat === 'All' ? this.projects : this.projects.filter(p => p.category === cat));
  }

  openModal(p: Project) { this.selectedProject.set(p); }
  closeModal() { this.selectedProject.set(null); }

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
