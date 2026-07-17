/** Code snippet for the playground. */
export interface CodeSnippet {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly language: 'typescript' | 'html' | 'scss' | 'json';
  readonly code: string;
  readonly output?: string;
  readonly category: 'Component' | 'Service' | 'Directive' | 'Pipe' | 'Guard' | 'Interceptor';
  readonly complexity: 'Beginner' | 'Intermediate' | 'Advanced';
}

/** REST API endpoint documentation. */
export interface ApiEndpoint {
  readonly id: string;
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly path: string;
  readonly description: string;
  readonly parameters?: readonly {
    readonly name: string;
    readonly type: string;
    readonly required: boolean;
  }[];
  readonly requestBody?: string;
  readonly responseExample: string;
  readonly statusCode: number;
}

/** Project folder/file structure entry. */
export interface FolderEntry {
  readonly id: string;
  readonly name: string;
  readonly type: 'folder' | 'file';
  readonly path: string;
  readonly description?: string;
  readonly children?: readonly FolderEntry[];
  readonly icon?: string;
}

/** Git commit entry for timeline. */
export interface GitCommit {
  readonly id: string;
  readonly hash: string;
  readonly message: string;
  readonly author: string;
  readonly date: string;
  readonly filesChanged: number;
  readonly insertions: number;
  readonly deletions: number;
  readonly tags?: readonly string[];
}

/** Code metric entry. */
export interface CodeMetric {
  readonly id: string;
  readonly category: 'Performance' | 'Quality' | 'Coverage' | 'Complexity';
  readonly name: string;
  readonly value: string | number;
  readonly unit?: string;
  readonly threshold?: number;
  readonly status: 'excellent' | 'good' | 'warning' | 'critical';
  readonly trend?: 'up' | 'down' | 'stable';
}

/** Architecture component/layer in diagram. */
export interface ArchitectureComponent {
  readonly id: string;
  readonly name: string;
  readonly type: 'Layer' | 'Service' | 'Module' | 'Database' | 'External';
  readonly description: string;
  readonly technologies?: readonly string[];
  readonly responsibilities?: readonly string[];
}

/** Architecture connection/dependency. */
export interface ArchitectureConnection {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly type: 'depends_on' | 'communicates_with' | 'provides';
  readonly label?: string;
}

/** Project dependency entry. */
export interface ProjectDependency {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly type: 'dev' | 'prod' | 'peer';
  readonly description?: string;
  readonly license?: string;
  readonly link?: string;
  readonly category: 'Framework' | 'Utility' | 'Testing' | 'Build' | 'UI' | 'HTTP';
}

/** Developer showcase configuration. */
export interface DeveloperShowcaseConfig {
  readonly snippets: readonly CodeSnippet[];
  readonly apiEndpoints: readonly ApiEndpoint[];
  readonly folderStructure: readonly FolderEntry[];
  readonly gitCommits: readonly GitCommit[];
  readonly codeMetrics: readonly CodeMetric[];
  readonly architectureComponents: readonly ArchitectureComponent[];
  readonly architectureConnections: readonly ArchitectureConnection[];
  readonly dependencies: readonly ProjectDependency[];
}
