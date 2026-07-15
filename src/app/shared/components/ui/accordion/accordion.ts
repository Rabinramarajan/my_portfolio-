import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { Icon } from '../icon/icon';


export interface AccordionItem {
  readonly title: string;
  readonly content: string;
}

/** Single-open accordion. */
@Component({
  selector: 'app-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="acc">
      @for (item of items(); track $index; let i = $index) {
        <div class="acc__item">
          <button
            type="button"
            class="acc__trigger"
            [attr.aria-expanded]="i === openIndex()"
            (click)="toggle(i)"
          >
            {{ item.title }}
            <app-icon
              name="ChevronDown"
              [size]="16"
              class="acc__chevron"
              [class.acc__chevron--open]="i === openIndex()"
              aria-hidden="true"
            />
          </button>
          @if (i === openIndex()) {
            <div class="acc__panel">{{ item.content }}</div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .acc {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .acc__item {
      overflow: hidden;
      border-radius: 0.75rem;
      border: 1px solid var(--color-border-subtle);
    }
    .acc__trigger {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-fg);
      background: none;
      border: 0;
      cursor: pointer;
    }
    .acc__chevron {
      flex-shrink: 0;
      transition: transform 0.2s;
    }
    .acc__chevron--open {
      transform: rotate(180deg);
    }
    .acc__panel {
      padding: 0 1rem 0.75rem;
      font-size: 0.875rem;
      color: var(--color-fg-muted);
    }
  `,
})
export class Accordion {
  readonly items = input.required<readonly AccordionItem[]>();

  protected readonly openIndex = signal(0);

  protected toggle(i: number): void {
    this.openIndex.update((current) => (current === i ? -1 : i));
  }
}
