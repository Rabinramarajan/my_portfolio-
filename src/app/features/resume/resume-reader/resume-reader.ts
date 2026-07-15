import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  input,
  output,
} from '@angular/core';
import { type Education, type Profile, type ResumeConfig, trackById } from '../../../core';
import { Icon } from '../../../shared/components/ui/icon/icon';

/**
 * Fullscreen, print-ready resume document reader. Rendered only while open, so
 * its lifecycle drives the `<body>` scroll-lock: locked on create, released on
 * destroy (covers close, Escape and navigating away mid-open).
 */
@Component({
  selector: 'app-resume-reader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './resume-reader.html',
  styleUrl: './resume-reader.scss',
})
export class ResumeReader {
  readonly resume = input.required<ResumeConfig>();
  readonly profile = input<Profile | undefined>(undefined);
  readonly education = input<readonly Education[]>([]);

  readonly closed = output<void>();

  protected readonly trackById = trackById;

  private readonly document = inject(DOCUMENT);

  constructor() {
    this.document.body.classList.add('rz-lock');
    inject(DestroyRef).onDestroy(() => this.document.body.classList.remove('rz-lock'));
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closed.emit();
  }

  protected print(): void {
    this.document.defaultView?.print();
  }
}
