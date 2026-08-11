import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-about-story',
  standalone: true,
  template: `
    <article class="about-story">
      <h3 class="about-story__eyebrow">ABOUT THE ENGINEER</h3>

      <div class="about-story__content">
        <p class="about-story__p">
          I'm Rabin R, a Senior Frontend Engineer with 4+ years of experience engineering critical web and mobile systems for government and enterprise clients — including immigration platforms for Fiji and pension portals serving thousands of active users.
        </p>

        <p class="about-story__p">
          I work at the intersection of interface design and frontend
          <span
            class="about-story__kw"
            [class.about-story__kw--active]="activeKeyword() === 'architecture'"
            (mouseenter)="activeKeyword.set('architecture')"
            (mouseleave)="activeKeyword.set(null)"
          >architecture</span>. My focus is building digital products that are visually precise, technically sound, and designed for maximum
          <span
            class="about-story__kw"
            [class.about-story__kw--active]="activeKeyword() === 'performance'"
            (mouseenter)="activeKeyword.set('performance')"
            (mouseleave)="activeKeyword.set(null)"
          >performance</span> under real-world conditions.
        </p>

        <p class="about-story__p">
          From high-consequence government case management to modern AI-driven analytics dashboards, I care deeply about the details users feel — speed, clarity,
          <span
            class="about-story__kw"
            [class.about-story__kw--active]="activeKeyword() === 'accessibility'"
            (mouseenter)="activeKeyword.set('accessibility')"
            (mouseleave)="activeKeyword.set(null)"
          >accessibility</span>, fluid
          <span
            class="about-story__kw"
            [class.about-story__kw--active]="activeKeyword() === 'interaction'"
            (mouseenter)="activeKeyword.set('interaction')"
            (mouseleave)="activeKeyword.set(null)"
          >interaction</span>, long-term
          <span
            class="about-story__kw"
            [class.about-story__kw--active]="activeKeyword() === 'scalability'"
            (mouseenter)="activeKeyword.set('scalability')"
            (mouseleave)="activeKeyword.set(null)"
          >scalability</span>, and pixel
          <span
            class="about-story__kw"
            [class.about-story__kw--active]="activeKeyword() === 'precision'"
            (mouseenter)="activeKeyword.set('precision')"
            (mouseleave)="activeKeyword.set(null)"
          >precision</span>.
        </p>
      </div>
    </article>
  `,
  styles: [`
    .about-story {
      max-width: 640px;
    }

    .about-story__eyebrow {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--color-text-faint);
      margin-block-end: var(--space-4);
    }

    .about-story__content {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .about-story__p {
      font-family: var(--font-sans);
      font-size: clamp(1.05rem, 1.3vw, 1.2rem);
      line-height: 1.7;
      color: var(--color-text-muted);
      margin: 0;
    }

    .about-story__kw {
      color: var(--color-text);
      font-weight: 500;
      cursor: pointer;
      position: relative;
      padding-inline: 0.15em;
      transition: color 0.3s ease, background 0.3s ease;
      border-bottom: 1px dotted var(--color-accent);

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--color-accent);
        opacity: 0;
        z-index: -1;
        transition: opacity 0.3s ease;
        border-radius: 2px;
      }

      &:hover,
      &--active {
        color: var(--color-accent-contrast);
        border-bottom-color: transparent;

        &::after {
          opacity: 1;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutStory {
  protected readonly activeKeyword = signal<string | null>(null);
}
