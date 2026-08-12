import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  computed,
} from '@angular/core';

import { CursorInteractive } from '../../../../../shared/directives/cursor-interactive';
import { CursorTarget } from '../../../../../shared/directives/cursor-target';
import { DeviceCapability } from '../../../../../core/services/device-capability';
import { Motion } from '../../../../../core/services/motion';
import { asyncTeardown } from '../../../../../shared/utils/async-teardown';

interface ArchitectureNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'component' | 'signal' | 'module' | 'api' | 'system';
  connections: string[];
}

interface PointerPosition {
  x: number;
  y: number;
}

@Component({
  selector: 'app-hero-architecture',
  standalone: true,
  imports: [CursorTarget, CursorInteractive],
  templateUrl: './hero-architecture.html',
  styleUrl: './hero-architecture.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroArchitecture {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly device = inject(DeviceCapability);
  private readonly motion = inject(Motion);
  private readonly teardown = asyncTeardown();

  protected readonly pointer = signal<PointerPosition>({ x: 0.5, y: 0.5 });
  protected readonly isInteractive = signal(false);
  protected readonly isLoaded = signal(false);

  protected readonly nodes = signal<ArchitectureNode[]>([
    { id: 'c1', label: 'COMPONENT / 01', x: 68, y: 18, type: 'component', connections: ['s1', 'm1'] },
    { id: 's1', label: 'SIGNAL / 02', x: 82, y: 32, type: 'signal', connections: ['c1', 'm2', 'a1'] },
    { id: 'm1', label: 'MODULE / 03', x: 52, y: 40, type: 'module', connections: ['c1', 's1', 'm2'] },
    { id: 'm2', label: 'MODULE / 04', x: 75, y: 55, type: 'module', connections: ['m1', 's1', 'a1', 'sys1'] },
    { id: 'a1', label: 'API / 05', x: 88, y: 68, type: 'api', connections: ['s1', 'm2', 'sys1'] },
    { id: 'sys1', label: 'SYSTEM / 06', x: 60, y: 75, type: 'system', connections: ['m2', 'a1'] },
    { id: 'c2', label: 'COMPONENT / 07', x: 35, y: 28, type: 'component', connections: ['m1'] },
    { id: 's2', label: 'SIGNAL / 08', x: 45, y: 60, type: 'signal', connections: ['m1', 'sys1'] },
  ]);

  protected readonly connections = computed(() => {
    const nodeMap = new Map(this.nodes().map(n => [n.id, n]));
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

    this.nodes().forEach(node => {
      node.connections.forEach(connId => {
        const target = nodeMap.get(connId);
        if (target && node.id < connId) {
          lines.push({
            x1: node.x,
            y1: node.y,
            x2: target.x,
            y2: target.y,
          });
        }
      });
    });

    return lines;
  });

  constructor() {
    afterNextRender(() => void this.init());
  }

  private async init(): Promise<void> {
    await this.waitForLoad();
    this.attachPointerTracking();
    await this.attachParallax();
    this.activateEntrance();
  }

  private waitForLoad(): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });
  }

  private attachPointerTracking(): void {
    const onMove = (event: PointerEvent) => {
      this.pointer.set({
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
      });
      this.isInteractive.set(true);
    };

    const onLeave = () => {
      this.pointer.set({ x: 0.5, y: 0.5 });
      this.isInteractive.set(false);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    this.teardown.register(() => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    });
  }

  private async attachParallax(): Promise<void> {
    if (!this.device.hasPrecisePointer()) return;
    const gsap = await this.motion.load();
    if (!gsap || this.teardown.destroyed) return;

    const root = this.host.nativeElement;
    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-depth]'));
    if (layers.length === 0) return;

    const depthOf = new Map<HTMLElement, number>();
    const to = new Map<HTMLElement, { x: (v: number) => void; y: (v: number) => void }>();

    for (const layer of layers) {
      depthOf.set(layer, Number(layer.dataset['depth'] ?? 1));
      to.set(layer, {
        x: gsap.quickTo(layer, 'x', { duration: 1.2, ease: 'power3.out' }),
        y: gsap.quickTo(layer, 'y', { duration: 1.2, ease: 'power3.out' }),
      });
    }

    const MAX = 8;
    const onMove = () => {
      const p = this.pointer();
      const dx = (p.x - 0.5) * 2;
      const dy = (p.y - 0.5) * 2;

      for (const layer of layers) {
        const depth = depthOf.get(layer) ?? 1;
        const strength = depth * 0.8;
        const target = to.get(layer);
        if (!target) continue;
        target.x(Math.max(-MAX, Math.min(MAX, dx * 6 * strength)));
        target.y(Math.max(-MAX, Math.min(MAX, dy * 4 * strength)));
      }
    };

    let rafId = 0;
    const loop = () => {
      onMove();
      rafId = requestAnimationFrame(loop);
    };
    loop();

    this.teardown.register(() => {
      cancelAnimationFrame(rafId);
      layers.forEach(layer => gsap.killTweensOf(layer));
    });
  }

  private activateEntrance(): void {
    this.isLoaded.set(true);
  }

  protected getNodeClass(type: string): string {
    return `arch-node arch-node--${type}`;
  }
}