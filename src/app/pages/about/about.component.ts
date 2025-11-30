import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { PROFILE, SKILLS } from '../../core/data/portfolio.data';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFadeIn', [
      transition(':enter', [
        query('.stagger-item', [
          style({ opacity: 0, transform: 'translateY(30px) scale(0.95)' }),
          stagger(120, [
            animate('0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('highlightStagger', [
      transition(':enter', [
        query('.highlight-card', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class AboutComponent {
  profile = PROFILE;
  topSkills = SKILLS.filter(s => s.category === 'frontend').slice(0, 6);
  hoveredHighlight = signal<string | null>(null);

  highlights = [
    { id: 'code', icon: 'code', title: 'Clean Code', description: 'Writing maintainable, scalable, and well-documented code' },
    { id: 'architecture', icon: 'layers', title: 'Architecture', description: 'Designing modular and micro frontend architectures' },
    { id: 'performance', icon: 'zap', title: 'Performance', description: 'Optimizing applications for speed and efficiency' },
    { id: 'collaboration', icon: 'users', title: 'Collaboration', description: 'Working effectively in agile development teams' }
  ];

  setHoveredHighlight(id: string | null): void {
    this.hoveredHighlight.set(id);
  }

  isHighlightHovered(id: string): boolean {
    return this.hoveredHighlight() === id;
  }
}
