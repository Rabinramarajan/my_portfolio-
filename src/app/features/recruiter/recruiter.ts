import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService, trackById } from '../../core';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

/**
 * Recruiter page — a recruiter-facing snapshot: profile card, headline stats,
 * core expertise, experience highlights, value proposition and a hiring CTA.
 * Identity comes from profile.json; the recruiter copy lives in recruiter.json
 * under `overview`.
 */
@Component({
  selector: 'app-recruiter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, RouterLink, PageLayout, GlassCard, Stagger],
  templateUrl: './recruiter.html',
  styleUrl: './recruiter.scss',
  host: { class: 'block' },
})
export class RecruiterPage {
  private readonly data = inject(DataService);

  private readonly recruiter = this.data.load('recruiter');
  private readonly profileResource = this.data.load('profile');

  protected readonly isLoading = this.recruiter.isLoading;
  protected readonly trackById = trackById;

  protected readonly overview = computed(() => this.recruiter.value()?.overview ?? null);
  protected readonly profile = computed(() => this.profileResource.value() ?? null);

  protected readonly resumeUrl = computed(
    () => this.profile()?.resumeUrl ?? 'assets/files/rabin-cv.pdf',
  );
}
