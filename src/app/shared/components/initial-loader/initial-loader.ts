import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewChild, afterNextRender, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../../core/services/loader';
import gsap from 'gsap';

@Component({
  selector: 'app-initial-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './initial-loader.html',
  styleUrl: './initial-loader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InitialLoader {
  private readonly loader = inject(LoaderService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly el = inject(ElementRef);

  @ViewChild('line', { static: false }) lineRef?: ElementRef<HTMLElement>;
  @ViewChild('container', { static: false }) containerRef?: ElementRef<HTMLElement>;
  @ViewChild('textStage', { static: false }) textStageRef?: ElementRef<HTMLElement>;

  readonly state = this.loader.state;
  readonly isReturnVisit = this.loader.isReturnVisit;
  
  readonly isHidden = computed(() => this.state() === 'complete');
  
  // Texts for the progress animation
  readonly stages = [
    'INITIALIZING EXPERIENCE',
    'LOADING INTERFACE',
    'PREPARING SYSTEM',
    'READY'
  ];

  constructor() {
    afterNextRender(() => {
      // In the browser, start the sequence
      this.playAnimation();
    });
  }

  private playAnimation(): void {
    const isReturn = this.isReturnVisit();
    
    // Safety fallback: if motion is disabled, speed it up massively
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          this.loader.complete();
        }
      });

      if (isReturn || prefersReducedMotion) {
        // Fast sequence for return visitors or reduced motion
        tl.to('.loader', {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          delay: 0.3
        });
      } else {
        // Full cinematic signature sequence
        
        // 1. Line draws in from left to center
        tl.to('.loader__line', {
          scaleX: 0.1, // Center dot
          duration: 0.6,
          ease: 'expo.out'
        });

        // 2. Identity and text fade in around the center dot
        tl.to('.loader__content', {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out'
        }, "-=0.3");

        // 3. Text stages swapping (we do this by staggering the opacity of the texts)
        const texts = gsap.utils.toArray<HTMLElement>('.loader__stage-text');
        if (texts.length > 0) {
          texts.forEach((text: HTMLElement, i: number) => {
            if (i > 0) {
              tl.to(texts[i - 1], { opacity: 0, duration: 0.2, ease: 'power1.inOut' }, `+=${0.1}`);
              tl.to(text, { opacity: 1, duration: 0.2, ease: 'power1.inOut' }, "<");
            }
          });
        }

        // Wait for the app to signal readiness
        tl.add(() => {
          if (this.state() !== 'ready') {
            tl.pause();
            // Resume when the state changes to 'ready'
            const sub = effect(() => {
              if (this.loader.state() === 'ready') {
                tl.play();
              }
            });
            this.destroyRef.onDestroy(() => sub.destroy());
          }
        });

        // 4. Line expands outward
        tl.to('.loader__line', {
          scaleX: 1,
          duration: 0.6,
          ease: 'expo.inOut'
        }, "+=0.2");

        // 5. Container splits/wipes away to reveal the homepage
        tl.to('.loader', {
          clipPath: 'inset(50% 0 50% 0)', // wipes to the center horizontally
          opacity: 0,
          duration: 0.8,
          ease: 'expo.inOut'
        }, "-=0.2");
      }
    }, this.el.nativeElement);

    this.destroyRef.onDestroy(() => ctx.revert());
  }
}
