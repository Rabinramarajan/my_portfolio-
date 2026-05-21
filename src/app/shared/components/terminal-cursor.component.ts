import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-cursor',
  standalone: true,
  imports: [CommonModule],
  template: '',
  styles: [':host { display: block; }']
})
export class CustomCursorComponent {}

@Component({
  selector: 'app-terminal-intro',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terminal-container">
      <div class="terminal">
        <div class="terminal-header">
          <div class="terminal-buttons">
            <span class="btn red"></span>
            <span class="btn yellow"></span>
            <span class="btn green"></span>
          </div>
          <span class="terminal-title">boot_sequence.sh</span>
        </div>
        <div class="terminal-content">
          @for (line of terminalLines; track line) {
            <div class="terminal-line" [class.typing]="line === currentLine">
              <span class="prompt">$ </span>
              <span class="command">{{ line }}</span>
              <span class="cursor" *ngIf="line === currentLine"></span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .terminal-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px 20px;
      min-height: 300px;
    }

    .terminal {
      width: 100%;
      max-width: 600px;
      background: #0f0f0f;
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      font-family: 'Monaco', 'Courier New', monospace;
    }

    .terminal-header {
      background: #1a1a1a;
      padding: 12px;
      border-bottom: 1px solid rgba(99, 102, 241, 0.2);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .terminal-buttons {
      display: flex;
      gap: 8px;
    }

    .btn {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      cursor: pointer;
    }

    .btn.red {
      background: #ff5f57;
    }

    .btn.yellow {
      background: #ffbd2e;
    }

    .btn.green {
      background: #28c940;
    }

    .terminal-title {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      margin-left: 8px;
    }

    .terminal-content {
      padding: 20px;
      color: #00ff00;
      font-size: 14px;
      line-height: 1.8;
      text-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
    }

    .terminal-line {
      animation: slideIn 0.5s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .prompt {
      color: #6366f1;
    }

    .command {
      color: #00ff00;
    }

    .cursor {
      display: inline-block;
      width: 2px;
      height: 1em;
      background: #00ff00;
      margin-left: 2px;
      animation: blink 1s infinite;
    }

    @keyframes blink {
      0%, 49% {
        background: #00ff00;
      }
      50%, 100% {
        background: transparent;
      }
    }

    @media (max-width: 768px) {
      .terminal-content {
        font-size: 12px;
      }
    }
  `]
})
export class TerminalIntroComponent implements OnInit {
  terminalLines = [
    'Initializing Angular runtime...',
    'Loading TypeScript compiler... ✓',
    'Setting up RxJS observables... ✓',
    'Compiling components... ✓',
    'Starting development server... ✓',
    'Ready to serve amazing portfolio!'
  ];

  currentLine: string | null = null;
  private lineIndex = 0;

  ngOnInit() {
    this.typeNextLine();
  }

  private typeNextLine() {
    if (this.lineIndex < this.terminalLines.length) {
      this.currentLine = this.terminalLines[this.lineIndex];
      this.lineIndex++;
      setTimeout(() => this.typeNextLine(), 800);
    } else {
      this.currentLine = null;
    }
  }
}

@Component({
  selector: 'app-terminal-cursor',
  standalone: true,
  imports: [CommonModule],
  template: '<span>_</span>',
  styles: [':host { display: inline; }']
})
export class TerminalCursorComponent {}