import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, stagger, query, keyframes } from '@angular/animations';
import { PROJECTS, Project } from '../../core/data/portfolio.data';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerProjects', [
      transition(':enter', [
        query('.project-card', [
          style({ opacity: 0, transform: 'translateY(40px) scale(0.95)' }),
          stagger(120, [
            animate('0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('modalSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9) translateY(20px)' }),
        animate('0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ])
    ]),
    trigger('modalStaggerContent', [
      transition(':enter', [
        query('.modal-section', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(80, [
            animate('0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ProjectsComponent {
  projects = PROJECTS;
  activeProject = signal<Project | null>(null);
  hoveredCardId = signal<string | null>(null);

  openProject(project: Project): void {
    this.activeProject.set(project);
  }

  closeModal(): void {
    this.activeProject.set(null);
  }

  onModalBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  setHoveredCard(projectId: string | null): void {
    this.hoveredCardId.set(projectId);
  }

  isCardHovered(projectId: string): boolean {
    return this.hoveredCardId() === projectId;
  }
}
