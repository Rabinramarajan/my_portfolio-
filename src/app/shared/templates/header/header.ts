import { Component, HostListener, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { PortfolioDataService } from '../../services/portfolio-data.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  protected readonly pds       = inject(PortfolioDataService);
  protected readonly isScrolled = signal(false);
  protected readonly isMenuOpen = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll() { this.isScrolled.set(window.scrollY > 30); }

  toggleMenu() { this.isMenuOpen.update(v => !v); }
  closeMenu()  { this.isMenuOpen.set(false); }
}
