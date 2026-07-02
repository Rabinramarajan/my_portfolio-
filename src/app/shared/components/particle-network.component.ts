import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ViewEncapsulation,
  ElementRef,
  afterNextRender,
} from '@angular/core';
import { AnimationService } from '../services/animation.service';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

@Component({
  selector: 'app-particle-network',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  template: `<canvas #canvas class="particle-canvas"></canvas>`,
  styles: [
    `
      .particle-canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        opacity: 0.4;
      }
    `,
  ],
})
export class ParticleNetworkComponent implements OnInit, OnDestroy {
  private readonly animation = inject(AnimationService);
  private readonly elRef = inject(ElementRef);
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private mouseX = 0;
  private mouseY = 0;
  private isVisible = true;
  private boundMouseMove: ((e: MouseEvent) => void) | null = null;
  private boundResize: (() => void) | null = null;
  private boundVisibility: (() => void) | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private unobserve: (() => void) | null = null;

  constructor() {
    afterNextRender(() => {
      this.canvas = this.elRef.nativeElement.querySelector('.particle-canvas');
      if (this.canvas) {
        this.resize();
        this.initializeParticles();
      }
    });
  }

  ngOnInit(): void {
    if (this.animation.prefersReducedMotion()) return;

    this.boundMouseMove = (e: MouseEvent) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    };
    document.addEventListener('mousemove', this.boundMouseMove, { passive: true });

    this.boundResize = () => this.resize();
    window.addEventListener('resize', this.boundResize, { passive: true });

    this.boundVisibility = () => {
      if (document.hidden) this.stop();
      else if (this.isVisible) this.start();
    };
    document.addEventListener('visibilitychange', this.boundVisibility);

    this.unobserve = this.animation.observeIntersection(
      this.elRef.nativeElement,
      (visible) => {
        this.isVisible = visible;
        visible ? this.start() : this.stop();
      },
      { threshold: 0 }
    );
  }

  private resize(): void {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private initializeParticles(): void {
    const count = window.innerWidth < 768 ? 25 : 50;
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.3,
    }));
    this.start();
  }

  private start(): void {
    if (this.animationId !== null || !this.canvas) return;
    const loop = () => {
      if (!this.isVisible || document.hidden) {
        this.animationId = null;
        return;
      }
      this.tick();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  private stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private tick(): void {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      const dist = this.animation.distance(p.x, p.y, this.mouseX, this.mouseY);
      if (dist < 150) {
        const angle = Math.atan2(p.y - this.mouseY, p.x - this.mouseX);
        p.vx += Math.cos(angle) * 0.05;
        p.vy += Math.sin(angle) * 0.05;
      }
      p.vx *= 0.99;
      p.vy *= 0.99;

      ctx.fillStyle = `rgba(168, 85, 247, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 150) {
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - d / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(this.particles[i].x, this.particles[i].y);
          ctx.lineTo(this.particles[j].x, this.particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.stop();
    this.unobserve?.();
    if (this.boundMouseMove) document.removeEventListener('mousemove', this.boundMouseMove);
    if (this.boundResize) window.removeEventListener('resize', this.boundResize);
    if (this.boundVisibility) document.removeEventListener('visibilitychange', this.boundVisibility);
  }
}
