import { Directive, ElementRef, OnInit, OnDestroy, inject, Input } from '@angular/core';
import { AnimationService } from '../services/animation.service';

function createGatedCanvasController(
  host: HTMLElement,
  animation: AnimationService,
  setup: (canvas: HTMLCanvasElement) => void,
  tick: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void,
  onResize: (canvas: HTMLCanvasElement) => void
) {
  if (animation.prefersReducedMotion()) {
    return { destroy: () => {} };
  }

  const canvas = document.createElement('canvas');
  setup(canvas);
  host.style.position = 'relative';
  host.appendChild(canvas);

  let animationId: number | null = null;
  let isVisible = false;

  const start = () => {
    if (animationId !== null) return;
    const loop = () => {
      if (!isVisible) {
        animationId = null;
        return;
      }
      const ctx = canvas.getContext('2d');
      if (ctx) tick(ctx, canvas);
      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);
  };

  const stop = () => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };

  const unobserve = animation.observeIntersection(
    host,
    (visible) => {
      isVisible = visible;
      visible ? start() : stop();
    },
    { threshold: 0.05 }
  );

  const onWindowResize = () => onResize(canvas);
  window.addEventListener('resize', onWindowResize, { passive: true });

  return {
    destroy: () => {
      stop();
      unobserve();
      window.removeEventListener('resize', onWindowResize);
      canvas.remove();
    },
  };
}

@Directive({ selector: '[appAuroraBackground]', standalone: true })
export class AuroraBackgroundDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly animation = inject(AnimationService);
  private controller: { destroy: () => void } | null = null;
  private time = 0;

  ngOnInit(): void {
    this.controller = createGatedCanvasController(
      this.el.nativeElement,
      this.animation,
      (canvas) => {
        canvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;opacity:0.15';
        this.el.nativeElement.style.overflow = 'hidden';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      },
      (ctx, canvas) => {
        this.time += 0.0015;
        ctx.fillStyle = 'rgba(8, 13, 24, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
      },
      (canvas) => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    );
  }

  ngOnDestroy(): void {
    this.controller?.destroy();
  }
}

@Directive({ selector: '[appMouseFollowGlow]', standalone: true })
export class MouseFollowGlowDirective implements OnInit, OnDestroy {
  private readonly animation = inject(AnimationService);
  private glowElement: HTMLElement | null = null;
  private mouseX = 0;
  private mouseY = 0;
  private targetX = 0;
  private targetY = 0;
  private animationId: number | null = null;
  private active = false;
  private boundMouseMove: ((e: MouseEvent) => void) | null = null;
  private boundVisibility: (() => void) | null = null;

  ngOnInit(): void {
    if (this.animation.prefersReducedMotion()) return;
    this.glowElement = document.createElement('div');
    this.glowElement.style.cssText =
      'position:fixed;width:300px;height:300px;background:radial-gradient(circle,rgba(168,85,247,0.3) 0%,rgba(59,130,246,0.1) 70%,transparent 100%);border-radius:50%;pointer-events:none;filter:blur(60px);z-index:1;mix-blend-mode:screen';
    document.body.appendChild(this.glowElement);
    this.boundMouseMove = (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    };
    document.addEventListener('mousemove', this.boundMouseMove);
    this.boundVisibility = () => (document.hidden ? this.stop() : this.start());
    document.addEventListener('visibilitychange', this.boundVisibility);
    this.start();
  }

  private start(): void {
    if (this.active) return;
    this.active = true;
    const loop = () => {
      if (!this.active || !this.glowElement) return;
      const smooth = this.animation.smoothMouseFollower(this.mouseX, this.mouseY, this.targetX, this.targetY, 0.1);
      this.targetX = smooth.x;
      this.targetY = smooth.y;
      this.glowElement.style.left = `${this.targetX - 150}px`;
      this.glowElement.style.top = `${this.targetY - 150}px`;
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  private stop(): void {
    this.active = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  ngOnDestroy(): void {
    this.stop();
    this.glowElement?.remove();
    if (this.boundMouseMove) document.removeEventListener('mousemove', this.boundMouseMove);
    if (this.boundVisibility) document.removeEventListener('visibilitychange', this.boundVisibility);
  }
}

@Directive({ selector: '[appScrollTrigger]', standalone: true })
export class ScrollTriggerDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly animation = inject(AnimationService);
  private unobserve: (() => void) | null = null;
  @Input('appScrollTrigger') direction: 'up' | 'down' | 'left' | 'right' | '' | string = '';

  ngOnInit(): void {
    const element = this.el.nativeElement;
    if (this.animation.prefersReducedMotion()) {
      element.style.opacity = '1';
      return;
    }
    element.style.opacity = '0';
    let transformStr = 'translateY(30px)';
    if (this.direction === 'left') transformStr = 'translateX(-50px)';
    else if (this.direction === 'right') transformStr = 'translateX(50px)';
    else if (this.direction === 'down') transformStr = 'translateY(-30px)';
    element.style.transform = transformStr;
    element.style.filter = 'blur(10px)';
    element.style.transition = `all 0.8s ${this.animation.easing.easeOutCubic}`;
    this.unobserve = this.animation.observeIntersection(
      element,
      (isVisible) => {
        if (isVisible) {
          element.style.opacity = '1';
          element.style.transform = 'translate(0, 0)';
          element.style.filter = 'blur(0px)';
        }
      },
      { threshold: 0.2 }
    );
  }

  ngOnDestroy(): void {
    this.unobserve?.();
  }
}

@Directive({ selector: '[appMagneticButton]', standalone: true })
export class MagneticButtonDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly animation = inject(AnimationService);
  private boundEnter: (() => void) | null = null;
  private boundMove: ((e: MouseEvent) => void) | null = null;
  private boundLeave: (() => void) | null = null;

  ngOnInit(): void {
    if (this.animation.prefersReducedMotion()) return;
    const element = this.el.nativeElement;
    element.style.position = 'relative';
    this.boundEnter = () => {
      element.style.boxShadow = '0 0 30px 0 rgba(168, 85, 247, 0.5), 0 0 60px 0 rgba(59, 130, 246, 0.3)';
    };
    this.boundMove = (e) => {
      const rect = element.getBoundingClientRect();
      const angle = Math.atan2(e.clientY - rect.top - rect.height / 2, e.clientX - rect.left - rect.width / 2);
      const dist = Math.min(
        15,
        this.animation.distance(e.clientX - rect.left, e.clientY - rect.top, rect.width / 2, rect.height / 2) / 30
      );
      this.animation.setTransform(element, Math.cos(angle) * dist, Math.sin(angle) * dist, 1.02);
    };
    this.boundLeave = () => {
      element.style.transform = 'translate3d(0, 0, 0) scale(1)';
      element.style.boxShadow = 'none';
    };
    element.addEventListener('mouseenter', this.boundEnter);
    element.addEventListener('mousemove', this.boundMove);
    element.addEventListener('mouseleave', this.boundLeave);
  }

  ngOnDestroy(): void {
    const element = this.el.nativeElement;
    if (this.boundEnter) element.removeEventListener('mouseenter', this.boundEnter);
    if (this.boundMove) element.removeEventListener('mousemove', this.boundMove);
    if (this.boundLeave) element.removeEventListener('mouseleave', this.boundLeave);
  }
}

@Directive({ selector: '[appGridBackground]', standalone: true })
export class GridBackgroundDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly animation = inject(AnimationService);
  private controller: { destroy: () => void } | null = null;
  private time = 0;

  ngOnInit(): void {
    this.controller = createGatedCanvasController(
      this.el.nativeElement,
      this.animation,
      (canvas) => {
        canvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;opacity:0.15';
        canvas.width = window.innerWidth;
        canvas.height = Math.max(this.el.nativeElement.offsetHeight, window.innerHeight);
      },
      (ctx, canvas) => {
        this.time += 0.01;
        ctx.fillStyle = 'rgba(8, 13, 24, 1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 + Math.sin(this.time) * 0.1})`;
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
      },
      (canvas) => {
        canvas.width = window.innerWidth;
        canvas.height = Math.max(this.el.nativeElement.offsetHeight, window.innerHeight);
      }
    );
  }

  ngOnDestroy(): void {
    this.controller?.destroy();
  }
}

@Directive({ selector: '[appFloatingText]', standalone: true })
export class FloatingTextDirective implements OnInit {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly animation = inject(AnimationService);

  ngOnInit(): void {
    if (this.animation.prefersReducedMotion()) return;
    const element = this.el.nativeElement;
    element.innerHTML = (element.textContent || '')
      .split(' ')
      .map(
        (word: string, i: number) =>
          `<span style="display:inline-block;opacity:0;animation:fadeUpWords 0.8s ${this.animation.easing.easeOutCubic} forwards;animation-delay:${i * 0.1}s;margin-right:0.3em">${word}</span>`
      )
      .join('');
  }
}
