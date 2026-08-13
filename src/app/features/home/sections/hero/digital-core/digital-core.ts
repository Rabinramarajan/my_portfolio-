import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';

import { CursorInteractive } from '../../../../../shared/directives/cursor-interactive';
import { CursorTarget } from '../../../../../shared/directives/cursor-target';
import { DeviceCapability } from '../../../../../core/services/device-capability';
import { Motion } from '../../../../../core/services/motion';
import { asyncTeardown } from '../../../../../shared/utils/async-teardown';

interface CoreNode {
  id: string;
  x: number;
  y: number;
  kind: 'system' | 'component' | 'signal' | 'module' | 'api' | 'data';
  label?: string;
}

interface CoreLink {
  id: string;
  d: string;
  trail?: boolean;
}

const NODES: readonly CoreNode[] = [
  { id: 'system', x: 176, y: 208, kind: 'system', label: 'SYSTEM / 01' },
  { id: 'component', x: 462, y: 182, kind: 'component', label: 'COMPONENT / 02' },
  { id: 'signal', x: 472, y: 330, kind: 'signal', label: 'SIGNAL / 03' },
  { id: 'module', x: 312, y: 462, kind: 'module', label: 'MODULE / 04' },
  { id: 'api', x: 172, y: 428, kind: 'api' },
  { id: 'data', x: 486, y: 470, kind: 'data' },
];

const NODE_MAP: ReadonlyMap<string, CoreNode> = new Map(NODES.map((n) => [n.id, n]));

const CORE_POSITION = { x: 320, y: 320 } as const;

/** Directed pairs; a thin path is drawn once per pair. */
const LINKS: readonly (readonly [string, string, boolean?])[] = [
  ['core', 'system'],
  ['core', 'component'],
  ['core', 'signal', true],
  ['core', 'module', true],
  ['system', 'module'],
  ['system', 'api'],
  ['component', 'signal'],
  ['component', 'data'],
  ['signal', 'module', true],
  ['module', 'api'],
  ['api', 'data'],
];

/** Smooth quadratic arc from a to b, pulled through the midpoint. */
function curve(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v));

/**
 * Digital Core — the hero's signature visual: software architecture rendered
 * as a physical object. A thin geometric framework of nodes and paths around a
 * single lit centre, drawn in SVG so it stays SSR-safe, resolution-independent
 * and cheap. Pointer movement tilts the whole stage and drifts the depth
 * layers by a few pixels — precise, never playful.
 */
@Component({
  selector: 'app-digital-core',
  imports: [CursorTarget, CursorInteractive],
  templateUrl: './digital-core.html',
  styleUrl: './digital-core.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DigitalCore {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly device = inject(DeviceCapability);
  private readonly motion = inject(Motion);
  private readonly teardown = asyncTeardown();

  protected readonly core = CORE_POSITION;
  protected readonly nodes = signal<CoreNode[]>([...NODES]);

  private readonly pointer = signal({ x: 0.5, y: 0.5 });

  protected readonly links = computed<CoreLink[]>(() => {
    const out: CoreLink[] = [];
    for (const [a, b, trail] of LINKS) {
      const from = a === 'core' ? CORE_POSITION : NODE_MAP.get(a);
      const to = b === 'core' ? CORE_POSITION : NODE_MAP.get(b);
      if (!from || !to) continue;
      out.push({
        id: `${a}-${b}`,
        d: curve(from.x, from.y, to.x, to.y),
        trail,
      });
    }
    return out;
  });

  constructor() {
    afterNextRender(() => void this.init());
  }

  private async init(): Promise<void> {
    const root = this.host.nativeElement;

    const onMove = (event: PointerEvent) => {
      this.pointer.set({ x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    this.teardown.register(() => window.removeEventListener('pointermove', onMove));

    if (!this.device.hasPrecisePointer()) return;
    const gsap = await this.motion.load();
    if (!gsap || this.teardown.destroyed) return;

    const stage = root.querySelector<HTMLElement>('.dc__stage');
    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-depth]'));
    if (!stage && layers.length === 0) return;

    const to = new Map<HTMLElement, { x: (v: number) => void; y: (v: number) => void }>();
    for (const layer of layers) {
      to.set(layer, {
        x: gsap.quickTo(layer, 'x', { duration: 1.2, ease: 'power3.out' }),
        y: gsap.quickTo(layer, 'y', { duration: 1.2, ease: 'power3.out' }),
      });
    }

    const tiltX = stage ? gsap.quickTo(stage, 'rotationY', { duration: 1.2, ease: 'power3.out' }) : null;
    const tiltY = stage ? gsap.quickTo(stage, 'rotationX', { duration: 1.2, ease: 'power3.out' }) : null;

    // Movement caps keep the whole interaction inside ~10px / a few degrees.
    const apply = () => {
      const p = this.pointer();
      const dx = (p.x - 0.5) * 2;
      const dy = (p.y - 0.5) * 2;
      for (const layer of layers) {
        const depth = Number(layer.dataset['depth'] ?? 1);
        const t = to.get(layer);
        if (!t) continue;
        t.x(clamp(dx * 3.5 * depth, 10));
        t.y(clamp(dy * 2.5 * depth, 10));
      }
      tiltX?.(dx * 5);
      tiltY?.(dy * -3.5);
    };

    let raf = 0;
    const loop = () => {
      apply();
      raf = requestAnimationFrame(loop);
    };
    loop();

    this.teardown.register(() => {
      cancelAnimationFrame(raf);
      for (const layer of layers) gsap.killTweensOf(layer);
      if (stage) gsap.killTweensOf(stage);
    });
  }
}
