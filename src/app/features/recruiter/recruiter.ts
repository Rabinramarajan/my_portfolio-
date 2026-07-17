import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService, trackById } from '../../core';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

type ResumeVersion = 'Frontend' | 'Full Stack' | 'Freelance';

/** Recruiter Experience page — one-stop for hiring and interview prep. */
@Component({
  selector: 'app-recruiter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, PageLayout, GlassCard, Stagger, FormsModule],
  templateUrl: './recruiter.html',
  styleUrl: './recruiter.scss',
  host: { class: 'block' },
})
export class RecruiterPage {
  private readonly data = inject(DataService);

  protected readonly recruiter = this.data.load('recruiter');
  protected readonly resumeVersions = this.data.load('resume-versions');

  protected readonly resumeVersion = signal<ResumeVersion>('Frontend');
  protected readonly selectedCategory = signal<string>('All');
  protected readonly showWizard = signal(false);
  protected readonly wizardStep = signal(1);

  protected readonly trackById = trackById;

  protected selectResumeVersion(version: ResumeVersion): void {
    this.resumeVersion.set(version);
  }

  protected selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  protected filteredInterviews(interviews: readonly any[]) {
    const category = this.selectedCategory();
    return category === 'All' ? interviews : interviews.filter((q) => q.category === category);
  }

  protected nextStep(): void {
    if (this.wizardStep() < 4) {
      this.wizardStep.update((s) => s + 1);
    }
  }

  protected prevStep(): void {
    if (this.wizardStep() > 1) {
      this.wizardStep.update((s) => s - 1);
    }
  }

  protected closeWizard(): void {
    this.showWizard.set(false);
    this.wizardStep.set(1);
  }

  protected formatSalary(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
}
