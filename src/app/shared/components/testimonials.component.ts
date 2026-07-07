import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  company: string;
  location?: string;
  rating?: number;
  avatar?: string;
  avatarColor?: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="testimonials-container">
      <div class="testimonials-grid">
        @for (testimonial of testimonials; track testimonial.id) {
          <div class="testimonial-card animate-fade-in-scale">
            <!-- Rating stars -->
            @if (testimonial.rating) {
              <div class="testimonial-rating">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <span class="star" [class.filled]="star <= testimonial.rating">★</span>
                }
              </div>
            }

            <!-- Quote -->
            <p class="testimonial-quote">{{ testimonial.quote }}</p>

            <!-- Author info -->
            <div class="testimonial-author">
              @if (testimonial.avatar) {
                <div class="author-avatar" [style.background-color]="testimonial.avatarColor || '#6366f1'">
                  {{ testimonial.avatar }}
                </div>
              }
              <div class="author-info">
                <div class="author-name">{{ testimonial.author }}</div>
                <div class="author-role">{{ testimonial.role }}</div>
                <div class="author-company">{{ testimonial.company }}</div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .testimonials-container {
      width: 100%;
    }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
    }

    .testimonial-card {
      padding: 28px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 16px;
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
        transition: opacity 0.3s ease;
      }

      &:hover {
        border-color: rgba(124, 58, 237, 0.3);
        background: rgba(124, 58, 237, 0.05);
        transform: translateY(-4px);
        box-shadow: 0 8px 32px rgba(124, 58, 237, 0.1);

        &::before { opacity: 1; }
      }
    }

    .testimonial-rating {
      display: flex;
      gap: 4px;
    }

    .star {
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.2);
      transition: color 0.2s ease;

      &.filled {
        color: #fbbf24;
      }
    }

    .testimonial-quote {
      font-size: 1.05rem;
      line-height: 1.75;
      color: rgba(255, 255, 255, 0.85);
      margin: 0;
      font-weight: 500;
    }

    .testimonial-author {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-top: 8px;
    }

    .author-avatar {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 1rem;
    }

    .author-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .author-name {
      font-size: 0.95rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.95);
    }

    .author-role {
      font-size: 0.8rem;
      color: #a78bfa;
      font-weight: 500;
    }

    .author-company {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsComponent {
  @Input() testimonials: Testimonial[] = [];
}
