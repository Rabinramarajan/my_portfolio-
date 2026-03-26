import { Component, Input, ViewChild, ElementRef, inject, OnChanges, OnInit, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GsapUtils } from '../../shared/animations/gsap.utils';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="contact-container" #contactContainer>
      <div class="contact-bg"><div class="cg"></div><div class="cb1"></div><div class="cb2"></div></div>

      <div class="contact-scroll">
        <div class="contact-inner">

          <div class="section-label stagger-item">
            <span class="cln">05.</span><span class="clt">Contact</span><div class="cll"></div>
          </div>

          <div class="contact-layout">

            <!-- LEFT -->
            <div class="contact-left stagger-item">
              <h2 class="contact-heading">
                Let’s build something
                <span class="cha">scalable and impactful.</span>
              </h2>
              <p class="contact-sub">
                I’m open to frontend, Angular, and enterprise web application opportunities. Whether you need a developer for a new product, dashboard, government portal, performance improvement, or long-term frontend support, I’d be glad to connect. Based in Chennai, India, and available for remote and collaborative work.
              </p>

              <div class="contact-details">
                @for (ci of contactItems; track ci.label) {
                  <a class="ci-item" [href]="ci.href" target="_blank">
                    <div class="ci-left">
                      <div class="ci-icon" [innerHTML]="ci.svg"></div>
                      <span class="ci-label">{{ ci.label }}</span>
                    </div>
                    <span class="ci-val">{{ ci.value }}</span>
                  </a>
                }
              </div>

              <div class="avail-badge">
                <span class="avail-dot"></span>Available for freelance projects
              </div>
            </div>

            <!-- RIGHT — Form -->
            <div class="contact-right stagger-item">
              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="cform">

                <div class="form-row">
                  <div class="fg">
                    <label for="fname">Full Name *</label>
                    <input id="fname" formControlName="name" type="text" placeholder="John Smith" [class.error]="isErr('name')">
                    @if (isErr('name')) { <span class="err">Name is required</span> }
                  </div>
                  <div class="fg">
                    <label for="femail">Email Address *</label>
                    <input id="femail" formControlName="email" type="email" placeholder="john@company.com" [class.error]="isErr('email')">
                    @if (isErr('email')) { <span class="err">Valid email required</span> }
                  </div>
                </div>

                <div class="form-row">
                  <div class="fg">
                    <label for="fservice">Service</label>
                    <select id="fservice" formControlName="service">
                      <option value="">Select a service...</option>
                      <option value="angular">Angular Web Development</option>
                      <option value="dashboard">Dashboard Development</option>
                      <option value="mobile">Ionic Mobile App</option>
                      <option value="api">API Integration</option>
                      <option value="perf">Performance Optimization</option>
                      <option value="consulting">Architecture Consulting</option>
                    </select>
                  </div>
                  <div class="fg">
                    <label for="fbudget">Budget Range</label>
                    <select id="fbudget" formControlName="budget">
                      <option value="">Select your budget...</option>
                      <option value="1k-3k">$1,000 – $3,000</option>
                      <option value="3k-8k">$3,000 – $8,000</option>
                      <option value="8k-20k">$8,000 – $20,000</option>
                      <option value="20k+">$20,000+</option>
                    </select>
                  </div>
                </div>

                <div class="fg">
                  <label for="fmessage">Message *</label>
                  <textarea id="fmessage" formControlName="message" rows="4" placeholder="Tell me about your project..." [class.error]="isErr('message')"></textarea>
                  @if (isErr('message')) { <span class="err">Message is required</span> }
                </div>

                <button type="submit" class="submit-btn" [disabled]="form.invalid || submitted">
                  @if (!submitted) {
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    Start a Conversation
                  }
                  @if (submitted) {
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Message Sent!
                  }
                </button>

              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-container { width:100vw; height:100vh; background:#050d1a; display:flex; flex-direction:column; position:relative; overflow:hidden; padding-top:60px; box-sizing:border-box; }
    .contact-bg { position:absolute; inset:0; pointer-events:none; }
    .cg { position:absolute; inset:0; background-image:radial-gradient(rgba(100,255,218,0.06) 1px,transparent 1px); background-size:32px 32px; }
    .cb1 { position:absolute; width:500px; height:500px; background:rgba(100,255,218,0.07); border-radius:50%; filter:blur(100px); top:-100px; left:-100px; animation:cbp 14s ease-in-out infinite alternate; }
    .cb2 { position:absolute; width:400px; height:400px; background:rgba(56,128,255,0.07); border-radius:50%; filter:blur(100px); bottom:-100px; right:0; animation:cbp 18s ease-in-out infinite alternate-reverse; }
    @keyframes cbp { from{transform:scale(1)} to{transform:scale(1.3) translate(20px,15px)} }

    .contact-scroll { flex:1; overflow:hidden; display:flex; align-items:center; justify-content:center; padding:10px 100px; box-sizing:border-box; }
    .contact-inner { width:100%; max-width:1100px; z-index:2; display:flex; flex-direction:column; gap:16px; margin-top:-20px; }

    .section-label { display:flex; align-items:center; gap:12px; margin-bottom:-6px; }
    .cln { color:#64ffda; font-family:'Fira Code',monospace; font-size:13px; }
    .clt { color:#ccd6f6; font-family:'Inter',sans-serif; font-size:clamp(16px,2vw,22px); font-weight:700; }
    .cll { flex:1; max-width:200px; height:1px; background:linear-gradient(90deg,#233554,transparent); }

    .contact-layout { display:grid; grid-template-columns:1fr 1.5fr; gap:30px; align-items:start; }

    /* Left */
    .contact-left { display:flex; flex-direction:column; gap:14px; }
    .contact-heading { font-family:'Inter',sans-serif; font-size:clamp(18px,2.2vw,26px); font-weight:800; color:#e6f1ff; margin:0; line-height:1.2; .cha { color:#64ffda; } }
    .contact-sub { font-family:'Inter',sans-serif; font-size:clamp(11.5px,1vw,13px); color:#8892b0; line-height:1.6; margin:0; }
    
    .contact-details { display:flex; flex-direction:column; gap:6px; }
    .ci-item { display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.015); border:1px solid rgba(255,255,255,0.04); border-radius:8px; padding:6px 12px 6px 6px; text-decoration:none; transition:all 0.3s; backdrop-filter:blur(8px); }
    .ci-item:hover { border-color:rgba(100,255,218,0.3); background:rgba(100,255,218,0.05); transform:translateY(-2px) scale(1.02); box-shadow:0 10px 20px rgba(0,0,0,0.2); }
    .ci-left { display:flex; align-items:center; gap:10px; }
    .ci-icon { width:30px; height:30px; border-radius:6px; background:rgba(100,255,218,0.05); border:1px solid rgba(100,255,218,0.15); display:flex; align-items:center; justify-content:center; color:#64ffda; flex-shrink:0; svg { width:14px; height:14px; } transition:all 0.3s; }
    .ci-item:hover .ci-icon { background:rgba(100,255,218,0.15); border-color:#64ffda; transform:rotate(5deg); }
    .ci-label { font-family:'Fira Code',monospace; font-size:9.5px; color:#8892b0; text-transform:uppercase; letter-spacing:0.04em; }
    .ci-val { font-family:'Inter',sans-serif; font-size:11.5px; color:#e6f1ff; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px; text-align:right; }
    
    .avail-badge { display:inline-flex; align-items:center; gap:6px; font-family:'Fira Code',monospace; font-size:10px; color:#64ffda; background:rgba(100,255,218,0.04); border:1px solid rgba(100,255,218,0.2); border-radius:12px; padding:5px 12px; width:fit-content; }
    .avail-dot { width:7px; height:7px; border-radius:50%; background:#64ffda; animation:adot 2s ease-in-out infinite; @keyframes adot { 0%,100%{box-shadow:0 0 4px #64ffda} 50%{box-shadow:0 0 14px #64ffda, 0 0 24px rgba(100,255,218,0.3)} } }

    /* Form */
    .contact-right { background:rgba(255,255,255,0.015); border:1px solid rgba(255,255,255,0.04); border-radius:16px; padding:20px 24px; backdrop-filter:blur(10px); box-shadow:0 20px 40px rgba(0,0,0,0.3); }
    .cform { display:flex; flex-direction:column; gap:10px; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .fg { display:flex; flex-direction:column; gap:4px; }
    label { font-family:'Fira Code',monospace; font-size:9px; color:#8892b0; text-transform:uppercase; letter-spacing:0.04em; margin-left:2px; }
    input,select,textarea { background:rgba(13,27,53,0.4); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:9px 12px; font-family:'Inter',sans-serif; font-size:12px; color:#ccd6f6; width:100%; box-sizing:border-box; outline:none; resize:none; transition:all 0.3s; box-shadow:inset 0 2px 4px rgba(0,0,0,0.2); &::placeholder { color:#495670; } &:hover { border-color:rgba(255,255,255,0.1); } &:focus { background:rgba(13,27,53,0.6); border-color:#64ffda; box-shadow:0 0 0 3px rgba(100,255,218,0.08), inset 0 2px 4px rgba(0,0,0,0.2); } &.error { border-color:#ff6b6b; } option { background:#0d1b35; } }
    textarea { height: 75px; } /* Override default rows scaling */
    select { cursor:pointer; }
    .err { font-family:'Fira Code',monospace; font-size:9px; color:#ff6b6b; margin-left:2px; }
    .submit-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; background:linear-gradient(45deg,#64ffda,rgba(100,255,218,0.8)); color:#050d1a; font-family:'Fira Code',monospace; font-size:12px; font-weight:700; border:none; border-radius:8px; padding:12px 24px; cursor:pointer; transition:all 0.3s; width:100%; margin-top:2px; box-shadow:0 4px 12px rgba(100,255,218,0.2); &:hover:not([disabled]) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(100,255,218,0.4); } &[disabled] { opacity:0.6; cursor:default; transform:none; } }

    .stagger-item { opacity:0; transform:translateY(24px); }

    @media (max-width: 1400px) { .contact-scroll { padding: 10px 80px; } }
    @media (max-width: 1200px) { .contact-scroll { padding: 10px 60px; } }
    @media (max-width: 1024px) { 
      .contact-scroll { padding: 10px 40px; overflow-y:auto; align-items:flex-start; } 
      .contact-layout { grid-template-columns: 1fr; gap:20px; } 
    }
    @media (max-width: 768px) { 
      .contact-container { padding-top:70px; } 
      .contact-scroll { padding: 10px 20px; } 
      .form-row { grid-template-columns: 1fr; } 
      .contact-right { padding:16px; }
    }
  `]
})
export class ContactComponent implements OnChanges, OnInit {
  @Input() isActive = false;
  @ViewChild('contactContainer') container!: ElementRef;
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);
  private animated = false;
  submitted = false;
  form: FormGroup;

  contactItems = [
    { label:'Email',    href:'mailto:rabinr2607@gmail.com',          value:'rabinr2607@gmail.com',           svg: this.sanitizer.bypassSecurityTrustHtml('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>') },
    { label:'Phone',    href:'tel:+919789376992',                    value:'+91 9789376992',                 svg: this.sanitizer.bypassSecurityTrustHtml('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>') },
    { label:'Location', href:'https://www.google.com/maps/place/Chennai',value:'Chennai, India',             svg: this.sanitizer.bypassSecurityTrustHtml('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>') },
    { label:'LinkedIn', href:'https://linkedin.com/in/rabinr',       value:'linkedin.com/in/rabinr',         svg: this.sanitizer.bypassSecurityTrustHtml('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>') },
    { label:'GitHub',   href:'https://github.com/Rabinramarajan',    value:'github.com/Rabinramarajan',      svg: this.sanitizer.bypassSecurityTrustHtml('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>') },
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name:    ['', Validators.required],
      email:   ['', [Validators.required, Validators.email]],
      service: [''],
      budget:  [''],
      message: ['', Validators.required],
    });
  }

  isErr(f: string) { const c = this.form.get(f); return c?.invalid && (c.dirty || c.touched); }

  onSubmit() {
    if (this.form.valid) {
      this.submitted = true;
      setTimeout(() => { this.submitted = false; this.form.reset(); }, 3000);
    } else { this.form.markAllAsTouched(); }
  }

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
