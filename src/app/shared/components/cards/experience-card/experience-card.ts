import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Badge } from '../../ui/badge/badge';
import { GlassCard } from '../../ui/glass-card/glass-card';
import { EmploymentType, AccentColor, Experience, trackByValue, accentVar } from '../../../../core';
import { Icon } from '../../ui/icon/icon';

const TYPE_ACCENT: Readonly<Record<EmploymentType, AccentColor>> = {
  'Full Time': 'green',
  Freelance: 'blue',
  Contract: 'amber',
  Internship: 'violet',
};

/** Experience timeline card — role, company, type badge, blurb, achievements. */
@Component({
  selector: 'app-experience-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Badge, GlassCard],
  templateUrl: './experience-card.html',
  styleUrl: './experience-card.scss',
  host: { class: 'block' },
})
export class ExperienceCard {
  readonly experience = input.required<Experience>();

  protected readonly typeAccent = computed<AccentColor>(
    () => TYPE_ACCENT[this.experience().employmentType],
  );
  /** Resolved CSS colour for the card's accent (drives the --ec-accent var). */
  protected readonly accentColor = computed(() => accentVar(this.typeAccent()));
  protected readonly trackByValue = trackByValue;
}
