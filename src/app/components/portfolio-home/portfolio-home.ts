import { ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Navigation } from '../navigation/navigation';
import { SnakeGame } from '../snake-game/snake-game';
import { SocialLinks } from '../social-links/social-links';
import { AppSettingsService } from '../../services/app-settings/app-settings.service';
import Typed from 'typed.js';


interface GameState {
  isPlaying: boolean;
  foodLeft: number;
  score: number;
  gameCompleted: boolean;
}

interface NavItem {
  id: string;
  label: string;
  active: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-portfolio-home',
  imports: [SnakeGame, Navigation, SocialLinks],
  templateUrl: './portfolio-home.html',
  styleUrl: './portfolio-home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioHome implements OnInit, OnDestroy {
  @ViewChild('typedElement', { static: true }) typedElement!: ElementRef;
  @ViewChild('snakeGameCanvas') snakeGameComponent!: SnakeGame;

  // Using signals for reactive state management
  private gameStateSignal = signal<GameState>({
    isPlaying: false,
    foodLeft: 10,
    score: 0,
    gameCompleted: false
  });

  private navItemsSignal = signal<NavItem[]>([
    { id: 'hello', label: '_hello', active: true },
    { id: 'about-me', label: '_about-me', active: false },
    { id: 'projects', label: '_projects', active: false }
  ]);

  // Computed properties
  gameState: any = computed(() => this.gameStateSignal());
  navItems = computed(() => this.navItemsSignal());

  // Static data
  socialLinks: SocialLink[] = [
    { platform: 'twitter', url: 'https://twitter.com/username', icon: 'logo-instagram' },
    { platform: 'linkedin', url: 'https://linkedin.com/in/username', icon: 'logo-linkedin' }
  ];

  profile = {
    name: 'Rabin Ramarajan',
    title: 'Front-end Developer',
    githubLink: 'https://github.com/Rabinramarajan',
    githubUsername: '@Rabinramarajan'
  };

  // Game state properties (public for template access)
  snakePosition = { x: 10, y: 10 };
  snakeBody = [{ x: 10, y: 10 }];
  foodPosition = { x: 5, y: 5 };

  // Private game properties
  private gameInterval?: number;
  private direction = { x: 1, y: 0 };
  private gameGridSize = 20;

  constructor(public appSetting: AppSettingsService) {
  }

  ngOnInit(): void {
    // Initialize component
    const options = {
      strings: this.appSetting.environment.JobTitle,
      typeSpeed: 70,
      backSpeed: 40,
      backDelay: 1500,
      loop: true,
      showCursor: true,
      cursorChar: '|'
    };

    new Typed(this.typedElement.nativeElement, options);
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.gameState().isPlaying) return;

    const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (validKeys.includes(event.key)) {
      event.preventDefault();
      this.moveSnake(event.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right');
    }
  }

  // Navigation methods
  setActiveTab(tabId: string): void {
    const currentItems = this.navItemsSignal();
    const updatedItems = currentItems.map((item: NavItem) => ({
      ...item,
      active: item.id === tabId
    }));
    this.navItemsSignal.set(updatedItems);
    this.scrollToSection(tabId);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Game methods
  startGame(): void {
    this.cleanup();
    this.resetGame();
    this.gameStateSignal.update((state: GameState) => ({
      ...state,
      isPlaying: true,
      score: 0,
      foodLeft: 10,
      gameCompleted: false
    }));
    this.gameLoop();
  }

  skipGame(): void {
    this.cleanup();
    this.gameStateSignal.update((state: GameState) => ({
      ...state,
      gameCompleted: true,
      isPlaying: false
    }));
  }

  moveSnake(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (!this.gameState().isPlaying) return;

    const directions = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };

    const newDirection = directions[direction];

    // Prevent reverse direction
    if (newDirection.x === -this.direction.x && newDirection.y === -this.direction.y) {
      return;
    }

    this.direction = newDirection;
  }

  private resetGame(): void {
    this.snakePosition = { x: 10, y: 10 };
    this.snakeBody = [{ x: 10, y: 10 }];
    this.foodPosition = this.generateFoodPosition();
    this.direction = { x: 1, y: 0 };
  }

  private gameLoop(): void {
    this.gameInterval = window.setInterval(() => {
      this.updateGame();
    }, 200);
  }

  private updateGame(): void {
    const currentState = this.gameState();
    if (!currentState.isPlaying) return;

    // Move snake
    this.snakePosition.x += this.direction.x;
    this.snakePosition.y += this.direction.y;

    // Check wall collision
    if (this.snakePosition.x < 0 || this.snakePosition.x >= this.gameGridSize ||
      this.snakePosition.y < 0 || this.snakePosition.y >= this.gameGridSize) {
      this.gameOver();
      return;
    }

    // Check self collision
    if (this.snakeBody.some(segment =>
      segment.x === this.snakePosition.x && segment.y === this.snakePosition.y)) {
      this.gameOver();
      return;
    }

    // Add new head
    this.snakeBody.unshift({ ...this.snakePosition });

    // Check food collision
    if (this.snakePosition.x === this.foodPosition.x &&
      this.snakePosition.y === this.foodPosition.y) {
      this.eatFood();
    } else {
      // Remove tail if no food eaten
      this.snakeBody.pop();
    }

    // Trigger redraw
    // if (this.snakeGameComponent) {
    //   this.snakeGameComponent.draw();
    // }

    // Check win condition
    if (currentState.foodLeft === 0) {
      this.gameWon();
    }
  }

  private eatFood(): void {
    this.gameStateSignal.update((state: GameState) => ({
      ...state,
      score: state.score + 10,
      foodLeft: state.foodLeft - 1
    }));
    this.foodPosition = this.generateFoodPosition();
  }

  private generateFoodPosition(): { x: number; y: number } {
    let newPosition: { x: number; y: number };
    do {
      newPosition = {
        x: Math.floor(Math.random() * this.gameGridSize),
        y: Math.floor(Math.random() * this.gameGridSize)
      };
    } while (this.snakeBody.some(segment =>
      segment.x === newPosition.x && segment.y === newPosition.y));

    return newPosition;
  }

  private gameOver(): void {
    this.cleanup();
    this.gameStateSignal.update((state: GameState) => ({
      ...state,
      isPlaying: false,
      gameCompleted: false
    }));
    alert('Game Over! Try again.');
  }

  private gameWon(): void {
    this.cleanup();
    this.gameStateSignal.update((state: GameState) => ({
      ...state,
      isPlaying: false,
      gameCompleted: true
    }));
    alert('Congratulations! You won!');
  }

  private cleanup(): void {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = undefined;
    }
  }

  // Helper methods
  getFoodArray(): number[] {
    return Array(this.gameState().foodLeft).fill(0);
  }

  getGithubProfileUrl(): string {
    return `https://github.com/${this.profile.githubUsername.substring(1)}`;
  }

  // TrackBy functions for performance optimization
  trackByIndex(index: number): number {
    return index;
  }

  trackByNavItem(index: number, item: NavItem): string {
    return item.id;
  }

  trackBySocialLink(index: number, item: SocialLink): string {
    return item.platform;
  }

  openLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
}