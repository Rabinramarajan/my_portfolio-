import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DataService, trackById } from '../../core';
import { Breadcrumb, GradientTitle, AnimatedButton } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';
import { ResumeReader } from './resume-reader/resume-reader';

/** The five "files" browsable in the IDE-style resume view. */
type ResumeFile = 'identity' | 'experience' | 'skills' | 'projects' | 'education';

interface FileMeta {
  readonly id: ResumeFile;
  readonly name: string;
  readonly icon: string;
}

const FILES: readonly FileMeta[] = [
  { id: 'identity', name: '_identity.ts', icon: 'FileCode' },
  { id: 'experience', name: 'experience.log', icon: 'Terminal' },
  { id: 'skills', name: 'skills.json', icon: 'Code' },
  { id: 'projects', name: 'projects/', icon: 'Folder' },
  { id: 'education', name: 'education.md', icon: 'GraduationCap' },
];

/**
 * Resume page — reimagined as an interactive IDE. A file explorer switches
 * between resume "files" rendered with editor chrome (tabs, line gutter,
 * syntax accents, status bar). An "Open Reader" action launches a fullscreen
 * document reader ({@link ResumeReader}) for a print/PDF-ready view.
 */
@Component({
  selector: 'app-resume',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Breadcrumb, GradientTitle, AnimatedButton, ResumeReader],
  templateUrl: './resume.html',
  styleUrl: './resume.scss',
  host: { class: 'block' },
})
export class ResumePage {
  private readonly data = inject(DataService);

  protected readonly resume = this.data.load('resume');
  protected readonly profile = this.data.profile();
  protected readonly education = this.data.load('education');

  protected readonly files = FILES;
  protected readonly activeFile = signal<ResumeFile>('identity');
  protected readonly activeMeta = computed(
    () => FILES.find((f) => f.id === this.activeFile()) ?? FILES[0],
  );

  protected readonly readerOpen = signal(false);

  protected readonly trackById = trackById;

  protected select(id: ResumeFile): void {
    this.activeFile.set(id);
  }

  protected openReader(): void {
    this.readerOpen.set(true);
  }

  protected closeReader(): void {
    this.readerOpen.set(false);
  }
}
