import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  signal,
  computed
} from '@angular/core';

interface GameState {
  isPlaying: boolean;
  foodLeft: number;
  score: number;
  gameCompleted: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface GameConfig {
  gridSize: number;
  tileSize: number;
  canvasSize: number;
  gameSpeed: number;
  colors: {
    background: string;
    snake: string;
    food: string;
    grid: string;
  };
}

@Component({
  selector: 'app-snake-game',
  imports: [],
  templateUrl: './snake-game.html',
  styleUrl: './snake-game.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnakeGame implements AfterViewInit, OnDestroy, OnChanges {
  @Input() gameState!: GameState;
  @Input() snake: Position[] = [];
  @Input() food: Position = { x: 0, y: 0 };
  @Output() startGame = new EventEmitter<void>();
  @Output() skipGame = new EventEmitter<void>();
  @Output() moveSnake = new EventEmitter<'up' | 'down' | 'left' | 'right'>();

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animationFrameId?: number;

  // Game configuration
  readonly config: GameConfig = {
    gridSize: 20,
    tileSize: 20,
    canvasSize: 400,
    gameSpeed: 150,
    colors: {
      background: '#1e293b', // Dark blue-gray background
      snake: '#22d3ee',      // Cyan for snake
      food: '#10b981',       // Green for food
      grid: '#334155'        // Subtle grid lines
    }
  };

  // UI state signals
  private showControlsSignal = signal(false);
  showControls = computed(() => this.showControlsSignal());

  // Food dots for display
  foodDots = computed(() => Array(this.gameState?.foodLeft || 0).fill(0));

  ngAfterViewInit(): void {
    this.initializeCanvas();
    this.setupCanvas();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gameState'] && this.ctx) {
      this.updateDisplay();
    }

    if ((changes['snake'] || changes['food']) && this.ctx) {
      this.draw();
    }
  }

  private initializeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    // Set canvas size
    canvas.width = this.config.canvasSize;
    canvas.height = this.config.canvasSize;

    // Enable crisp pixel rendering
    this.ctx.imageSmoothingEnabled = false;

    this.clearCanvas();
  }

  private setupCanvas(): void {
    if (!this.ctx) return;

    // Set initial styles
    this.ctx.fillStyle = this.config.colors.background;
    this.ctx.fillRect(0, 0, this.config.canvasSize, this.config.canvasSize);

    this.drawGrid();
  }

  private drawGrid(): void {
    if (!this.ctx) return;

    this.ctx.strokeStyle = this.config.colors.grid;
    this.ctx.lineWidth = 0.5;

    // Draw vertical lines
    for (let x = 0; x <= this.config.gridSize; x++) {
      const xPos = x * this.config.tileSize;
      this.ctx.beginPath();
      this.ctx.moveTo(xPos, 0);
      this.ctx.lineTo(xPos, this.config.canvasSize);
      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= this.config.gridSize; y++) {
      const yPos = y * this.config.tileSize;
      this.ctx.beginPath();
      this.ctx.moveTo(0, yPos);
      this.ctx.lineTo(this.config.canvasSize, yPos);
      this.ctx.stroke();
    }
  }

  private updateDisplay(): void {
    if (this.gameState?.isPlaying) {
      this.showControlsSignal.set(true);
    } else {
      this.showControlsSignal.set(false);
    }
  }

  draw(): void {
    if (!this.ctx || !this.snake || !this.food) return;

    this.clearCanvas();
    this.drawGrid();
    this.drawSnake();
    this.drawFood();
  }

  private drawSnake(): void {
    if (!this.ctx || !this.snake?.length) return;

    this.snake.forEach((segment, index) => {
      const isHead = index === 0;
      const opacity = Math.max(0.3, 1 - (index * 0.1));

      // Different rendering for head vs body
      if (isHead) {
        // Head with glow effect
        this.ctx.fillStyle = '#06b6d4';
        this.ctx.shadowColor = '#06b6d4';
        this.ctx.shadowBlur = 8;
      } else {
        // Body segments with gradient opacity
        this.ctx.fillStyle = this.config.colors.snake;
        this.ctx.shadowBlur = 0;
      }

      // Add some padding and rounded corners for segments
      const padding = 1;
      const x = segment.x * this.config.tileSize + padding;
      const y = segment.y * this.config.tileSize + padding;
      const size = this.config.tileSize - padding * 2;

      // Draw rounded rectangle for snake segments
      this.drawRoundedRect(x, y, size, size, 3);

      // Add inner highlight for 3D effect
      if (isHead) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.drawRoundedRect(x + 2, y + 2, size - 4, size - 4, 2);
      } else {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
        this.drawRoundedRect(x + 1, y + 1, size - 2, size - 2, 2);
      }

      // Reset shadow
      this.ctx.shadowBlur = 0;
    });
  }

  private drawFood(): void {
    if (!this.ctx || !this.food) return;

    const centerX = this.food.x * this.config.tileSize + this.config.tileSize / 2;
    const centerY = this.food.y * this.config.tileSize + this.config.tileSize / 2;
    const radius = this.config.tileSize / 2.5;

    // Create pulsing effect based on time
    const time = Date.now() * 0.005;
    const pulseRadius = radius + Math.sin(time) * 2;

    // Outer glow
    this.ctx.shadowColor = this.config.colors.food;
    this.ctx.shadowBlur = 15;

    // Main food circle
    this.ctx.fillStyle = this.config.colors.food;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner highlight
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.beginPath();
    this.ctx.arc(centerX - 2, centerY - 2, pulseRadius * 0.6, 0, Math.PI * 2);
    this.ctx.fill();

    // Add sparkle effect
    this.drawSparkles(centerX, centerY, pulseRadius * 1.5);
  }

  private drawSparkles(centerX: number, centerY: number, radius: number): void {
    const time = Date.now() * 0.003;
    const sparkleCount = 6;

    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2 + time;
      const sparkleRadius = radius + Math.sin(time + i) * 5;
      const x = centerX + Math.cos(angle) * sparkleRadius;
      const y = centerY + Math.sin(angle) * sparkleRadius;
      const size = Math.abs(Math.sin(time * 2 + i)) * 2;

      this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(Math.sin(time + i)) * 0.8})`;
      this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  } private clearCanvas(): void {
    if (!this.ctx) return;

    this.ctx.fillStyle = this.config.colors.background;
    this.ctx.fillRect(0, 0, this.config.canvasSize, this.config.canvasSize);
  }

  private cleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.gameState?.isPlaying) {
      // Handle game control keys when not playing
      if (event.key === 'Enter') {
        event.preventDefault();
        this.onStartGame();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        this.onSkipGame();
      }
      return;
    }

    const keyMap: { [key: string]: 'up' | 'down' | 'left' | 'right' } = {
      'ArrowUp': 'up',
      'w': 'up',
      'W': 'up',
      'ArrowDown': 'down',
      's': 'down',
      'S': 'down',
      'ArrowLeft': 'left',
      'a': 'left',
      'A': 'left',
      'ArrowRight': 'right',
      'd': 'right',
      'D': 'right'
    };

    const direction = keyMap[event.key];
    if (direction) {
      event.preventDefault();
      this.moveSnake.emit(direction);
    }

    // Handle game control keys during play
    if (event.key === 'Escape') {
      event.preventDefault();
      this.onSkipGame();
    }
  }

  onStartGame(): void {
    if (!this.gameState?.isPlaying && !this.gameState?.gameCompleted) {
      this.startGame.emit();
    }
  }

  onSkipGame(): void {
    this.skipGame.emit();
  }

  onDirectionClick(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (this.gameState?.isPlaying) {
      this.moveSnake.emit(direction);
    }
  }

  // Helper methods for UI
  getGameStatus(): string {
    if (this.gameState?.gameCompleted) {
      return 'completed';
    }
    if (this.gameState?.isPlaying) {
      return 'playing';
    }
    return 'ready';
  }

  getGameStatusText(): string {
    const status = this.getGameStatus();
    switch (status) {
      case 'playing':
        return 'playing...';
      case 'completed':
        return 'completed';
      default:
        return 'start-game';
    }
  }

  // Accessibility methods
  getCanvasAriaLabel(): string {
    if (this.gameState?.isPlaying) {
      return `Snake game in progress. Score: ${this.gameState.score}. Food left: ${this.gameState.foodLeft}`;
    }
    if (this.gameState?.gameCompleted) {
      return `Snake game completed with score: ${this.gameState.score}`;
    }
    return 'Snake game ready to start';
  }

  // Performance optimization
  trackByIndex(index: number): number {
    return index;
  }
}
