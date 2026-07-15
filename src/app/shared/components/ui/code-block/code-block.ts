import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Icon } from '../icon/icon';


/** Code snippet with a copy-to-clipboard action. */
@Component({
  selector: 'app-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="code">
      <pre class="code__pre"><code>{{ code() }}</code></pre>
      <button type="button" class="code__copy" (click)="copy()">
        <app-icon [name]="copied() ? 'Check' : 'Copy'" [size]="14" aria-hidden="true" />
        {{ copied() ? 'Copied' : 'Copy Code' }}
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .code {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      border-radius: 0.75rem;
      border: 1px solid var(--color-border-subtle);
      background: rgb(0 0 0 / 40%);
      padding: 0.75rem 1rem;
    }
    .code__pre {
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.75rem;
      line-height: 1.625;
      color: var(--color-fg-muted);
      margin: 0;
    }
    .code__copy {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      gap: 0.375rem;
      border-radius: 0.5rem;
      border: 1px solid var(--color-border-subtle);
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      color: var(--color-fg-muted);
      background: none;
      cursor: pointer;
      transition: color 0.15s;
    }
    .code__copy:hover {
      color: var(--color-fg);
    }
  `,
})
export class CodeBlock {
  private readonly document = inject(DOCUMENT);

  readonly code = input.required<string>();

  protected readonly copied = signal(false);

  protected copy(): void {
    void this.document.defaultView?.navigator.clipboard.writeText(this.code()).then(() => {
      this.copied.set(true);
      this.document.defaultView?.setTimeout(() => this.copied.set(false), 1500);
    });
  }
}
