import { Component, Input, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NpmPackage {
  id: string;
  name: string;
  tagline: string;
  description: string;
  version: string;
  badge?: { label: string; value: string; color?: string };
  features: string[];
  stats: Array<{ label: string; value: string }>;
  installation: string;
  links: {
    npm: string;
    github: string;
    docs: string;
    demo: string;
  };
}

@Component({
  selector: 'app-open-source',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="open-source-container">
      @for (pkg of packages; track pkg.id) {
        <div class="npm-card animate-fade-in-scale">
          <!-- Header -->
          <div class="npm-header">
            <div class="npm-title-group">
              <h3 class="npm-name">{{ pkg.name }}</h3>
              <p class="npm-tagline">{{ pkg.tagline }}</p>
            </div>
            @if (pkg.badge) {
              <div class="npm-badge" [style.border-color]="pkg.badge.color || '#10b981'">
                <span class="badge-label">{{ pkg.badge.label }}</span>
                <span class="badge-value" [style.color]="pkg.badge.color || '#10b981'">{{ pkg.badge.value }}</span>
              </div>
            }
          </div>

          <!-- Description -->
          <p class="npm-description">{{ pkg.description }}</p>

          <!-- Features -->
          <div class="npm-features">
            <h4 class="features-title">Features</h4>
            <ul class="features-list">
              @for (feature of pkg.features; track feature) {
                <li class="feature-item">{{ feature }}</li>
              }
            </ul>
          </div>

          <!-- Stats Grid -->
          <div class="npm-stats">
            @for (stat of pkg.stats; track stat.label) {
              <div class="stat-box">
                <span class="stat-value">{{ stat.value }}</span>
                <span class="stat-label">{{ stat.label }}</span>
              </div>
            }
          </div>

          <!-- Installation -->
          <div class="npm-install">
            <span class="install-label">Installation</span>
            <div class="install-command">
              <code>{{ pkg.installation }}</code>
              <button class="copy-btn" (click)="copyToClipboard(pkg.installation)" title="Copy to clipboard">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Links -->
          <div class="npm-links">
            <a [href]="pkg.links.npm" target="_blank" rel="noopener noreferrer" class="npm-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 6H3v12h3v2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3v2zm14 0a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3v-2h3V6h-3V4h3zm-2 6h-8v2h8v-2z"/>
              </svg>
              npm
            </a>
            <a [href]="pkg.links.github" target="_blank" rel="noopener noreferrer" class="npm-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a [href]="pkg.links.docs" target="_blank" rel="noopener noreferrer" class="npm-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="11" x2="12" y2="17"></line>
                <line x1="9" y1="14" x2="15" y2="14"></line>
              </svg>
              Docs
            </a>
            <a [href]="pkg.links.demo" target="_blank" rel="noopener noreferrer" class="npm-link npm-link-demo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Live Demo
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .open-source-container {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .npm-card {
      padding: 32px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.3), transparent);
        opacity: 0;
      }

      &:hover {
        border-color: rgba(124, 58, 237, 0.3);
        background: rgba(124, 58, 237, 0.05);
        transform: translateY(-4px);
        box-shadow: 0 8px 32px rgba(124, 58, 237, 0.1);

        &::before { opacity: 1; }
      }
    }

    .npm-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .npm-title-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .npm-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.95);
      margin: 0;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.02em;
    }

    .npm-tagline {
      font-size: 0.95rem;
      font-weight: 500;
      color: #a78bfa;
      margin: 0;
    }

    .npm-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px 16px;
      border: 2px solid;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.02);
      min-width: fit-content;
      flex-shrink: 0;
    }

    .badge-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255, 255, 255, 0.6);
    }

    .badge-value {
      font-size: 1rem;
      font-weight: 700;
    }

    .npm-description {
      font-size: 0.95rem;
      line-height: 1.7;
      color: rgba(255, 255, 255, 0.75);
      margin: 0;
    }

    .npm-features {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .features-title {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent-primary);
      margin: 0;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .feature-item {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: flex-start;
      gap: 8px;

      &::before {
        content: '✓';
        color: #10b981;
        font-weight: 700;
        flex-shrink: 0;
      }
    }

    .npm-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .stat-box {
      padding: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      text-align: center;
    }

    .stat-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent-primary);
    }

    .stat-label {
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(255, 255, 255, 0.5);
    }

    .npm-install {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      background: rgba(124, 58, 237, 0.08);
      border: 1px solid rgba(124, 58, 237, 0.2);
      border-radius: 8px;
    }

    .install-label {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #a78bfa;
    }

    .install-command {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'Courier New', monospace;
    }

    .install-command code {
      flex: 1;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.85);
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      word-break: break-all;
    }

    .copy-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s ease;

      &:hover {
        color: var(--accent-primary);
      }
    }

    .npm-links {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .npm-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 14px;
      border: 1px solid rgba(124, 58, 237, 0.3);
      border-radius: 6px;
      background: rgba(124, 58, 237, 0.08);
      color: #a78bfa;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(124, 58, 237, 0.15);
        border-color: rgba(124, 58, 237, 0.5);
        color: #c4b5fd;
      }

      &.npm-link-demo {
        grid-column: 1 / -1;
        background: rgba(124, 58, 237, 0.15);
        border-color: rgba(124, 58, 237, 0.4);

        &:hover {
          background: rgba(124, 58, 237, 0.25);
        }
      }
    }

    @media (max-width: 768px) {
      .open-source-container {
        grid-template-columns: 1fr;
      }

      .npm-card {
        padding: 24px;
        gap: 16px;
      }

      .npm-header {
        flex-direction: column;
      }

      .npm-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .npm-links {
        grid-template-columns: 1fr;
      }

      .npm-link.npm-link-demo {
        grid-column: auto;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenSourceComponent implements OnInit {
  @Input() packages: NpmPackage[] = [];

  private copiedPackage = signal<string | null>(null);

  ngOnInit() {
    // Initialize
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedPackage.set(text);
      setTimeout(() => this.copiedPackage.set(null), 2000);
    });
  }
}
