import { Component, signal, OnInit, OnDestroy, ChangeDetectionStrategy, inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { SKILLS, Skill } from '../../core/data/portfolio.data';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerSkills', [
      transition(':enter', [
        query('.skill-item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(50, [
            animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class SkillsComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  
  skills = SKILLS;
  activeCategory = signal<string>('all');
  animatedSkills = signal<Map<string, number>>(new Map());
  
  categories = [
    { id: 'all', label: 'All Skills' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'tools', label: 'Tools & DevOps' }
  ];

  private timeoutIds: ReturnType<typeof setTimeout>[] = [];
  private animationFrameIds: number[] = [];
  private isDestroyed = false;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const timeoutId = setTimeout(() => this.animateSkills(), 500);
      this.timeoutIds.push(timeoutId);
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.animationFrameIds.forEach(id => cancelAnimationFrame(id));
  }

  get filteredSkills(): Skill[] {
    const category = this.activeCategory();
    if (category === 'all') return this.skills;
    return this.skills.filter(s => s.category === category);
  }

  setCategory(category: string): void {
    this.activeCategory.set(category);
    this.animatedSkills.set(new Map());
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.animationFrameIds.forEach(id => cancelAnimationFrame(id));
    this.timeoutIds = [];
    this.animationFrameIds = [];
    
    const timeoutId = setTimeout(() => this.animateSkills(), 100);
    this.timeoutIds.push(timeoutId);
  }

  getAnimatedLevel(skillName: string): number {
    return this.animatedSkills().get(skillName) || 0;
  }

  private animateSkills(): void {
    if (this.isDestroyed) return;
    
    const skills = this.filteredSkills;
    const map = new Map<string, number>();
    
    skills.forEach((skill, index) => {
      const timeoutId = setTimeout(() => {
        if (!this.isDestroyed) {
          this.animateValue(skill.name, 0, skill.level, 1000, map);
        }
      }, index * 100);
      this.timeoutIds.push(timeoutId);
    });
  }

  private animateValue(
    name: string,
    start: number,
    end: number,
    duration: number,
    map: Map<string, number>
  ): void {
    if (this.isDestroyed) return;
    
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      if (this.isDestroyed) return;
      
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeOut);
      
      map.set(name, current);
      
      this.ngZone.run(() => {
        this.animatedSkills.set(new Map(map));
        this.cdr.markForCheck();
      });
      
      if (progress < 1) {
        const frameId = requestAnimationFrame(animate);
        this.animationFrameIds.push(frameId);
      }
    };
    
    const frameId = requestAnimationFrame(animate);
    this.animationFrameIds.push(frameId);
  }
}
