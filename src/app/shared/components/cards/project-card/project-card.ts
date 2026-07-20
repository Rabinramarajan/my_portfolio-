import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { AnimatedButton } from '../../buttons/animated-button/animated-button';
import { Badge } from '../../ui/badge/badge';
import { GlassCard } from '../../ui/glass-card/glass-card';
import { CaseStudyDialog } from '../../overlay/case-study-dialog/case-study-dialog';
import { ProgressBar } from '../../ui/progress-bar/progress-bar';
import { AccentColor, Project, trackByValue } from '../../../../core';
import { Icon } from '../../ui/icon/icon';

export type ProjectView = 'grid' | 'list';

/** Short brand chip shown under a project description. */
interface TechChip {
  readonly label: string;
  /** Accent token driving the chip color (see project-card.scss). */
  readonly accent: AccentColor;
}

/** Label + color for known technologies (brand-icon row). */
const TECH_META: Readonly<Record<string, TechChip>> = {
  angular: { label: 'A', accent: 'red' },
  'ionic angular': { label: 'Io', accent: 'blue' },
  typescript: { label: 'TS', accent: 'blue' },
  javascript: { label: 'JS', accent: 'amber' },
  rxjs: { label: 'Rx', accent: 'violet' },
  'angular signals': { label: 'Sg', accent: 'purple' },
  'tailwind css': { label: 'Tw', accent: 'cyan' },
  'angular material': { label: 'M', accent: 'blue' },
  capacitor: { label: 'Cap', accent: 'cyan' },
  'rest apis': { label: 'API', accent: 'green' },
  'ai integration': { label: 'AI', accent: 'purple' },
};

/** Category → accent, with a sensible default for unmapped categories. */
function categoryAccent(category: string): AccentColor {
  const key = category.toLowerCase();
  if (key.includes('mobile')) return 'cyan';
  if (key.includes('ai') || key.includes('ml')) return 'violet';
  if (key.includes('dashboard')) return 'purple';
  if (key.includes('commerce')) return 'amber';
  return 'blue';
}

/** Project showcase card. Renders a finished or upcoming variant by `status`. */
@Component({
  selector: 'app-project-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, AnimatedButton, Badge, GlassCard, ProgressBar],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
  host: { class: 'block' },
})
export class ProjectCard {
  readonly project = input.required<Project>();
  readonly view = input<ProjectView>('grid');

  protected readonly isUpcoming = computed(() => this.project().status === 'upcoming');
  protected readonly categoryAccent = computed<AccentColor>(() =>
    categoryAccent(this.project().category),
  );

  protected readonly techChips = computed<readonly TechChip[]>(() =>
    this.project()
      .technologies.slice(0, 5)
      .map(
        (tech) => TECH_META[tech.toLowerCase()] ?? { label: tech.slice(0, 2), accent: 'purple' },
      ),
  );

  protected readonly imageUrl = computed<string>(() => {
    const image: string | readonly string[] = this.project().image;
    return (typeof image === 'string' ? image : image[0]) ?? '';
  });

  private readonly dialog = inject(MatDialog);

  /** Opens the case-study popup (MatDialog) for this project. */
  protected openCaseStudy(): void {
    this.dialog.open(CaseStudyDialog, {
      data: this.project(),
      panelClass: 'csd-dialog-panel',
      width: 'min(58rem, 94vw)',
      maxWidth: '94vw',
      autoFocus: 'dialog',
      restoreFocus: true,
    });
  }

  protected readonly trackByValue = trackByValue;
}
