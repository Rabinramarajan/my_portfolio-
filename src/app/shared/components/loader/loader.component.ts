import {
  Component, OnInit, OnDestroy, Output, EventEmitter,
  PLATFORM_ID, inject, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loader-overlay" [class.loader-exit]="exiting" [class.loader-gone]="gone">

      <!-- Matrix Rain Canvas -->
      <canvas class="matrix-canvas" #matrixCanvas></canvas>

      <!-- Grid overlay -->
      <div class="loader-grid"></div>

      <!-- Blobs -->
      <div class="lb lb1"></div>
      <div class="lb lb2"></div>
      <div class="lb lb3"></div>

      <!-- Center content -->
      <div class="loader-center" [class.content-exit]="exiting">

        <!-- Diamond Logo -->
        <div class="logo-wrap">
          <svg viewBox="0 0 150 150" class="logo-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ldrG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#64ffda"/>
                <stop offset="60%" stop-color="#7b61ff"/>
                <stop offset="100%" stop-color="#3880ff"/>
              </linearGradient>
              <linearGradient id="ldrGR" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#64ffda"/>
                <stop offset="100%" stop-color="#3880ff"/>
              </linearGradient>
            </defs>

            <!-- Sonar pulse rings -->
            <circle class="ldr-sonar ls1" cx="75" cy="75" r="60" fill="none"
              stroke="rgba(100,255,218,0.4)" stroke-width="1"/>
            <circle class="ldr-sonar ls2" cx="75" cy="75" r="60" fill="none"
              stroke="rgba(100,255,218,0.4)" stroke-width="1"/>
            <circle class="ldr-sonar ls3" cx="75" cy="75" r="60" fill="none"
              stroke="rgba(100,255,218,0.4)" stroke-width="1"/>

            <!-- Inner diamond fill (bg) -->
            <polygon points="75,26 124,75 75,124 26,75"
              fill="rgba(100,255,218,0.04)" stroke="rgba(100,255,218,0.18)"
              stroke-width="1" stroke-linejoin="miter"/>

            <!-- Outer diamond — animated draw -->
            <polygon class="dmd-draw" points="75,4 146,75 75,146 4,75"
              fill="none" stroke="url(#ldrG)" stroke-width="2.5"
              stroke-linejoin="miter"/>

            <!-- Circuit corner ticks: Top -->
            <line x1="68" y1="4"   x2="82" y2="4"   stroke="#64ffda" stroke-width="2.5" stroke-linecap="round"/>
            <!-- Right -->
            <line x1="146" y1="68" x2="146" y2="82" stroke="#7b61ff" stroke-width="2.5" stroke-linecap="round"/>
            <!-- Bottom -->
            <line x1="68" y1="146" x2="82" y2="146" stroke="#3880ff" stroke-width="2.5" stroke-linecap="round"/>
            <!-- Left -->
            <line x1="4" y1="68" x2="4" y2="82"   stroke="#64ffda" stroke-width="2.5" stroke-linecap="round"/>

            <!-- Diagonal accent lines from corners toward center -->
            <line class="dmd-accent" x1="75" y1="4"   x2="75" y2="26"  stroke="rgba(100,255,218,0.3)" stroke-width="1" stroke-dasharray="3 3"/>
            <line class="dmd-accent" x1="146" y1="75" x2="124" y2="75" stroke="rgba(123,97,255,0.3)"  stroke-width="1" stroke-dasharray="3 3"/>
            <line class="dmd-accent" x1="75" y1="146" x2="75" y2="124" stroke="rgba(56,128,255,0.3)"  stroke-width="1" stroke-dasharray="3 3"/>
            <line class="dmd-accent" x1="4" y1="75"   x2="26" y2="75"  stroke="rgba(100,255,218,0.3)" stroke-width="1" stroke-dasharray="3 3"/>

            <!-- Cardinal glow dots -->
            <circle class="ldr-dot" cx="75"  cy="4"   r="4" fill="#64ffda"/>
            <circle class="ldr-dot" cx="146" cy="75"  r="4" fill="#7b61ff"/>
            <circle class="ldr-dot" cx="75"  cy="146" r="4" fill="#3880ff"/>
            <circle class="ldr-dot" cx="4"   cy="75"  r="4" fill="#64ffda"/>

            <!-- Bracket accents: < and > around RR -->
            <text class="ldr-bracket" x="34" y="88"
              font-family="Fira Code, monospace" font-size="18" font-weight="300"
              fill="rgba(100,255,218,0.35)">&lt;</text>
            <text class="ldr-bracket" x="103" y="88"
              font-family="Fira Code, monospace" font-size="18" font-weight="300"
              fill="rgba(100,255,218,0.35)">/&gt;</text>

            <!-- RR monogram -->
            <text class="ldr-rr" x="75" y="88"
              font-family="Inter, sans-serif" font-size="38" font-weight="900"
              text-anchor="middle" fill="url(#ldrG)" letter-spacing="-2">RR</text>

            <!-- Sub label -->
            <text class="ldr-sub" x="75" y="106"
              font-family="Fira Code, monospace" font-size="8"
              text-anchor="middle" fill="rgba(100,255,218,0.5)" letter-spacing="3">ANGULAR · DEV</text>
          </svg>
        </div>

        <!-- Terminal boot lines -->
        <div class="terminal-lines">
          @for (line of visibleLines; track $index) {
            <div class="t-line" [class.t-active]="$index === visibleLines.length - 1">
              <span class="t-prompt">❯</span>
              <span class="t-text">{{ line }}</span>
              @if ($index === visibleLines.length - 1 && !exiting) {
                <span class="t-cursor">█</span>
              }
            </div>
          }
        </div>

        <!-- Progress -->
        <div class="progress-wrap">
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="progress"></div>
            <div class="progress-glint" [style.left.%]="progress"></div>
          </div>
          <div class="progress-nums">
            <span class="p-pct">{{ displayPct }}%</span>
            <span class="p-status">{{ statusText }}</span>
          </div>
        </div>

      </div>

      <!-- Corner Brackets -->
      <div class="corner c-tl"></div>
      <div class="corner c-tr"></div>
      <div class="corner c-bl"></div>
      <div class="corner c-br"></div>

    </div>
  `,
  styles: [`
    .loader-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: #050d1a;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
      transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.77,0,0.175,1);
    }
    .loader-overlay.loader-exit {
      opacity: 0;
      transform: scale(1.04);
    }
    .loader-overlay.loader-gone { display: none; }

    /* Matrix Canvas */
    .matrix-canvas {
      position: absolute; inset: 0; width: 100%; height: 100%;
      opacity: 0.18; pointer-events: none;
    }

    /* Grid */
    .loader-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(100,255,218,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(100,255,218,0.04) 1px, transparent 1px);
      background-size: 50px 50px; pointer-events: none;
    }

    /* Blobs */
    .lb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
    .lb1 { width: 500px; height: 500px; background: rgba(100,255,218,0.07); top: -150px; right: -100px; animation: lbp 10s ease-in-out infinite alternate; }
    .lb2 { width: 400px; height: 400px; background: rgba(123,97,255,0.07); bottom: -100px; left: -80px; animation: lbp 14s ease-in-out infinite alternate-reverse; }
    .lb3 { width: 300px; height: 300px; background: rgba(56,128,255,0.05); top: 40%; left: 40%; animation: lbp 8s ease-in-out infinite; }
    @keyframes lbp { from{transform:scale(1)} to{transform:scale(1.3) translate(30px,20px)} }

    /* Center */
    .loader-center {
      display: flex; flex-direction: column; align-items: center; gap: 28px;
      z-index: 2; position: relative;
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .loader-center.content-exit { opacity: 0; transform: translateY(-20px); }

    /* ── Diamond Logo ── */
    .logo-wrap { position: relative; width: 150px; height: 150px; }
    .logo-svg  { width: 150px; height: 150px; overflow: visible; }

    /* Sonar rings — scale from center of SVG canvas */
    .ldr-sonar {
      transform-origin: 75px 75px;
      animation: ldrSonar 3.6s ease-out infinite;
    }
    .ls1 { animation-delay: 0s;   }
    .ls2 { animation-delay: 1.2s; }
    .ls3 { animation-delay: 2.4s; }
    @keyframes ldrSonar {
      0%   { transform: scale(0.25); opacity: 0.85; }
      100% { transform: scale(1.35); opacity: 0; }
    }

    /* Diamond outer — animated draw */
    /* perimeter ≈ 4 * sqrt(71^2+71^2) ≈ 401 → use 410 */
    .dmd-draw {
      stroke-dasharray: 410;
      stroke-dashoffset: 410;
      animation: dmdDraw 1.8s cubic-bezier(0.25,1,0.5,1) 0.3s forwards;
    }
    @keyframes dmdDraw { to { stroke-dashoffset: 0; } }

    /* Accent dashes */
    .dmd-accent { opacity: 0; animation: dmdAccent 0.4s ease 1.9s forwards; }
    @keyframes dmdAccent { to { opacity: 1; } }

    /* Cardinal dots */
    .ldr-dot { opacity: 0; }
    .ldr-dot:nth-child(9)  { animation: ldrDotIn 0.35s cubic-bezier(0.34,1.56,0.64,1) 2.0s forwards; }
    .ldr-dot:nth-child(10) { animation: ldrDotIn 0.35s cubic-bezier(0.34,1.56,0.64,1) 2.1s forwards; }
    .ldr-dot:nth-child(11) { animation: ldrDotIn 0.35s cubic-bezier(0.34,1.56,0.64,1) 2.2s forwards; }
    .ldr-dot:nth-child(12) { animation: ldrDotIn 0.35s cubic-bezier(0.34,1.56,0.64,1) 2.3s forwards; }
    @keyframes ldrDotIn { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }

    /* Brackets */
    .ldr-bracket { opacity: 0; animation: ldrTxtIn 0.4s ease 2.0s forwards; }

    /* RR and sub text */
    .ldr-rr  { opacity: 0; animation: ldrTxtIn 0.55s ease 1.7s forwards; }
    .ldr-sub { opacity: 0; animation: ldrTxtIn 0.45s ease 2.1s forwards; }
    @keyframes ldrTxtIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Terminal */
    .terminal-lines {
      display: flex; flex-direction: column; gap: 4px;
      font-family: 'Fira Code', monospace; font-size: 11px;
      width: 320px; min-height: 80px;
    }
    .t-line {
      display: flex; align-items: center; gap: 8px;
      color: #495670; opacity: 0;
      animation: tLineIn 0.3s ease forwards;
      transition: color 0.2s;
    }
    .t-line.t-active { color: #8892b0; }
    @keyframes tLineIn { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
    .t-prompt { color: #64ffda; font-size: 10px; flex-shrink: 0; }
    .t-text { flex: 1; }
    .t-cursor {
      color: #64ffda; font-size: 12px;
      animation: cursorBlink 0.7s step-end infinite;
    }
    @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }

    /* Progress */
    .progress-wrap { width: 320px; display: flex; flex-direction: column; gap: 8px; }
    .progress-track {
      height: 2px; background: rgba(255,255,255,0.06); border-radius: 2px;
      overflow: visible; position: relative;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #64ffda, #7b61ff, #3880ff);
      border-radius: 2px;
      box-shadow: 0 0 8px rgba(100,255,218,0.5);
      transition: width 0.3s ease;
      position: relative;
    }
    .progress-glint {
      position: absolute; top: 50%; transform: translate(-50%, -50%);
      width: 8px; height: 8px; border-radius: 50%;
      background: #64ffda;
      box-shadow: 0 0 10px #64ffda, 0 0 20px rgba(100,255,218,0.6);
      transition: left 0.3s ease;
    }
    .progress-nums {
      display: flex; justify-content: space-between; align-items: center;
    }
    .p-pct {
      font-family: 'Inter', sans-serif; font-size: 22px; font-weight: 800;
      color: #64ffda; line-height: 1;
      text-shadow: 0 0 20px rgba(100,255,218,0.4);
      transition: all 0.2s;
    }
    .p-status {
      font-family: 'Fira Code', monospace; font-size: 10px;
      color: #495670; letter-spacing: 0.05em; text-transform: uppercase;
    }

    /* Corner brackets */
    .corner {
      position: absolute; width: 20px; height: 20px;
      border-color: rgba(100,255,218,0.4);
      border-style: solid; pointer-events: none;
    }
    .c-tl { top: 20px; left: 20px;  border-width: 2px 0 0 2px; }
    .c-tr { top: 20px; right: 20px; border-width: 2px 2px 0 0; }
    .c-bl { bottom: 20px; left: 20px;  border-width: 0 0 2px 2px; }
    .c-br { bottom: 20px; right: 20px; border-width: 0 2px 2px 0; }

    @media (max-width: 480px) {
      .terminal-lines, .progress-wrap { width: 280px; }
    }
  `]
})
export class LoaderComponent implements OnInit, OnDestroy {
  @Output() loadComplete = new EventEmitter<void>();

  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  exiting = false;
  gone = false;
  progress = 0;
  displayPct = 0;
  statusText = 'Initialising...';
  visibleLines: string[] = [];

  private timers: ReturnType<typeof setTimeout>[] = [];
  private animFrame: number | null = null;
  private matrixCanvas: HTMLCanvasElement | null = null;
  private matrixCtx: CanvasRenderingContext2D | null = null;
  private matrixCols: number[] = [];
  private matrixFrame: number | null = null;

  private readonly bootLines = [
    'Initialising Angular runtime...',
    'Loading component tree...',
    'Compiling RxJS observables...',
    'Bootstrapping NgRx store...',
    'Hydrating UI modules...',
    'Optimising render pipeline...',
    'Launching portfolio...',
  ];

  private readonly steps: { pct: number; status: string; line?: number }[] = [
    { pct: 10,  status: 'Initialising...',      line: 0 },
    { pct: 25,  status: 'Loading modules...',    line: 1 },
    { pct: 40,  status: 'Building state...',     line: 2 },
    { pct: 55,  status: 'Wiring observables...', line: 3 },
    { pct: 68,  status: 'Hydrating UI...',       line: 4 },
    { pct: 82,  status: 'Optimising...',         line: 5 },
    { pct: 95,  status: 'Almost ready...',       line: 6 },
    { pct: 100, status: 'Ready!' },
  ];

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.gone = true;
      return;
    }
    this.runBootSequence();
  }

  ngOnDestroy() {
    this.timers.forEach(t => clearTimeout(t));
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.matrixFrame) cancelAnimationFrame(this.matrixFrame);
  }

  private runBootSequence() {
    // Start matrix after a small delay to allow render
    this.t(100, () => this.initMatrix());

    let delay = 200;
    this.steps.forEach((step, i) => {
      const stepDelay = i === 0 ? delay : delay + (i * 380);
      this.t(stepDelay, () => {
        this.progress = step.pct;
        this.statusText = step.status;
        if (step.line !== undefined) {
          this.visibleLines = this.bootLines.slice(0, step.line + 1);
        }
        // Animate display percentage
        this.animatePct(step.pct);
        this.cdr.markForCheck();
      });
    });

    // Total ~3.2s — start exit
    this.t(3400, () => this.exit());
  }

  private animatePct(target: number) {
    const start = this.displayPct;
    const delta = target - start;
    const duration = 300;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      this.displayPct = Math.round(start + delta * ease);
      this.cdr.markForCheck();
      if (t < 1) this.animFrame = requestAnimationFrame(tick);
    };
    this.animFrame = requestAnimationFrame(tick);
  }

  private exit() {
    this.exiting = true;
    this.cdr.markForCheck();
    this.t(900, () => {
      this.gone = true;
      this.cdr.markForCheck();
      this.loadComplete.emit();
      if (this.matrixFrame) cancelAnimationFrame(this.matrixFrame);
    });
  }

  private t(ms: number, fn: () => void) {
    const id = setTimeout(fn, ms);
    this.timers.push(id);
    return id;
  }

  // ── Matrix Rain ──────────────────────────────────────────────
  private initMatrix() {
    const canvas = document.querySelector('.matrix-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    this.matrixCanvas = canvas;
    this.matrixCtx = canvas.getContext('2d');
    this.resizeMatrix();
    this.drawMatrix();
  }

  private resizeMatrix() {
    const c = this.matrixCanvas!;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    const cols = Math.floor(c.width / 16);
    this.matrixCols = Array.from({ length: cols }, () => Math.random() * c.height);
  }

  private drawMatrix() {
    const ctx = this.matrixCtx!;
    const canvas = this.matrixCanvas!;
    const chars = 'アイウエオカキクケコサシスセソタチツテト01>_<ngRxRxJSAngularSignals{}[]();=>★✦';

    ctx.fillStyle = 'rgba(5, 13, 26, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '13px Fira Code, monospace';

    this.matrixCols.forEach((y, i) => {
      const x = i * 16;
      const char = chars[Math.floor(Math.random() * chars.length)];

      // Top character glows teal
      ctx.fillStyle = '#64ffda';
      ctx.shadowColor = '#64ffda';
      ctx.shadowBlur = 6;
      ctx.fillText(char, x, y);

      // Trailing chars in purple/blue
      ctx.fillStyle = Math.random() > 0.5
        ? 'rgba(123, 97, 255, 0.7)'
        : 'rgba(56, 128, 255, 0.5)';
      ctx.shadowBlur = 0;
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - 16);

      if (y > canvas.height + Math.random() * 60) {
        this.matrixCols[i] = 0;
      } else {
        this.matrixCols[i] = y + 18;
      }
    });

    this.matrixFrame = requestAnimationFrame(() => this.drawMatrix());
  }
}
