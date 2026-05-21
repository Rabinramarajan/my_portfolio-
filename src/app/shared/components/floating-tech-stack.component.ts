import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal, computed } from '@angular/core';

@Component({
  selector: 'app-floating-tech-stack',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="floating-stack-container">
      <div class="floating-stack">
        @for (tech of techs; track tech.name) {
          <div 
            class="tech-item"
            [style.--angle]="($index * 72) + 'deg'"
            [style.animation-delay]="($index * 0.1) + 's'"
          >
            <div class="tech-icon" [style.background]="tech.color">
              {{ tech.icon }}
            </div>
            <span class="tech-label">{{ tech.name }}</span>
          </div>
        }
        <div class="center-dot"></div>
      </div>
    </div>
  `,
  styles: [`
    .floating-stack-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 400px;
      perspective: 1000px;
    }

    .floating-stack {
      position: relative;
      width: 300px;
      height: 300px;
      animation: spin 20s linear infinite;
    }

    @keyframes spin {
      from { transform: rotateX(20deg) rotateY(0deg); }
      to { transform: rotateX(20deg) rotateY(360deg); }
    }

    .tech-item {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotateZ(var(--angle)) translateY(-120px);
      animation: floatIn 0.8s ease-out forwards;
      opacity: 0;
    }

    @keyframes floatIn {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) rotateZ(var(--angle)) translateY(-120px) scale(0.5);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) rotateZ(var(--angle)) translateY(-120px) scale(1);
      }
    }

    .tech-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .tech-item:hover .tech-icon {
      transform: scale(1.1);
      box-shadow: 0 12px 48px rgba(99, 102, 241, 0.4);
    }

    .tech-label {
      display: block;
      margin-top: 8px;
      font-size: 12px;
      text-align: center;
      opacity: 0.8;
      white-space: nowrap;
    }

    .center-dot {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 12px;
      height: 12px;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 24px rgba(99, 102, 241, 0.6);
    }

    @media (max-width: 768px) {
      .floating-stack-container {
        height: 300px;
      }
      .floating-stack {
        width: 200px;
        height: 200px;
      }
      .tech-item {
        transform: translate(-50%, -50%) rotateZ(var(--angle)) translateY(-80px);
      }
      .tech-icon {
        width: 48px;
        height: 48px;
        font-size: 24px;
      }
    }
  `]
})
export class FloatingTechStackComponent {
  techs = [
    { name: 'Angular', icon: '⚡', color: 'rgba(99, 102, 241, 0.8)' },
    { name: 'TypeScript', icon: '📘', color: 'rgba(59, 130, 246, 0.8)' },
    { name: 'RxJS', icon: '🔄', color: 'rgba(139, 92, 246, 0.8)' },
    { name: 'Node.js', icon: '🟢', color: 'rgba(34, 197, 94, 0.8)' },
    { name: 'Ionic', icon: '📱', color: 'rgba(236, 72, 153, 0.8)' }
  ];
}