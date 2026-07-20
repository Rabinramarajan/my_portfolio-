import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AccentColor, Project } from '../../../../core';
import { AnimatedButton } from '../../buttons/animated-button/animated-button';
import { Badge } from '../../ui/badge/badge';
import { Icon } from '../../ui/icon/icon';
import { ProgressBar } from '../../ui/progress-bar/progress-bar';

/** Category → accent, mirrors the project-card mapping. */
function categoryAccent(category: string): AccentColor {
  const key = category.toLowerCase();
  if (key.includes('mobile')) return 'cyan';
  if (key.includes('ai') || key.includes('ml')) return 'violet';
  if (key.includes('dashboard')) return 'purple';
  if (key.includes('commerce')) return 'amber';
  return 'blue';
}

/** Case-study popup opened via MatDialog from a project card. */
@Component({
  selector: 'app-case-study-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Badge, ProgressBar, AnimatedButton],
  templateUrl: './case-study-dialog.html',
  styleUrl: './case-study-dialog.scss',
})
export class CaseStudyDialog {
  protected readonly project = inject<Project>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CaseStudyDialog>);

  protected readonly isUpcoming = computed(() => this.project.status === 'upcoming');
  protected readonly categoryAccent = categoryAccent(this.project.category);

  protected readonly images = computed<string[]>(() => {
    const image = this.project.image;
    return typeof image === 'string' ? [image] : [...image];
  });
  protected readonly currentImageIndex = signal(0);
  protected readonly selectedImage = computed(() => this.images()[this.currentImageIndex()] ?? '');
  protected readonly hasMultipleImages = computed(() => this.images().length > 1);

  protected prevImage(): void {
    const len = this.images().length;
    this.currentImageIndex.update((i) => (i - 1 + len) % len);
  }

  protected nextImage(): void {
    const len = this.images().length;
    this.currentImageIndex.update((i) => (i + 1) % len);
  }

  protected close(): void {
    this.dialogRef.close();
  }
}
