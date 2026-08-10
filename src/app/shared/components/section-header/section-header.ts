import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Reveal } from '../../directives/reveal';
import { TextReveal } from '../text-reveal/text-reveal';

/** Index + eyebrow + editorial heading, used to open every major section. */
@Component({
  selector: 'app-section-header',
  imports: [Reveal, TextReveal],
  templateUrl: './section-header.html',
  styleUrl: './section-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeader {
  /** Two-digit section index, e.g. "02". */
  readonly index = input<string>();
  readonly eyebrow = input<string>();
  readonly heading = input.required<string>();
  readonly lede = input<string>();
  readonly align = input<'start' | 'center'>('start');
  /**
   * Heading level, so section order stays semantically correct. Level 1 is for
   * the header that opens a page — a page with no `h1` is a page search engines
   * and screen readers have to guess the subject of.
   */
  readonly level = input<1 | 2 | 3>(2);
}
