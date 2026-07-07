import { AfterViewInit, Directive, ElementRef, EventEmitter, OnInit, OnDestroy, Output, inject, Input } from '@angular/core';
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

  private reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    // Fade in over the first 300ms of the hero load sequence
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 300ms ease';
    requestAnimationFrame(() => (canvas.style.opacity = '0.15'));

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

    // Static single frame under prefers-reduced-motion
    if (!this.reducedMotion) {
      this.animationId = requestAnimationFrame(() => this.animate());
    }
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
  private boundMouseMove: ((e: MouseEvent) => void) | null = null;

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
    this.boundMouseMove = (e: MouseEvent) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    };

    document.addEventListener('mousemove', this.boundMouseMove as EventListener);
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
    if (this.boundMouseMove) {
      document.removeEventListener('mousemove', this.boundMouseMove as EventListener);
      this.boundMouseMove = null;
    }
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
  @Input('appScrollTrigger') direction: 'up' | 'down' | 'left' | 'right' | '' | string = '';

  private prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ngOnInit() {
    this.setupInitialState();
    this.observeScroll();
  }

  private setupInitialState() {
    const element = this.el.nativeElement;

    if (this.prefersReducedMotion) {
      element.style.opacity = '1';
      element.style.transform = 'translate(0, 0)';
      element.style.filter = 'blur(0px)';
      return;
    }

    element.style.opacity = '0';

    let transformStr = 'translateY(24px)';
    if (this.direction === 'left') {
      transformStr = 'translateX(-24px)';
    } else if (this.direction === 'right') {
      transformStr = 'translateX(24px)';
    } else if (this.direction === 'down') {
      transformStr = 'translateY(-24px)';
    }

    element.style.transform = transformStr;
    element.style.filter = 'blur(10px)';
    element.style.transition = `all 0.6s ${this.animation.easing.easeOutCubic}`;
  }

  private observeScroll() {
    const element = this.el.nativeElement;
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
  private animationId: number | null = null;
  private boundEnter: (() => void) | null = null;
  private boundMove: ((e: MouseEvent) => void) | null = null;
  private boundLeave: (() => void) | null = null;

  private prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ngOnInit() {
    const element = this.el.nativeElement;
    element.style.position = 'relative';
    element.style.overflow = 'visible';

    if (this.prefersReducedMotion) {
      return;
    }

    this.boundEnter = () => this.setupGlow();
    this.boundMove = (e: MouseEvent) => this.handleMouseMove(e);
    this.boundLeave = () => this.handleMouseLeave();

    element.addEventListener('mouseenter', this.boundEnter as EventListener);
    element.addEventListener('mousemove', this.boundMove as EventListener);
    element.addEventListener('mouseleave', this.boundLeave as EventListener);
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
    const element = this.el.nativeElement;
    if (this.boundEnter) {
      element.removeEventListener('mouseenter', this.boundEnter as EventListener);
      this.boundEnter = null;
    }
    if (this.boundMove) {
      element.removeEventListener('mousemove', this.boundMove as EventListener);
      this.boundMove = null;
    }
    if (this.boundLeave) {
      element.removeEventListener('mouseleave', this.boundLeave as EventListener);
      this.boundLeave = null;
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

  private prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ngOnInit() {
    this.setupGrid();
    if (!this.prefersReducedMotion) {
      this.animate();
    } else {
      this.drawStaticGrid();
    }
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

  private drawStaticGrid() {
    const canvas = (this.el.nativeElement as any).__gridCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'rgba(8, 13, 24, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
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

    ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
    for (let i = gridSize; i < canvas.width; i += gridSize) {
      for (let j = gridSize; j < canvas.height; j += gridSize) {
        ctx.beginPath();
        ctx.arc(i, j, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
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

/**
 * Stagger Directive
 * Applies an incremental animation-delay to the host's direct children,
 * replacing per-element hardcoded [style.animation-delay] bindings.
 */
/**
 * Typewriter Directive
 * Types the host's text content character by character (~28 chars/s),
 * preserving any syntax-highlighting spans, with a blinking caret.
 * Emits (typingDone) when finished; renders instantly under
 * prefers-reduced-motion.
 */
@Directive({
  selector: '[appTypewriter]',
  standalone: true,
})
export class TypewriterDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef);

  @Input() typeSpeedMs = 36;
  @Input() typeStartDelayMs = 600;
  @Output() typingDone = new EventEmitter<void>();

  private timerId: ReturnType<typeof setTimeout> | null = null;
  private caret: HTMLElement | null = null;

  ngAfterViewInit() {
    const host = this.el.nativeElement as HTMLElement;
    const reduce =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      this.typingDone.emit();
      return;
    }

    const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
    const nodes: { node: Text; text: string }[] = [];
    let current: Node | null;
    while ((current = walker.nextNode())) {
      const textNode = current as Text;
      if (textNode.textContent) {
        nodes.push({ node: textNode, text: textNode.textContent });
      }
    }
    nodes.forEach((entry) => (entry.node.textContent = ''));

    this.caret = document.createElement('span');
    this.caret.className = 'type-caret';
    this.caret.setAttribute('aria-hidden', 'true');

    let nodeIndex = 0;
    let charIndex = 0;
    const step = () => {
      if (nodeIndex >= nodes.length) {
        this.caret?.remove();
        this.caret = null;
        this.typingDone.emit();
        return;
      }
      const { node, text } = nodes[nodeIndex];
      charIndex++;
      node.textContent = text.slice(0, charIndex);
      node.parentNode?.insertBefore(this.caret!, node.nextSibling);
      if (charIndex >= text.length) {
        nodeIndex++;
        charIndex = 0;
      }
      this.timerId = setTimeout(step, this.typeSpeedMs);
    };
    this.timerId = setTimeout(step, this.typeStartDelayMs);
  }

  ngOnDestroy() {
    if (this.timerId !== null) clearTimeout(this.timerId);
    this.caret?.remove();
  }
}

@Directive({
  selector: '[appStagger]',
  standalone: true,
})
export class StaggerDirective implements OnInit {
  private readonly el = inject(ElementRef);

  @Input() staggerMs = 80;
  @Input() staggerStartMs = 0;

  ngOnInit() {
    const children = Array.from(this.el.nativeElement.children) as HTMLElement[];
    children.forEach((child, i) => {
      child.style.animationDelay = `${this.staggerStartMs + i * this.staggerMs}ms`;
    });
  }
}
