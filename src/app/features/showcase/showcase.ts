import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService, accentVar } from '../../core';
import type { AccentColor } from '../../core/types/common.types';
import type {
  DeveloperShowcaseConfig,
  CodeSnippet,
  ApiEndpoint,
  FolderEntry,
  GitCommit,
  CodeMetric,
  ArchitectureComponent,
  ArchitectureConnection,
  ProjectDependency,
} from '../../core/models';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';

/** A tab in the showcase switcher. */
interface ShowcaseTab {
  readonly id: TabId;
  readonly label: string;
  readonly icon: string;
}

type TabId =
  'snippets' | 'api' | 'architecture' | 'metrics' | 'dependencies' | 'activity' | 'structure';

/** A folder-tree entry flattened with its nesting depth for indented rendering. */
interface FlatFolderRow {
  readonly entry: FolderEntry;
  readonly depth: number;
  readonly hasChildren: boolean;
}

/**
 * Developer Showcase — a tabbed, interactive tour of the engineering behind the
 * portfolio: a code-snippet playground, a REST API explorer, an architecture
 * map, code-quality metrics, the dependency graph, recent git activity and the
 * project's folder structure. Content is JSON-driven via {@link DataService}
 * ('showcase').
 */
@Component({
  selector: 'app-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, RouterLink, PageLayout, GlassCard, Stagger],
  templateUrl: './showcase.html',
  styleUrl: './showcase.scss',
  host: { class: 'block' },
})
export class ShowcasePage {
  private readonly data = inject(DataService);
  private readonly resource = this.data.load('showcase');

  protected readonly isLoading = this.resource.isLoading;

  private readonly cfg = computed<DeveloperShowcaseConfig | undefined>(
    () => this.resource.value() as DeveloperShowcaseConfig | undefined,
  );

  // ── Tabs ─────────────────────────────────────────────
  protected readonly tabs: readonly ShowcaseTab[] = [
    { id: 'snippets', label: 'Code Snippets', icon: 'Code' },
    { id: 'api', label: 'API Explorer', icon: 'Server' },
    { id: 'architecture', label: 'Architecture', icon: 'Layers' },
    { id: 'metrics', label: 'Metrics', icon: 'Gauge' },
    { id: 'dependencies', label: 'Dependencies', icon: 'Box' },
    { id: 'activity', label: 'Git Activity', icon: 'GitBranch' },
    { id: 'structure', label: 'Structure', icon: 'Folder' },
  ];
  protected readonly activeTab = signal<TabId>('snippets');
  protected setTab(id: TabId): void {
    this.activeTab.set(id);
  }

  // ── Data slices ──────────────────────────────────────
  protected readonly snippets = computed<readonly CodeSnippet[]>(() => this.cfg()?.snippets ?? []);
  protected readonly apiEndpoints = computed<readonly ApiEndpoint[]>(
    () => this.cfg()?.apiEndpoints ?? [],
  );
  protected readonly gitCommits = computed<readonly GitCommit[]>(
    () => this.cfg()?.gitCommits ?? [],
  );
  protected readonly codeMetrics = computed<readonly CodeMetric[]>(
    () => this.cfg()?.codeMetrics ?? [],
  );
  protected readonly architectureComponents = computed<readonly ArchitectureComponent[]>(
    () => this.cfg()?.architectureComponents ?? [],
  );
  protected readonly architectureConnections = computed<readonly ArchitectureConnection[]>(
    () => this.cfg()?.architectureConnections ?? [],
  );

  // ── Snippets: category filter + selection + copy ─────
  protected readonly snippetCategory = signal<string>('All');
  protected readonly snippetCategories = computed<readonly string[]>(() => [
    'All',
    ...new Set(this.snippets().map((s) => s.category)),
  ]);
  protected readonly filteredSnippets = computed<readonly CodeSnippet[]>(() => {
    const cat = this.snippetCategory();
    return cat === 'All' ? this.snippets() : this.snippets().filter((s) => s.category === cat);
  });
  private readonly selectedSnippetId = signal<string | null>(null);
  protected readonly selectedSnippet = computed<CodeSnippet | null>(() => {
    const list = this.filteredSnippets();
    return list.find((s) => s.id === this.selectedSnippetId()) ?? list[0] ?? null;
  });
  protected selectSnippet(id: string): void {
    this.selectedSnippetId.set(id);
  }
  protected setSnippetCategory(cat: string): void {
    this.snippetCategory.set(cat);
    this.selectedSnippetId.set(null);
  }

  protected readonly copiedId = signal<string | null>(null);
  protected async copy(text: string, id: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.copiedId.set(id);
      setTimeout(() => this.copiedId.update((v) => (v === id ? null : v)), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  // ── API Explorer: expandable rows ────────────────────
  protected readonly openEndpoint = signal<string | null>(null);
  protected toggleEndpoint(id: string): void {
    this.openEndpoint.update((v) => (v === id ? null : id));
  }

  // ── Dependencies: grouped by category ────────────────
  protected readonly dependencyGroups = computed<
    readonly { category: string; items: readonly ProjectDependency[] }[]
  >(() => {
    const map = new Map<string, ProjectDependency[]>();
    for (const dep of this.cfg()?.dependencies ?? []) {
      (map.get(dep.category) ?? map.set(dep.category, []).get(dep.category)!).push(dep);
    }
    return [...map.entries()].map(([category, items]) => ({ category, items }));
  });
  protected readonly dependencyCount = computed(() => this.cfg()?.dependencies?.length ?? 0);

  // ── Folder structure: flattened, collapsible tree ────
  private readonly collapsed = signal<ReadonlySet<string>>(new Set());
  protected toggleFolder(id: string): void {
    this.collapsed.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  protected isCollapsed(id: string): boolean {
    return this.collapsed().has(id);
  }
  protected readonly folderRows = computed<readonly FlatFolderRow[]>(() => {
    const collapsed = this.collapsed();
    const rows: FlatFolderRow[] = [];
    const walk = (entries: readonly FolderEntry[], depth: number): void => {
      for (const entry of entries) {
        const children = entry.children ?? [];
        rows.push({ entry, depth, hasChildren: children.length > 0 });
        if (children.length && !collapsed.has(entry.id)) walk(children, depth + 1);
      }
    };
    walk(this.cfg()?.folderStructure ?? [], 0);
    return rows;
  });

  // ── Presentation helpers ─────────────────────────────
  protected accent(color: AccentColor): string {
    return accentVar(color);
  }

  protected methodAccent(method: ApiEndpoint['method']): string {
    const map: Record<ApiEndpoint['method'], AccentColor> = {
      GET: 'green',
      POST: 'blue',
      PUT: 'amber',
      PATCH: 'violet',
      DELETE: 'red',
    };
    return accentVar(map[method]);
  }

  protected complexityAccent(level: CodeSnippet['complexity']): string {
    const map: Record<CodeSnippet['complexity'], AccentColor> = {
      Beginner: 'green',
      Intermediate: 'amber',
      Advanced: 'red',
    };
    return accentVar(map[level]);
  }

  protected metricAccent(status: CodeMetric['status']): string {
    const map: Record<CodeMetric['status'], AccentColor> = {
      excellent: 'green',
      good: 'blue',
      warning: 'amber',
      critical: 'red',
    };
    return accentVar(map[status]);
  }

  protected metricPct(metric: CodeMetric): number | null {
    if (typeof metric.value !== 'number' || !metric.threshold) return null;
    return Math.min(100, Math.round((metric.value / metric.threshold) * 100));
  }

  protected trendIcon(trend: CodeMetric['trend']): string {
    return trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingUp' : 'Minus';
  }

  protected depTypeAccent(type: ProjectDependency['type']): string {
    const map: Record<ProjectDependency['type'], AccentColor> = {
      prod: 'green',
      dev: 'blue',
      peer: 'violet',
    };
    return accentVar(map[type]);
  }

  protected componentIcon(type: ArchitectureComponent['type']): string {
    const map: Record<ArchitectureComponent['type'], string> = {
      Layer: 'Layers',
      Service: 'Wrench',
      Module: 'Box',
      Database: 'Database',
      External: 'Globe',
    };
    return map[type] ?? 'Box';
  }

  protected componentName(id: string): string {
    return this.architectureComponents().find((c) => c.id === id)?.name ?? id;
  }

  /** "Mon DD, YYYY" from an ISO date string. */
  protected shortDate(iso: string): string {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
