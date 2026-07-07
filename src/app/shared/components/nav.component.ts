import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from './icon.component';

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  external?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <nav class="nav" [class.nav-mobile-open]="mobileOpen()" role="navigation">
      <!-- Mobile toggle -->
      <div class="nav-header">
        <div class="nav-logo">
          <ng-content select="[nav-logo]" />
        </div>
        <button
          class="nav-mobile-toggle"
          (click)="toggleMobile()"
          [attr.aria-label]="mobileOpen() ? 'Close menu' : 'Open menu'"
        >
          <app-icon [name]="mobileOpen() ? 'x' : 'menu'" [size]="24" />
        </button>
      </div>

      <!-- Nav links -->
      <div class="nav-menu">
        @for (item of items; track item.href) {
          <a
            [href]="item.href"
            [target]="item.external ? '_blank' : null"
            [rel]="item.external ? 'noopener noreferrer' : null"
            class="nav-link"
            (click)="closeMobile()"
          >
            @if (item.icon) {
              <app-icon [name]="item.icon" [size]="18" />
            }
            <span>{{ item.label }}</span>
            @if (item.badge) {
              <span class="nav-badge">{{ item.badge }}</span>
            }
          </a>
        }
        <ng-content select="[nav-actions]" />
      </div>
    </nav>

    <!-- Mobile overlay -->
    @if (mobileOpen()) {
      <div class="nav-overlay" (click)="closeMobile()"></div>
    }
  `,
  styles: [`
    .nav {
      display: flex;
      flex-direction: column;
      background: var(--bg);
      border-bottom: 1px solid var(--border);
      z-index: var(--z-nav);

      .nav-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--sp-4);
        gap: var(--sp-4);

        .nav-logo {
          font-weight: var(--fw-semibold);
          font-size: var(--text-lg);
        }

        .nav-mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--text);
          cursor: pointer;
          padding: var(--sp-2);

          @media (max-width: 768px) {
            display: flex;
          }
        }
      }

      .nav-menu {
        display: flex;
        align-items: center;
        gap: var(--sp-1);
        padding: 0 var(--sp-4);

        @media (max-width: 768px) {
          flex-direction: column;
          gap: 0;
          max-height: 0;
          overflow: hidden;
          transition: max-height var(--dur-base) var(--ease-out);
          padding: 0;
        }
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        padding: var(--sp-3) var(--sp-4);
        color: var(--text-secondary);
        text-decoration: none;
        font-size: var(--text-sm);
        transition: all var(--dur-fast) var(--ease-out);
        white-space: nowrap;
        position: relative;

        &:hover {
          color: var(--accent);
          background: var(--surface-hover);
        }

        &:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: -4px;
        }

        @media (max-width: 768px) {
          width: 100%;
          padding: var(--sp-4);
          border-top: 1px solid var(--border);
        }
      }

      .nav-badge {
        font-size: var(--text-xs);
        background: rgb(110 86 207 / 0.15);
        color: var(--accent);
        padding: 2px 6px;
        border-radius: var(--r-full);
      }

      &.nav-mobile-open {
        .nav-menu {
          max-height: 100vh;
        }
      }
    }

    .nav-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgb(0 0 0 / 0.5);
      z-index: calc(var(--z-nav) - 1);

      @media (max-width: 768px) {
        display: block;
      }
    }
  `],
})
export class NavComponent {
  @Input() items: NavItem[] = [];
  @Output() itemClick = new EventEmitter<NavItem>();

  mobileOpen = signal(false);

  toggleMobile() {
    this.mobileOpen.update(v => !v);
  }

  closeMobile() {
    this.mobileOpen.set(false);
  }
}
