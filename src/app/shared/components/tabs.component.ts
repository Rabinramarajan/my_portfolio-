import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabItem {
  label: string;
  id: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tabs">
      <div class="tabs-nav" role="tablist">
        @for (tab of tabs; track tab.id) {
          <button
            [id]="'tab-' + tab.id"
            class="tab-button"
            [class.tab-active]="activeTab() === tab.id"
            [disabled]="tab.disabled"
            (click)="activeTab.set(tab.id)"
            [attr.aria-selected]="activeTab() === tab.id"
            role="tab"
          >
            {{ tab.label }}
          </button>
        }
      </div>
      <div class="tabs-content">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    .tabs {
      display: flex;
      flex-direction: column;

      .tabs-nav {
        display: flex;
        gap: var(--sp-1);
        border-bottom: 1px solid var(--border);
        overflow-x: auto;
      }

      .tab-button {
        padding: var(--sp-4) var(--sp-4);
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        color: var(--text-secondary);
        font-weight: var(--fw-medium);
        cursor: pointer;
        transition: all var(--dur-fast) var(--ease-out);
        white-space: nowrap;

        &:hover:not(:disabled) {
          color: var(--text);
        }

        &.tab-active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        &:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: -2px;
        }
      }

      .tabs-content {
        padding: var(--sp-6);
      }
    }
  `],
})
export class TabsComponent {
  @Input() tabs: TabItem[] = [];
  activeTab = signal<string>(this.tabs[0]?.id || '');

  constructor() {
    if (this.tabs.length > 0) {
      this.activeTab.set(this.tabs[0].id);
    }
  }
}

@Component({
  selector: 'app-tab-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isActive) {
      <div [attr.aria-labelledby]="'tab-' + tabId" role="tabpanel">
        <ng-content />
      </div>
    }
  `,
})
export class TabPanelComponent {
  @Input() tabId: string = '';
  @Input() isActive: boolean = false;
}
