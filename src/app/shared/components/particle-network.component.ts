import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AnimationService } from '../services/animation.service';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

/**
 * Floating Particle Network Component
 * Connected particles with dynamic motion and mouse interaction
 */
@Component({
  selector: 'app-particle-network',
  standalone: true,
  template: `<canvas #canvas class="particle-canvas"></canvas>`,
  styles: [`
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
  `],
})
export class ParticleNetworkComponent implements OnInit, OnDestroy {
  private readonly animation = inject(AnimationService);
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private mouseX = 0;
  private mouseY = 0;
  private canvas: HTMLCanvasElement | null = null;

  ngOnInit() {
    this.setupCanvas();
    this.initializeParticles();
    this.setupMouseTracking();
    this.animate();
  }

  private setupCanvas() {
    this.canvas = document.querySelector('.particle-canvas') as HTMLCanvasElement;
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      window.addEventListener('resize', () => {
        if (this.canvas) {
          this.canvas.width = window.innerWidth;
          this.canvas.height = window.innerHeight;
        }
      });
    }
  }

  private initializeParticles() {
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
  }

  private setupMouseTracking() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }

  private animate() {
    if (!this.canvas) return;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update particles
    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = this.canvas!.width;
      if (p.x > this.canvas!.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas!.height;
      if (p.y > this.canvas!.height) p.y = 0;

      // Mouse repulsion
      const dist = this.animation.distance(p.x, p.y, this.mouseX, this.mouseY);
      if (dist < 150) {
        const angle = Math.atan2(p.y - this.mouseY, p.x - this.mouseX);
        p.vx += Math.cos(angle) * 0.05;
        p.vy += Math.sin(angle) * 0.05;
      }

      // Damping
      p.vx *= 0.99;
      p.vy *= 0.99;
    });

    // Draw particles
    this.particles.forEach((p) => {
      ctx.fillStyle = `rgba(168, 85, 247, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(this.particles[i].x, this.particles[i].y);
          ctx.lineTo(this.particles[j].x, this.particles[j].y);
          ctx.stroke();
        }
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
 * Scroll Progress Indicator Component
 * Gradient glowing top bar that tracks scroll position
 */
@Component({
  selector: 'app-scroll-progress',
  standalone: true,
  template: `
    <div class="scroll-progress-bar" #progressBar></div>
  `,
  styles: [`
    .scroll-progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(
        90deg,
        rgba(168, 85, 247, 1) 0%,
        rgba(59, 130, 246, 1) 50%,
        rgba(20, 184, 166, 1) 100%
      );
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
      z-index: 9999;
      transition: width 0.1s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: width;
      width: 0%;
    }
  `],
})
export class ScrollProgressComponent implements OnInit {
  private progressBar: HTMLElement | null = null;

  ngOnInit() {
    this.progressBar = document.querySelector('.scroll-progress-bar') as HTMLElement;
    
    window.addEventListener('scroll', () => {
      if (this.progressBar) {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = windowHeight > 0 ? (window.scrollY / windowHeight) * 100 : 0;
        this.progressBar.style.width = scrolled + '%';
      }
    });
  }
}
