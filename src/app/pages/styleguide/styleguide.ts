import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButtonDirective, UiInputDirective, UiBadgeComponent, UiCardComponent, UiSpinnerComponent } from '../../shared/ui';

interface Swatch { name: string; var: string; }

@Component({
  selector: 'app-styleguide',
  imports: [RouterLink, UiButtonDirective, UiInputDirective, UiBadgeComponent, UiCardComponent, UiSpinnerComponent],
  templateUrl: './styleguide.html',
  styleUrl: './styleguide.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Styleguide {
  protected readonly accents: Swatch[] = [
    { name: 'Primary', var: '--accent-primary' },
    { name: 'Secondary', var: '--accent-secondary' },
    { name: 'Tertiary', var: '--accent-tertiary' },
    { name: 'Blue', var: '--accent-blue' },
    { name: 'Cyan', var: '--accent-cyan' },
    { name: 'Emerald', var: '--accent-emerald' },
    { name: 'Amber', var: '--accent-amber' },
    { name: 'Rose', var: '--accent-rose' },
  ];

  protected readonly surfaces: Swatch[] = [
    { name: 'BG Primary', var: '--bg-primary' },
    { name: 'BG Secondary', var: '--bg-secondary' },
    { name: 'BG Card', var: '--bg-card' },
    { name: 'BG Elevated', var: '--bg-elevated' },
  ];

  protected readonly texts: Swatch[] = [
    { name: 'Text Primary', var: '--text-primary' },
    { name: 'Text Secondary', var: '--text-secondary' },
    { name: 'Text Tertiary', var: '--text-tertiary' },
    { name: 'Text Muted', var: '--text-muted' },
  ];

  protected readonly spacing = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-6', '--space-8', '--space-12', '--space-16'];
  protected readonly radii = ['--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-2xl'];
  protected readonly shadows = ['--shadow-sm', '--shadow-md', '--shadow-lg', '--shadow-xl', '--shadow-glow'];
  protected readonly transitions = [
    { name: 'fast', var: '--transition-fast' },
    { name: 'base', var: '--transition-base' },
    { name: 'slow', var: '--transition-slow' },
    { name: 'spring', var: '--transition-spring' },
  ];
}
