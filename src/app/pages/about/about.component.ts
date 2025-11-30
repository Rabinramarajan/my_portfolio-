import { Component, ChangeDetectionStrategy } from '@angular/core';
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
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFadeIn', [
      transition(':enter', [
        query('.stagger-item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(80, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class AboutComponent {
  profile = PROFILE;
  topSkills = SKILLS.filter(s => s.category === 'frontend').slice(0, 6);

  highlights = [
    { icon: 'code', title: 'Clean Code', description: 'Writing maintainable, scalable, and well-documented code' },
    { icon: 'layers', title: 'Architecture', description: 'Designing modular and micro frontend architectures' },
    { icon: 'zap', title: 'Performance', description: 'Optimizing applications for speed and efficiency' },
    { icon: 'users', title: 'Collaboration', description: 'Working effectively in agile development teams' }
  ];
}
