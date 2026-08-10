import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

import { DeviceCapability } from '../../../core/services/device-capability';
import { asyncTeardown } from '../../utils/async-teardown';

/**
 * Cursor-reactive particle field behind the hero.
 *
 * Three.js is dynamically imported and only ever runs when `webglEnabled` is
 * true — the component renders a CSS light-field on the server, on mobile, on
 * low-power hardware, under save-data and under reduced motion, which is the
 * majority path. Everything the scene allocates is disposed on destroy.
 */
@Component({
  selector: 'app-webgl-field',
  templateUrl: './webgl-field.html',
  styleUrl: './webgl-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebglField {
  private readonly device = inject(DeviceCapability);
  private readonly teardown = asyncTeardown();
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly performanceTier = this.device.performanceTier;

  constructor() {
    afterNextRender(() => {
      // Defer WebGL initialization heavily so it doesn't block initial page load or TBT.
      setTimeout(() => {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => void this.start());
        } else {
          this.start();
        }
      }, 2500);
    });
  }

  private async start(): Promise<void> {
    const canvas = this.canvasRef()?.nativeElement;
    const tier = this.performanceTier();
    if (!canvas || tier === 'disabled') return;

    const THREE = await import('three');
    // The view can be torn down while Three.js is still downloading.
    if (this.teardown.destroyed) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 14;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    
    // Scale quality based on tier
    const dpr = tier === 'high' ? Math.min(window.devicePixelRatio, 1.5) : 
                tier === 'medium' ? Math.min(window.devicePixelRatio, 1.25) : 1.0;
    renderer.setPixelRatio(dpr);

    const COUNT = tier === 'high' ? 2600 : tier === 'medium' ? 1200 : 400;
    const positions = new Float32Array(COUNT * 3);
    const scales = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 34;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
      scales[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2() },
        uAccent: { value: new THREE.Color('#c9f24d') },
        uBase: { value: new THREE.Color('#8fa0b8') },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform vec2 uPointer;
        attribute float aScale;
        varying float vScale;

        void main() {
          vScale = aScale;
          vec3 pos = position;
          // Slow drift, phase-offset per particle so the field never pulses in unison.
          pos.y += sin(uTime * 0.28 + position.x * 0.35) * 0.55;
          pos.x += cos(uTime * 0.22 + position.y * 0.30) * 0.45;
          // Pointer pushes the field gently, scaled by depth for parallax.
          pos.xy += uPointer * (1.6 + aScale * 2.2);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (7.0 + aScale * 22.0) * (1.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uAccent;
        uniform vec3 uBase;
        varying float vScale;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, d) * (0.10 + vScale * 0.35);
          vec3 color = mix(uBase, uAccent, step(0.93, vScale));
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (event: PointerEvent) => {
      pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = -(event.clientY / window.innerHeight - 0.5) * 2;
    };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas.parentElement ?? canvas;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    let frame = 0;
    let running = true;
    // `THREE.Clock` is deprecated; the shader only needs elapsed seconds, and
    // reading the rAF timestamp avoids both the deprecation and an extra object.
    const startedAt = performance.now();

    const render = () => {
      if (!running) return;
      frame = requestAnimationFrame(render);
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;
      material.uniforms['uTime'].value = (performance.now() - startedAt) / 1000;
      material.uniforms['uPointer'].value.set(pointer.x, pointer.y);
      points.rotation.y += 0.0004;
      renderer.render(scene, camera);
    };

    // A backgrounded tab should cost nothing.
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frame);
      } else if (!running) {
        running = true;
        render();
      }
    };

    resize();
    render();
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    this.teardown.register(() => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    });
  }
}
