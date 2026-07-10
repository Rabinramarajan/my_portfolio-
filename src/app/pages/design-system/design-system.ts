// Component Library / design system showcase page
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface CompMeta { id: string; title: string; cat: string; }

@Component({
  selector: 'app-design-system',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './design-system.html',
  styleUrl: './design-system.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignSystemComponent {
  readonly stats = [
    { value: '80+', label: 'Components', icon: 'M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5' },
    { value: '6', label: 'Categories', icon: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z' },
    { value: '100%', label: 'Responsive', icon: 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1ZM10 19h4' },
    { value: 'Light & Dark', label: 'Themes', icon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' },
  ];

  readonly categories = ['All', 'Basic', 'Form', 'Data Display', 'Feedback', 'Navigation', 'Overlay'];

  // Metadata drives search + category filtering
  private readonly components: CompMeta[] = [
    { id: 'buttons', title: 'Buttons', cat: 'Basic' },
    { id: 'inputs', title: 'Input Fields', cat: 'Form' },
    { id: 'cards', title: 'Cards', cat: 'Data Display' },
    { id: 'alerts', title: 'Alerts', cat: 'Feedback' },
    { id: 'checkradio', title: 'Checkbox & Radio', cat: 'Form' },
    { id: 'toggle', title: 'Toggle Switch', cat: 'Form' },
    { id: 'badges', title: 'Badges', cat: 'Data Display' },
    { id: 'progress', title: 'Progress', cat: 'Feedback' },
    { id: 'tabs', title: 'Tabs', cat: 'Navigation' },
    { id: 'pagination', title: 'Pagination', cat: 'Navigation' },
    { id: 'modal', title: 'Modal', cat: 'Overlay' },
    { id: 'tooltip', title: 'Tooltip', cat: 'Overlay' },
  ];

  readonly activeCat = signal('All');
  readonly search = signal('');
  readonly view = signal<'grid' | 'list'>('grid');

  // interactive demo state
  readonly activeTab = signal('one');
  readonly activePage = signal(2);
  readonly toggles = signal<Record<string, boolean>>({ enabled: true, disabled: false, active: true });
  readonly copied = signal(false);

  private readonly visibleIds = computed(() => {
    const cat = this.activeCat();
    const q = this.search().trim().toLowerCase();
    return new Set(
      this.components
        .filter((c) => (cat === 'All' || c.cat === cat) && (!q || c.title.toLowerCase().includes(q)))
        .map((c) => c.id)
    );
  });

  readonly hasResults = computed(() => this.visibleIds().size > 0);

  isVisible(id: string): boolean {
    return this.visibleIds().has(id);
  }

  setCat(c: string) { this.activeCat.set(c); }
  setView(v: 'grid' | 'list') { this.view.set(v); }
  setTab(t: string) { this.activeTab.set(t); }
  setPage(p: number) { this.activePage.set(p); }
  prevPage() { this.activePage.update((p) => Math.max(1, p - 1)); }
  nextPage() { this.activePage.update((p) => Math.min(5, p + 1)); }
  toggle(key: string) { this.toggles.update((t) => ({ ...t, [key]: !t[key] })); }

  readonly codeSnippet = '<button class="btn btn-primary">\n  Primary Button\n</button>';

  copyCode() {
    navigator.clipboard?.writeText(this.codeSnippet);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  readonly pages = [1, 2, 3, 4, 5];
}
