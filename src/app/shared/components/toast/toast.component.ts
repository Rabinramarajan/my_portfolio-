import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast--{{ toast.type }}" (click)="toastService.dismiss(toast.id)">
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') { <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> }
              @case ('error') { <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> }
              @case ('warning') { <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> }
              @default { <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> }
            }
          </div>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 500;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 380px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      border-radius: 12px;
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.1);
      cursor: pointer;
      animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      font-size: 0.875rem;
      color: #f8fafc;
    }
    .toast--success { background: rgba(16, 185, 129, 0.9); }
    .toast--error { background: rgba(239, 68, 68, 0.9); }
    .toast--warning { background: rgba(245, 158, 11, 0.9); color: #0f172a; }
    .toast--info { background: rgba(99, 102, 241, 0.9); }
    .toast-icon { flex-shrink: 0; display: flex; }
    .toast-message { flex: 1; line-height: 1.4; }
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(100px) scale(0.8); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }
    @media (max-width: 480px) {
      .toast-container { left: 16px; right: 16px; bottom: 16px; max-width: none; }
    }
  `]
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
}
