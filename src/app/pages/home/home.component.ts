import { Component, signal, OnInit, OnDestroy, ChangeDetectionStrategy, inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { PROFILE } from '../../core/data/portfolio.data';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class HomeComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  
  profile = PROFILE;
  isLoaded = signal(false);
  typedText = signal('');
  
  private roles = ['Frontend Developer', 'Angular Specialist', 'Ionic Expert', 'UI/UX Enthusiast'];
  private currentRoleIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private isDestroyed = false;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.isLoaded.set(true);
          this.cdr.markForCheck();
        });
        this.typeEffect();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  private typeEffect(): void {
    if (this.isDestroyed) return;
    
    const currentRole = this.roles[this.currentRoleIndex];
    
    if (this.isDeleting) {
      this.charIndex--;
    } else {
      this.charIndex++;
    }
    
    this.ngZone.run(() => {
      this.typedText.set(currentRole.substring(0, this.charIndex));
      this.cdr.markForCheck();
    });

    let typeSpeed = this.isDeleting ? 50 : 100;

    if (!this.isDeleting && this.charIndex === currentRole.length) {
      typeSpeed = 2000;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.currentRoleIndex = (this.currentRoleIndex + 1) % this.roles.length;
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
