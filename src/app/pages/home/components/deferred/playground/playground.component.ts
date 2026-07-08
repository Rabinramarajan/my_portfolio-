import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScrollTriggerDirective } from '../../../../../shared/directives';
import { ArrowIconComponent } from '../../../../../shared/components';
import { HomeStateService } from '../../../services/home-state.service';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [CommonModule, RouterLink, ScrollTriggerDirective, ArrowIconComponent],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaygroundComponent implements OnInit {
  private readonly homeState = inject(HomeStateService);

  protected readonly activePlaygroundTab = this.homeState.activePlaygroundTab;
  protected readonly playgroundTabs = [
    { id: 'buttons', label: 'Buttons' },
    { id: 'cards', label: 'Cards & Badges' },
    { id: 'forms', label: 'Forms' },
    { id: 'tokens', label: 'Design Tokens' },
  ];

  ngOnInit(): void {
    this.homeState.markPlaygroundLoaded();
  }

  setActivePlaygroundTab(tabId: string): void {
    this.homeState.setActivePlaygroundTab(tabId);
  }
}
