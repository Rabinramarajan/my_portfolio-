import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

interface NavItem {
  id: string;
  label: string;
  active: boolean;
}

@Component({
  selector: 'app-navigation',
  imports: [],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Navigation {
  @Input() navItems!: NavItem[];
  @Input() logoText: string = 'michael-weaver';
  @Output() tabClick = new EventEmitter<string>();

  onTabClick(tabId: string, event: Event): void {
    event.preventDefault();
    this.tabClick.emit(tabId);
  }

  trackByNavItem(index: number, item: NavItem): string {
    return item.id;
  }
}