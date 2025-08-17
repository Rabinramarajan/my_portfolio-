import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, Signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypewriterDirective } from '../../directives/typewriter.directive';

export interface HelloProfile {
  name: string;
  githubLink: string;
}

export interface HelloGameState {
  isPlaying: boolean;
  foodLeft: number;
  score: number;
  gameCompleted: boolean;
}

@Component({
  selector: 'app-hello-section',
  standalone: true,
  imports: [CommonModule, TypewriterDirective],
  templateUrl: './hello-section.html',
  styleUrls: ['./hello-section.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelloSectionComponent {
  @Input({ required: true }) profile!: HelloProfile;
  @Input({ required: true }) jobTitleStrings!: string[];
  // Accept a Signal so templates can call gameState().prop like the parent did
  @Input({ required: true }) gameState!: Signal<HelloGameState>;

  @Output() openRequested = new EventEmitter<string>();

  @ViewChild(TypewriterDirective) private typewriter?: TypewriterDirective;

  onOpenGithub(): void {
    if (this.profile?.githubLink) {
      this.openRequested.emit(this.profile.githubLink);
    }
  }

  async copyGithubLink(): Promise<void> {
    const url = this.profile?.githubLink || '';
    if (!url) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      this.showCopiedHint();
    } catch {
      // swallow copy failures silently
    }
  }

  copied = false;
  private copiedTimer?: number;
  private showCopiedHint(): void {
    this.copied = true;
    if (this.copiedTimer) window.clearTimeout(this.copiedTimer);
    this.copiedTimer = window.setTimeout(() => (this.copied = false), 1500);
  }
}
