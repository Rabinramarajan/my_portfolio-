import { Component, Input, ViewChild, ElementRef, inject, OnChanges, OnInit, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GsapUtils } from '../../shared/animations/gsap.utils';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="test-container" #testContainer>
      <div class="test-bg"><div class="tg"></div><div class="tb1"></div><div class="tb2"></div></div>

      <div class="test-scroll">
        <div class="test-inner">

          <div class="section-label stagger-item">
            <span class="tn">05.</span><span class="tt">What Clients Say</span><div class="tl"></div>
          </div>

          <!-- Rating bar -->
          <div class="rating-bar stagger-item">
            <div class="rb-left">
              <div class="stars-row">⭐⭐⭐⭐⭐</div>
              <span class="rb-num">5.0 / 5.0</span>
              <span class="rb-base">Based on 40+ reviews</span>
            </div>
            <div class="plat-row">
              @for (p of platforms; track p.name) {
                <div class="plat-badge">
                  <span class="pi">{{ p.icon }}</span>
                  <div><span class="pr">{{ p.rating }}</span><span class="pn">{{ p.name }}</span></div>
                </div>
              }
            </div>
          </div>

          <!-- Cards -->
          <div class="test-grid">
            @for (t of visibleTests(); track t.name; let i = $index) {
              <div class="t-card" [style.animation-delay.ms]="i * 100">
                <div class="quote">❝</div>
                <div class="card-stars">
                  @for (s of getStars(t.rating); track $index) { <span>⭐</span> }
                </div>
                <p class="test-text">{{ t.text }}</p>
                <div class="card-div"></div>
                <div class="card-author">
                  <div class="auth-av">{{ t.initial }}</div>
                  <div class="auth-info">
                    <span class="auth-name">{{ t.name }}</span>
                    <span class="auth-role">{{ t.role }}</span>
                    <span class="auth-co">{{ t.company }}</span>
                  </div>
                  <div class="auth-plat" [style.color]="t.color" [style.background]="t.color + '18'" [style.border-color]="t.color + '44'">{{ t.platform }}</div>
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          <div class="test-pager stagger-item">
            <button class="pager-btn" (click)="prev()" [disabled]="page === 0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div class="pager-dots">
              @for (p of pages; track $index; let i = $index) {
                <button class="pdot" [class.active]="page === i" (click)="page = i"></button>
              }
            </div>
            <button class="pager-btn" (click)="next()" [disabled]="page >= pages.length - 1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-container { width:100vw; height:100vh; background:#060e1f; display:flex; flex-direction:column; position:relative; overflow:hidden; padding-top:90px; box-sizing:border-box; }
    .test-bg { position:absolute; inset:0; pointer-events:none; }
    .tg { position:absolute; inset:0; background-image:radial-gradient(rgba(100,255,218,0.06) 1px,transparent 1px); background-size:36px 36px; }
    .tb1 { position:absolute; width:500px; height:500px; background:rgba(100,255,218,0.07); border-radius:50%; filter:blur(100px); top:-150px; right:-80px; animation:tbp 14s ease-in-out infinite alternate; }
    .tb2 { position:absolute; width:400px; height:400px; background:rgba(123,97,255,0.07); border-radius:50%; filter:blur(100px); bottom:-120px; left:-60px; animation:tbp 18s ease-in-out infinite alternate-reverse; }
    @keyframes tbp { from{transform:scale(1)} to{transform:scale(1.3) translate(20px,15px)} }

    .test-scroll { flex:1; overflow-y:auto; display:flex; justify-content:center; padding:14px 150px; box-sizing:border-box; }
    .test-inner { width:100%; max-width:1100px; z-index:2; display:flex; flex-direction:column; gap:16px; }

    .section-label { display:flex; align-items:center; gap:12px; }
    .tn { color:#64ffda; font-family:'Fira Code',monospace; font-size:15px; }
    .tt { color:#ccd6f6; font-family:'Inter',sans-serif; font-size:clamp(18px,2.5vw,26px); font-weight:700; white-space:nowrap; }
    .tl { flex:1; max-width:200px; height:1px; background:linear-gradient(90deg,#233554,transparent); }

    /* Rating bar */
    .rating-bar { display:flex; align-items:center; gap:24px; flex-wrap:wrap; background:rgba(255,255,255,0.02); border:1px solid rgba(100,255,218,0.08); border-radius:14px; padding:14px 20px; }
    .rb-left { display:flex; flex-direction:column; gap:3px; }
    .stars-row { font-size:14px; }
    .rb-num { font-family:'Inter',sans-serif; font-size:20px; font-weight:800; color:#64ffda; }
    .rb-base { font-family:'Fira Code',monospace; font-size:10px; color:#495670; }
    .plat-row { display:flex; gap:12px; flex-wrap:wrap; }
    .plat-badge { display:flex; align-items:center; gap:9px; padding:9px 14px; background:rgba(255,255,255,0.03); border:1px solid #1e2d45; border-radius:10px; }
    .pi { font-size:20px; }
    .pr { display:block; font-family:'Inter',sans-serif; font-size:15px; font-weight:800; color:#ccd6f6; }
    .pn { display:block; font-family:'Fira Code',monospace; font-size:10px; color:#495670; }

    /* Cards */
    .test-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
    .t-card { background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:20px 18px; display:flex; flex-direction:column; gap:10px; animation:tcIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; transition:transform 0.3s,border-color 0.3s,box-shadow 0.3s; &:hover { transform:translateY(-5px); border-color:rgba(100,255,218,0.2); box-shadow:0 16px 40px rgba(0,0,0,0.4); } }
    @keyframes tcIn { from{opacity:0;transform:translateY(20px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
    .quote { font-size:28px; color:rgba(100,255,218,0.15); line-height:1; font-family:Georgia,serif; }
    .card-stars { display:flex; gap:2px; font-size:12px; }
    .test-text { font-family:'Inter',sans-serif; font-size:clamp(11px,1vw,13px); color:#8892b0; line-height:1.75; margin:0; flex:1; font-style:italic; }
    .card-div { height:1px; background:rgba(255,255,255,0.06); }
    .card-author { display:flex; align-items:center; gap:10px; }
    .auth-av { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#64ffda,#7b61ff); display:flex; align-items:center; justify-content:center; font-family:'Inter',sans-serif; font-size:14px; font-weight:700; color:#050d1a; flex-shrink:0; }
    .auth-info { flex:1; display:flex; flex-direction:column; gap:1px; }
    .auth-name { font-family:'Inter',sans-serif; font-size:12px; font-weight:700; color:#e6f1ff; }
    .auth-role { font-family:'Inter',sans-serif; font-size:11px; color:#8892b0; }
    .auth-co { font-family:'Fira Code',monospace; font-size:10px; color:#495670; }
    .auth-plat { font-family:'Fira Code',monospace; font-size:9px; padding:3px 7px; border-radius:20px; border:1px solid; white-space:nowrap; }

    /* Pager */
    .test-pager { display:flex; align-items:center; justify-content:center; gap:14px; }
    .pager-btn { width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.04); border:1px solid #1e2d45; color:#8892b0; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; &:hover:not([disabled]) { background:rgba(100,255,218,0.08); border-color:#64ffda; color:#64ffda; } &[disabled] { opacity:0.3; cursor:default; } }
    .pager-dots { display:flex; gap:7px; }
    .pdot { width:7px; height:7px; border-radius:50%; background:#1e2d45; border:none; cursor:pointer; transition:all 0.25s; padding:0; &.active { background:#64ffda; transform:scale(1.3); } &:hover:not(.active) { background:#495670; } }

    .stagger-item { opacity:0; transform:translateY(24px); }

    @media (max-width: 1400px) { .test-scroll { padding: 14px 100px; } }
    @media (max-width: 1200px) { .test-scroll { padding: 14px 80px; } }
    @media (max-width: 1024px) { .test-scroll { padding: 14px 50px; } .test-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 768px) { .test-container { padding-top:70px; } .test-scroll { padding: 12px 20px; } .test-grid { grid-template-columns: 1fr; } .plat-row { flex-wrap:wrap; } }
  `]
})
export class TestimonialsComponent implements OnChanges, OnInit {
  @Input() isActive = false;
  @ViewChild('testContainer') container!: ElementRef;
  private platformId = inject(PLATFORM_ID);
  private animated = false;

  page = 0; perPage = 3;
  get pages() { return Array.from({ length: Math.ceil(this.testimonials.length / this.perPage) }); }
  visibleTests() { return this.testimonials.slice(this.page * this.perPage, this.page * this.perPage + this.perPage); }
  getStars(n: number) { return Array.from({ length: n }); }
  prev() { if (this.page > 0) this.page--; }
  next() { if (this.page < this.pages.length - 1) this.page++; }

  platforms = [
    { icon:'💼', name:'LinkedIn', rating:'5.0★' },
    { icon:'🆙', name:'Upwork',   rating:'5.0★' },
    { icon:'🐙', name:'GitHub',   rating:'4.9★' },
  ];

  testimonials = [
    { name:'John Smith',   initial:'J', role:'CTO',              company:'TechNova Solutions',  rating:5, platform:'LinkedIn', color:'#0077b5', text:'Rabin is an exceptional Angular architect who transformed our frontend stack. He delivered a 40% performance improvement and set up patterns our team still uses today.' },
    { name:'Sarah Connor', initial:'S', role:'Product Manager',   company:'GlobalFinance Corp',  rating:5, platform:'Upwork',   color:'#14a800', text:'Working with Rabin was a game-changer. He built our trading dashboard from scratch — real-time data, beautiful charts, sub-millisecond updates. Absolutely top-tier talent.' },
    { name:'Ahmed Hassan', initial:'A', role:'Engineering Lead',  company:'Nexus Digital',       rating:5, platform:'LinkedIn', color:'#0077b5', text:'Rabin delivered our Ionic mobile app 2 weeks ahead of schedule with a 4.8-star rating on both app stores. His attention to UX detail is unmatched.' },
    { name:'Priya Nair',   initial:'P', role:'Founder',           company:'StartupLaunch.io',    rating:5, platform:'Upwork',   color:'#14a800', text:'I hired Rabin to rescue our failing Angular project. He refactored the codebase in 3 weeks and added comprehensive tests. The app is now lightning fast.' },
    { name:'Chris Müller', initial:'C', role:'VP Engineering',    company:'LogiTrack GmbH',      rating:5, platform:'LinkedIn', color:'#0077b5', text:'His expertise in NgRx and state management saved us months of re-work. The enterprise dashboard he built handles 50K concurrent users without breaking a sweat.' },
    { name:'Emma Lawson',  initial:'E', role:'UI/UX Director',    company:'CreativeWave Agency', rating:5, platform:'Upwork',   color:'#14a800', text:'Rabin perfectly translated our Figma designs into pixel-perfect Angular components. His SCSS skills are extraordinary and the animations he built are buttery smooth.' },
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
