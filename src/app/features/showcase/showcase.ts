import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService, trackById } from '../../core';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

/** Developer Showcase page — code playground, API explorer, and architecture visualization. */
@Component({
  selector: 'app-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, PageLayout, GlassCard, Stagger, FormsModule],
  templateUrl: './showcase.html',
  styleUrl: './showcase.scss',
  host: { class: 'block' },
})
export class ShowcasePage {
  private readonly data = inject(DataService);

  protected readonly showcase = this.data.load('showcase');

  protected readonly selectedSnippet = signal<string | null>(null);
  protected readonly selectedComplexity = signal<string>('All');
  protected readonly selectedCategory = signal<string>('All');
  protected readonly selectedApiMethod = signal<string>('All');
  protected readonly selectedMetricCategory = signal<string>('All');
  protected readonly expandedCommit = signal<string | null>(null);
  protected readonly expandedDependency = signal<string | null>(null);

  protected readonly trackById = trackById;

  protected selectSnippet(id: string): void {
    this.selectedSnippet.set(this.selectedSnippet() === id ? null : id);
  }

  protected filteredSnippets(snippets: readonly any[]) {
    return snippets.filter((s) => {
      const complexityMatch =
        this.selectedComplexity() === 'All' || s.complexity === this.selectedComplexity();
      const categoryMatch =
        this.selectedCategory() === 'All' || s.category === this.selectedCategory();
      return complexityMatch && categoryMatch;
    });
  }

  protected filteredEndpoints(endpoints: readonly any[]) {
    return endpoints.filter(
      (e) => this.selectedApiMethod() === 'All' || e.method === this.selectedApiMethod(),
    );
  }

  protected filteredMetrics(metrics: readonly any[]) {
    return metrics.filter(
      (m) =>
        this.selectedMetricCategory() === 'All' || m.category === this.selectedMetricCategory(),
    );
  }

  protected toggleCommit(id: string): void {
    this.expandedCommit.set(this.expandedCommit() === id ? null : id);
  }

  protected toggleDependency(id: string): void {
    this.expandedDependency.set(this.expandedDependency() === id ? null : id);
  }

  protected copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    });
  }

  protected formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  protected getStatusColor(status: string): string {
    switch (status) {
      case 'excellent':
        return '#10b981';
      case 'good':
        return '#3b82f6';
      case 'warning':
        return '#f59e0b';
      case 'critical':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }

  protected getStatusIcon(status: string): string {
    switch (status) {
      case 'excellent':
        return 'CheckCircle';
      case 'good':
        return 'CheckCircle';
      case 'warning':
        return 'AlertCircle';
      case 'critical':
        return 'XCircle';
      default:
        return 'HelpCircle';
    }
  }
}
