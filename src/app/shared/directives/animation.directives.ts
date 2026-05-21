import { Directive, ElementRef, OnInit, OnDestroy, inject } from '@angular/core';
import { AnimationService } from '../services/animation.service';

/**
 * Aurora Background Animation Directive
 * Smooth animated gradient waves with blue and purple flowing lights
 */
@Directive({
  selector: '[appAuroraBackground]',
  standalone: true,
})
export class AuroraBackgroundDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly animation = inject(AnimationService);
  private animationId: number | null = null;
  private time = 0;

  ngOnInit() {
    this.setupAuroraStyle();
    this.animate();
  }

  private setupAuroraStyle() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0.15';
    
    this.el.nativeElement.style.position = 'relative';
    this.el.nativeElement.style.overflow = 'hidden';
    this.el.nativeElement.appendChild(canvas);

    // Store for animation
    (this.el.nativeElement as any).__auroraCanvas = canvas;
  }

  private animate() {
    const canvas = (this.el.nativeElement as any).__auroraCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.time += 0.0015;

    // Clear canvas
    ctx.fillStyle = 'rgba(8, 13, 24, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw animated aurora waves
    for (let i = 0; i < 5; i++) {
      const wave = Math.sin(this.time + i * 0.5) * 100 + 200;
      const hue = (i * 60 + this.time * 20) % 360;

      const gradient = ctx.createLinearGradient(0, wave - 100, 0, wave + 100);
      gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0)`);
      gradient.addColorStop(0.5, `hsla(${hue}, 100%, 50%, 0.3)`);
      gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, wave - 100, canvas.width, 200);
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  ngOnDestroy() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

/**
 * Mouse Follow Glow Directive
 * Creates soft radial glow that follows cursor
 */
@Directive({
  selector: '[appMouseFollowGlow]',
  standalone: true,
})
export class MouseFollowGlowDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly animation = inject(AnimationService);
  private glowElement: HTMLElement | null = null;
  private mouseX = 0;
  private mouseY = 0;
  private targetX = 0;
  private targetY = 0;
  private animationId: number | null = null;

  ngOnInit() {
    this.setupGlow();
    this.setupMouseTracking();
    this.animateGlow();
  }

  private setupGlow() {
    this.glowElement = document.createElement('div');
    this.glowElement.style.cssText = `
      position: fixed;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(59, 130, 246, 0.1) 70%, transparent 100%);
      border-radius: 50%;
      pointer-events: none;
      filter: blur(60px);
      z-index: 1;
      mix-blend-mode: screen;
    `;
    document.body.appendChild(this.glowElement);
  }

  private setupMouseTracking() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }

  private animateGlow() {
    if (!this.glowElement) return;

    const smooth = this.animation.smoothMouseFollower(
      this.mouseX,
      this.mouseY,
      this.targetX,
      this.targetY,
      0.1
    );

    this.targetX = smooth.x;
    this.targetY = smooth.y;

    this.glowElement.style.left = `${this.targetX - 150}px`;
    this.glowElement.style.top = `${this.targetY - 150}px`;

    this.animationId = requestAnimationFrame(() => this.animateGlow());
  }

  ngOnDestroy() {
    if (this.glowElement) {
      this.glowElement.remove();
    }
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    document.removeEventListener('mousemove', () => {});
  }
}

/**
 * Scroll Animation Trigger Directive
 * Cinematic section reveals with fade-up and blur-to-clear transitions
 */
@Directive({
  selector: '[appScrollTrigger]',
  standalone: true,
})
export class ScrollTriggerDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly animation = inject(AnimationService);
  private unobserve: (() => void) | null = null;

  ngOnInit() {
    this.setupInitialState();
    this.observeScroll();
  }

  private setupInitialState() {
    const element = this.el.nativeElement;
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px) blur(10px)';
    element.style.transition = `all 0.8s ${this.animation.easing.easeOutCubic}`;
  }

  private observeScroll() {
    const element = this.el.nativeElement;
    this.unobserve = this.animation.observeIntersection(
      element,
      (isVisible) => {
        if (isVisible) {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0) blur(0px)';
        }
      },
      { threshold: 0.2 }
    );
  }

  ngOnDestroy() {
    if (this.unobserve) {
      this.unobserve();
    }
  }
}

/**
 * Magnetic Button Directive
 * Buttons move toward cursor with glow and ripple effects
 */
@Directive({
  selector: '[appMagneticButton]',
  standalone: true,
})
export class MagneticButtonDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private readonly animation = inject(AnimationService);
  private originalX = 0;
  private originalY = 0;
  private animationId: number | null = null;

  ngOnInit() {
    const element = this.el.nativeElement;
    element.style.position = 'relative';
    element.style.overflow = 'visible';

    element.addEventListener('mouseenter', () => this.setupGlow());
    element.addEventListener('mousemove', (e: MouseEvent) => this.handleMouseMove(e));
    element.addEventListener('mouseleave', () => this.handleMouseLeave());
  }

  private setupGlow() {
    const element = this.el.nativeElement;
    element.style.boxShadow = `0 0 30px 0 rgba(168, 85, 247, 0.5), 
                               0 0 60px 0 rgba(59, 130, 246, 0.3)`;
  }

  private handleMouseMove(event: MouseEvent) {
    const element = this.el.nativeElement;
    const rect = element.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
    const distance = Math.min(15, this.animation.distance(mouseX, mouseY, centerX, centerY) / 30);

    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;

    this.animation.setTransform(element, moveX, moveY, 1.02);
  }

  private handleMouseLeave() {
    const element = this.el.nativeElement;
    element.style.transform = 'translate3d(0, 0, 0) scale(1)';
    element.style.boxShadow = 'none';
  }

  ngOnDestroy() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

/**
 * Grid Background Directive
 * Animated glowing grid with pulse effects and hover reactivity
 */
@Directive({
  selector: '[appGridBackground]',
  standalone: true,
})
export class GridBackgroundDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private animationId: number | null = null;
  private time = 0;

  ngOnInit() {
    this.setupGrid();
    this.animate();
  }

  private setupGrid() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      opacity: 0.15;
    `;

    this.el.nativeElement.style.position = 'relative';
    this.el.nativeElement.appendChild(canvas);
    (this.el.nativeElement as any).__gridCanvas = canvas;
  }

  private animate() {
    const canvas = (this.el.nativeElement as any).__gridCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.time += 0.01;
    ctx.fillStyle = 'rgba(8, 13, 24, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 + Math.sin(this.time) * 0.1})`;
    ctx.lineWidth = 1;

    const gridSize = 50;
    for (let i = 0; i < canvas.width; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i < canvas.height; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw glowing intersection points
    ctx.fillStyle = `rgba(59, 130, 246, ${0.5 + Math.sin(this.time * 2) * 0.2})`;
    for (let i = gridSize; i < canvas.width; i += gridSize) {
      for (let j = gridSize; j < canvas.height; j += gridSize) {
        ctx.beginPath();
        ctx.arc(i, j, 2 + Math.sin(this.time + i + j) * 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  ngOnDestroy() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

/**
 * Floating Text Animation Directive
 * Word-by-word reveal with gradient and blur transitions
 */
@Directive({
  selector: '[appFloatingText]',
  standalone: true,
})
export class FloatingTextDirective implements OnInit {
  private readonly el = inject(ElementRef);
  private readonly animation = inject(AnimationService);

  ngOnInit() {
    this.setupTextAnimation();
  }

  private setupTextAnimation() {
    const element = this.el.nativeElement;
    const text = element.textContent || '';

    const words = text.split(' ');
    element.innerHTML = words
      .map(
        (word: string, i: number) => `
        <span style="
          display: inline-block;
          opacity: 0;
          animation: fadeUpWords 0.8s ${this.animation.easing.easeOutCubic} forwards;
          animation-delay: ${i * 0.1}s;
          margin-right: 0.3em;
        ">${word}</span>
      `
      )
      .join('');
  }
}
