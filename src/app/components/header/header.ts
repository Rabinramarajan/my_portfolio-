import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

interface NavItem {
  id: string;
  label: string;
  active: boolean;
}

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header {
  @Input() navItems!: NavItem[];
  @Input() logoText: string = '';
  @Output() tabClick = new EventEmitter<string>();

  onTabClick(tabId: string, event: Event): void {
    event.preventDefault();
    this.tabClick.emit(tabId);
  }

  trackByNavItem(index: number, item: NavItem): string {
    return item.id;
  }
}
