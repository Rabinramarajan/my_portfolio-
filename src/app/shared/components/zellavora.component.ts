import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ZelavoraProduct {
  id: string;
  name: string;
  type: string;
  status: 'Live' | 'In Development' | 'Planning';
  statusColor: 'success' | 'warning' | 'default';
  tagline: string;
  description: string;
  features: string[];
  link: string;
  github?: string;
  npm?: string;
  demo?: string;
}

interface ZelavoraRoadmapItem {
  title: string;
  status: 'In Development' | 'Planning' | 'Concept';
  eta: string;
  description: string;
}

interface ZelavoraData {
  narrative: string;
  role: string;
  vision: string;
  products: ZelavoraProduct[];
  roadmap: ZelavoraRoadmapItem[];
}

@Component({
  selector: 'app-zellavora',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (data) {
      <div class="zellavora-container">
        <!-- Founder Narrative -->
        <div class="zellavora-narrative animate-fade-in-up">
          <div class="narrative-quote">{{ data.narrative }}</div>
          <div class="narrative-meta">
            <span class="meta-role">{{ data.role }}</span>
            <span class="meta-vision">{{ data.vision }}</span>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="products-section">
          <h3 class="products-title">Products</h3>
          <div class="products-grid">
            @for (product of data.products; track product.id) {
              <div class="product-card animate-fade-in-scale">
                <!-- Header -->
                <div class="product-header">
                  <div class="product-title-group">
                    <h4 class="product-name">{{ product.name }}</h4>
                    <span class="product-type">{{ product.type }}</span>
                  </div>
                  <div class="product-status" [class]="'status-' + product.statusColor">
                    {{ product.status }}
                  </div>
                </div>

                <!-- Tagline -->
                <p class="product-tagline">{{ product.tagline }}</p>

                <!-- Description -->
                <p class="product-description">{{ product.description }}</p>

                <!-- Features -->
                <ul class="product-features">
                  @for (feature of product.features; track feature) {
                    <li class="feature-item">{{ feature }}</li>
                  }
                </ul>

                <!-- Links -->
                <div class="product-links">
                  <a [href]="product.link" target="_blank" rel="noopener noreferrer" class="product-link primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M7 17L17 7M17 7H7M17 7V17"></path>
                    </svg>
                    Visit
                  </a>
                  @if (product.github) {
                    <a [href]="product.github" target="_blank" rel="noopener noreferrer" class="product-link">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      Code
                    </a>
                  }
                  @if (product.npm) {
                    <a [href]="product.npm" target="_blank" rel="noopener noreferrer" class="product-link">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M6 6H3v12h3v2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3v2zm14 0a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3v-2h3V6h-3V4h3zm-2 6h-8v2h8v-2z"/>
                      </svg>
                      npm
                    </a>
                  }
                  @if (product.demo) {
                    <a [href]="product.demo" target="_blank" rel="noopener noreferrer" class="product-link">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Demo
                    </a>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Roadmap -->
        @if (data.roadmap?.length) {
          <div class="roadmap-section">
            <h3 class="roadmap-title">Building Next</h3>
            <div class="roadmap-grid">
              @for (item of data.roadmap; track item.title) {
                <div class="roadmap-card animate-fade-in-scale">
                  <div class="roadmap-header">
                    <h4 class="roadmap-title-text">{{ item.title }}</h4>
                    <span class="roadmap-eta">{{ item.eta }}</span>
                  </div>
                  <span class="roadmap-status" [class]="'status-' + (item.status === 'In Development' ? 'warning' : item.status === 'Planning' ? 'default' : 'default')">
                    {{ item.status }}
                  </span>
                  <p class="roadmap-description">{{ item.description }}</p>
                </div>
              }
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .zellavora-container {
      display: flex;
      flex-direction: column;
      gap: 48px;
    }

    /* Founder Narrative */
    .zellavora-narrative {
      padding: 32px;
      background: rgba(124, 58, 237, 0.08);
      border: 1px solid rgba(124, 58, 237, 0.2);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .narrative-quote {
      font-size: 1.15rem;
      line-height: 1.8;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }

    .narrative-meta {
      display: flex;
      gap: 24px;
      padding-top: 8px;
    }

    .meta-role,
    .meta-vision {
      font-size: 0.9rem;
    }

    .meta-role {
      font-weight: 600;
      color: #a78bfa;
    }

    .meta-vision {
      color: rgba(255, 255, 255, 0.7);
      font-style: italic;
    }

    /* Products */
    .products-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .products-title,
    .roadmap-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.95);
      margin: 0;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 20px;
    }

    .product-card {
      padding: 28px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        border-color: rgba(124, 58, 237, 0.3);
        background: rgba(124, 58, 237, 0.05);
        transform: translateY(-4px);
        box-shadow: 0 8px 32px rgba(124, 58, 237, 0.1);
      }
    }

    .product-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .product-title-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .product-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.95);
      margin: 0;
    }

    .product-type {
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #a78bfa;
    }

    .product-status {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      white-space: nowrap;

      &.status-success {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }

      &.status-warning {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      &.status-default {
        background: rgba(99, 102, 241, 0.15);
        color: #6366f1;
        border: 1px solid rgba(99, 102, 241, 0.3);
      }
    }

    .product-tagline {
      font-size: 1rem;
      font-weight: 600;
      color: #a78bfa;
      margin: 0;
    }

    .product-description {
      font-size: 0.95rem;
      line-height: 1.7;
      color: rgba(255, 255, 255, 0.75);
      margin: 0;
    }

    .product-features {
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
      gap: 8px;

      &::before {
        content: '✓';
        color: #10b981;
        font-weight: 700;
        flex-shrink: 0;
      }
    }

    .product-links {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 4px;
    }

    .product-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border: 1px solid rgba(124, 58, 237, 0.3);
      border-radius: 6px;
      background: rgba(124, 58, 237, 0.08);
      color: #a78bfa;
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(124, 58, 237, 0.15);
        border-color: rgba(124, 58, 237, 0.5);
      }

      &.primary {
        background: rgba(124, 58, 237, 0.15);
        border-color: rgba(124, 58, 237, 0.4);

        &:hover {
          background: rgba(124, 58, 237, 0.25);
        }
      }
    }

    /* Roadmap */
    .roadmap-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .roadmap-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
    }

    .roadmap-card {
      padding: 24px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.2s ease;

      &:hover {
        border-color: rgba(16, 185, 129, 0.4);
        background: rgba(16, 185, 129, 0.05);
      }
    }

    .roadmap-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .roadmap-title-text {
      font-size: 1rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.95);
      margin: 0;
    }

    .roadmap-eta {
      font-size: 0.8rem;
      font-weight: 600;
      color: #10b981;
      white-space: nowrap;
    }

    .roadmap-status {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      width: fit-content;

      &.status-warning {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }

      &.status-default {
        background: rgba(99, 102, 241, 0.15);
        color: #6366f1;
      }
    }

    .roadmap-description {
      font-size: 0.9rem;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }

    @media (max-width: 768px) {
      .zellavora-container {
        gap: 32px;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }

      .roadmap-grid {
        grid-template-columns: 1fr;
      }

      .narrative-meta {
        flex-direction: column;
        gap: 8px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZelavoraComponent {
  @Input() data: ZelavoraData | null = null;
}
