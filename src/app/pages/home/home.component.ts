import { Component, signal, computed, effect, afterNextRender, viewChild, inject, PLATFORM_ID, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { PROFILE } from '../../core/data/portfolio.data';
import { ExperienceService } from '../../shared/service/experience/experience.service';
import { ExperienceYearsPipe } from '../../shared/pipes/experience-calculate/experience-duration.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ExperienceYearsPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFadeIn', [
      transition(':enter', [
        query('.stagger-item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('0.5s 0.3s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class HomeComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly experience = inject(ExperienceService);
  private readonly destroyRef = inject(DestroyRef);

  // Signal-based view query
  bannerVideo = viewChild<ElementRef<HTMLVideoElement>>('bannerVideo');

  // State signals
  profile = PROFILE;
  isLoaded = signal(false);
  typedText = signal('');

  // Typing animation state
  private readonly roles = [
    'Angular Frontend Developer',
    'Ionic App Developer',
    'Enterprise Web Application Developer',
    'Mobile App Developer with Ionic',
    'Cross-Platform App Developer',
    'Frontend Engineer'
  ];
  private currentRoleIndex = signal(0);
  private charIndex = signal(0);
  private isDeleting = signal(false);
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  // Computed values
  currentRole = computed(() => this.roles[this.currentRoleIndex()]);
  experienceDate = signal<any>("");

  constructor() {
    const startDate = new Date('2022-06-28');
    this.experienceDate.set(this.experience.getExperienceYears(startDate));
    // Initialize component after render
    if (isPlatformBrowser(this.platformId)) {
      // Start typing effect after initial load
      afterNextRender(() => {
        this.isLoaded.set(true);
        this.startTypingAnimation();
      });

      // Handle video autoplay after view is ready
      afterNextRender(() => {
        const videoElement = this.bannerVideo();
        if (videoElement) {
          this.initializeVideo(videoElement.nativeElement);
        }
      });
    }

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    });
  }

  private initializeVideo(video: HTMLVideoElement): void {
    video.muted = true; // Ensure muted for autoplay policies
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Auto-play was prevented:', error);
        // Try to play on user interaction
        document.addEventListener('click', () => {
          video.play().catch(e => console.log('Play error:', e));
        }, { once: true });
      });
    }
  }

  private startTypingAnimation(): void {
    this.typeEffect();
  }

  private typeEffect(): void {
    const role = this.currentRole();
    const currentChar = this.charIndex();
    const deleting = this.isDeleting();

    // Update character index
    if (deleting) {
      this.charIndex.update(i => i - 1);
    } else {
      this.charIndex.update(i => i + 1);
    }

    // Update displayed text
    this.typedText.set(role.substring(0, this.charIndex()));

    let typeSpeed = deleting ? 50 : 100;

    if (!deleting && currentChar === role.length) {
      typeSpeed = 2000;
      this.isDeleting.set(true);
    } else if (deleting && currentChar === 0) {
      this.isDeleting.set(false);
      this.currentRoleIndex.update(i => (i + 1) % this.roles.length);
      typeSpeed = 500;
    }

    this.timeoutId = setTimeout(() => this.typeEffect(), typeSpeed);
  }

  scrollToAbout(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  }
}
