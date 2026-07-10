import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';
import { ScrollTriggerDirective } from '../../../../shared/directives';

interface Skill {
  name: string;
  pct: number;
  path?: string;
  mono?: string;
  color?: string;
}
interface Tech {
  name: string;
  color: string;
  path?: string;
  mono?: string;
}
interface Metric {
  label: string;
  pct: number;
  color: string;
}
interface RadarAxis {
  label: string;
  value: number;
}
interface CategoryTab {
  key: string;
  label: string;
  icon: string;
}

// ── Brand logo paths ──────────────────────────────────────
const P = {
  angular:
    'M16.712 17.711H7.288l-1.204 2.916L12 24l5.916-3.373-1.204-2.916ZM14.692 0l7.832 16.855.814-12.856L14.692 0ZM9.308 0 .662 3.999l.814 12.856L9.308 0Zm-.405 13.93h6.198L12 6.396 8.903 13.93Z',
  ionic:
    'M22.922 7.027l-.103-.23-.169.188c-.408.464-.928.82-1.505 1.036l-.159.061.066.155a9.745 9.745 0 0 1 .75 3.759c0 5.405-4.397 9.806-9.806 9.806-5.409 0-9.802-4.397-9.802-9.802 0-5.405 4.402-9.806 9.806-9.806 1.467 0 2.883.319 4.2.947l.155.075.066-.155a3.767 3.767 0 0 1 1.106-1.453l.197-.159-.225-.117A11.905 11.905 0 0 0 12.001.001c-6.619 0-12 5.381-12 12s5.381 12 12 12 12-5.381 12-12c0-1.73-.361-3.403-1.078-4.973zM12 6.53A5.476 5.476 0 0 0 6.53 12 5.476 5.476 0 0 0 12 17.47 5.476 5.476 0 0 0 17.47 12 5.479 5.479 0 0 0 12 6.53zm10.345-2.007a2.494 2.494 0 1 1-4.988 0 2.494 2.494 0 0 1 4.988 0z',
  flutter:
    'M14.314 0L2.3 12l3.686 3.686L21.686 0h-7.372zm.066 11.406L7.906 17.88 14.379 24h7.372l-6.473-6.12 6.473-6.474h-7.371z',
  ts: 'M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z',
  js: 'M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z',
  html5:
    'M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z',
  css3: 'M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z',
  firebase:
    'M3.89 15.672L6.255.461A.542.542 0 0 1 7.27.288l2.543 4.771zm16.794 3.692l-2.25-14a.54.54 0 0 0-.919-.295L3.316 19.365l7.856 4.427a1.621 1.621 0 0 0 1.588 0zM14.3 7.147l-1.82-3.482a.542.542 0 0 0-.96 0L3.53 17.984z',
  git: 'M23.546 10.93 13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.177-.176.383-.31.602-.4V8.835c-.219-.091-.424-.222-.6-.401-.545-.545-.676-1.342-.396-2.009L7.636 3.7.203 11.13c-.604.605-.604 1.583 0 2.187l10.48 10.48c.605.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187',
  github:
    'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z',
  figma:
    'M8.667 24c2.209 0 4-1.791 4-4v-4H8.667c-2.209 0-4 1.791-4 4s1.791 4 4 4zm-4-12c0-2.209 1.791-4 4-4h4v8h-4c-2.209 0-4-1.791-4-4zm0-8c0-2.209 1.791-4 4-4h4v8h-4c-2.209 0-4-1.791-4-4zm8-4h4c2.209 0 4 1.791 4 4s-1.791 4-4 4h-4V0zm8 12c0 2.209-1.791 4-4 4s-4-1.791-4-4 1.791-4 4-4 4 1.791 4 4z',
  tailwind:
    'M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C10.337,13.382,8.976,12,6.001,12z',
  rxjs: 'M7.402 2.343c-2.224.984-3.615 2.583-4.4 3.747-.852 1.268-1.184 2.319-1.184 2.328-.002.036.005-.017 0 .019-.246.7-.473 1.798-.473 1.807-.265 1.344-.142 2.593-.142 2.612l.029.246a9.58 9.58 0 0 1 .132-1.012c.019-.133.37-2.016 1.694-3.511.142-.218 1.675-2.233 4.495-2.233.606 0 1.24.094 1.874.283h.019c.038.01.87.313 1.173.464.284.142.786.36.795.36h.02c2.715 1.325 5.062 1.75 5.081 1.76.672.114 1.278.17 1.817.17 1.079 0 1.855-.236 2.262-.69.237-.26.307-.559.293-.814.019-.985-.785-2.044-1.467-2.754a10.868 10.868 0 0 0-1.542-1.344c-2.044-1.514-4.23-2.28-6.52-2.28-2.347.009-3.937.832-3.956.842z',
};

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [ScrollTriggerDirective],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsComponent {
  protected readonly pds = inject(PortfolioDataService);

  learningScore = 90;

  categories: CategoryTab[] = [
    { key: 'frontend', label: 'Frontend', icon: 'M3 4h18v12H3zM8 20h8M12 16v4' },
    { key: 'mobile', label: 'Mobile', icon: 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1ZM10 19h4' },
    { key: 'backend', label: 'Backend', icon: 'M4 4h16v5H4zM4 15h16v5H4zM8 6.5h.01M8 17.5h.01' },
    { key: 'database', label: 'Database', icon: 'M12 3c4.418 0 8 1.343 8 3s-3.582 3-8 3-8-1.343-8-3 3.582-3 8-3ZM4 6v12c0 1.657 3.582 3 8 3s8-1.343 8-3V6' },
    { key: 'tools', label: 'Tools', icon: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-2.4-2.4 2.1-2.1Z' },
    { key: 'design', label: 'Design', icon: 'M12 19l7-7 3 3-7 7-3-3ZM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5ZM2 2l7.586 7.586' },
    { key: 'others', label: 'Others', icon: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z' },
  ];

  readonly activeCategory = signal<string>('frontend');

  private skillSets: Record<string, Skill[]> = {
    frontend: [
      { name: 'Angular', pct: 95, path: P.angular, color: '#dd0031' },
      { name: 'TypeScript', pct: 90, path: P.ts, color: '#3178c6' },
      { name: 'JavaScript', pct: 90, path: P.js, color: '#f7df1e' },
      { name: 'HTML5', pct: 95, path: P.html5, color: '#e34f26' },
      { name: 'CSS3', pct: 90, path: P.css3, color: '#1572b6' },
      { name: 'Sass', pct: 85, mono: 'S', color: '#cc6699' },
      { name: 'Tailwind CSS', pct: 85, path: P.tailwind, color: '#06b6d4' },
      { name: 'RxJS', pct: 80, path: P.rxjs, color: '#b7178c' },
    ],
    mobile: [
      { name: 'Ionic', pct: 90, path: P.ionic, color: '#3880ff' },
      { name: 'Capacitor', pct: 85, mono: 'C', color: '#119eff' },
      { name: 'Flutter', pct: 72, path: P.flutter, color: '#02569b' },
      { name: 'Android', pct: 80, mono: 'A', color: '#3ddc84' },
      { name: 'iOS / PWA', pct: 82, mono: 'i', color: '#a2aaad' },
      { name: 'Offline-First', pct: 85, mono: 'O', color: '#7c3aed' },
    ],
    backend: [
      { name: 'Node.js', pct: 80, mono: 'N', color: '#339933' },
      { name: 'Express', pct: 75, mono: 'E', color: '#94a3b8' },
      { name: 'REST APIs', pct: 92, mono: '{ }', color: '#38bdf8' },
      { name: 'JWT / RBAC', pct: 85, mono: 'J', color: '#d63aff' },
      { name: 'WebSockets', pct: 72, mono: 'W', color: '#10b981' },
      { name: 'GraphQL', pct: 60, mono: 'GQL', color: '#e10098' },
    ],
    database: [
      { name: 'Firebase', pct: 85, path: P.firebase, color: '#ffca28' },
      { name: 'Firestore', pct: 85, mono: 'F', color: '#ffa000' },
      { name: 'MongoDB', pct: 70, mono: 'M', color: '#47a248' },
      { name: 'PostgreSQL', pct: 65, mono: 'P', color: '#4169e1' },
      { name: 'MySQL', pct: 70, mono: 'My', color: '#4479a1' },
      { name: 'Redis', pct: 60, mono: 'R', color: '#dc382d' },
    ],
    tools: [
      { name: 'Git', pct: 92, path: P.git, color: '#f05032' },
      { name: 'GitHub', pct: 90, path: P.github, color: '#e2e8f0' },
      { name: 'VS Code', pct: 95, mono: 'VS', color: '#007acc' },
      { name: 'Docker', pct: 65, mono: 'D', color: '#2496ed' },
      { name: 'Postman', pct: 85, mono: 'P', color: '#ff6c37' },
      { name: 'DevTools', pct: 90, mono: 'DT', color: '#4285f4' },
    ],
    design: [
      { name: 'Figma', pct: 85, path: P.figma, color: '#f24e1e' },
      { name: 'UI/UX Design', pct: 90, mono: 'UX', color: '#a855f7' },
      { name: 'Responsive', pct: 95, mono: 'R', color: '#38bdf8' },
      { name: 'Design Systems', pct: 85, mono: 'DS', color: '#c084fc' },
      { name: 'Prototyping', pct: 80, mono: 'Pr', color: '#ec4899' },
      { name: 'Accessibility', pct: 90, mono: 'A11y', color: '#10b981' },
    ],
    others: [
      { name: 'Agile / Scrum', pct: 85, mono: 'A', color: '#7c3aed' },
      { name: 'CI/CD', pct: 75, mono: 'CI', color: '#38bdf8' },
      { name: 'Testing', pct: 82, mono: 'T', color: '#10b981' },
      { name: 'Problem Solving', pct: 92, mono: 'PS', color: '#f59e0b' },
      { name: 'Team Collaboration', pct: 95, mono: 'TC', color: '#22c55e' },
      { name: 'Clean Code', pct: 90, mono: '{ }', color: '#a855f7' },
    ],
  };

  readonly activeSkills = computed<Skill[]>(() => this.skillSets[this.activeCategory()] ?? []);
  readonly activeLabel = computed<string>(
    () => this.categories.find((c) => c.key === this.activeCategory())?.label ?? 'Frontend'
  );

  miniStats = [
    { number: '4+', label: 'Years Exp.', icon: 'M12 6v6l4 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z' },
    { number: '50+', label: 'Projects', icon: 'M13 2 3 14h9l-1 8 10-12h-9l1-8Z' },
    { number: '100%', label: 'Dedication', icon: 'M12 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z' },
  ];

  radar: RadarAxis[] = [
    { label: 'UI Development', value: 95 },
    { label: 'Responsive Design', value: 90 },
    { label: 'Performance', value: 85 },
    { label: 'State Management', value: 88 },
    { label: 'Testing', value: 78 },
    { label: 'Problem Solving', value: 92 },
  ];

  private radarPoint(i: number, frac: number, r = 78): string {
    const a = ((i * 60 - 90) * Math.PI) / 180;
    return `${(100 + r * frac * Math.cos(a)).toFixed(1)},${(100 + r * frac * Math.sin(a)).toFixed(1)}`;
  }
  gridPoints(frac: number): string {
    return [0, 1, 2, 3, 4, 5].map((i) => this.radarPoint(i, frac)).join(' ');
  }
  get dataPoints(): string {
    return this.radar.map((ax, i) => this.radarPoint(i, ax.value / 100)).join(' ');
  }
  get axisLines(): { x: number; y: number }[] {
    return [0, 1, 2, 3, 4, 5].map((i) => {
      const [x, y] = this.radarPoint(i, 1).split(',').map(Number);
      return { x, y };
    });
  }

  metrics: Metric[] = [
    { label: 'UI/UX Design', pct: 85, color: '#7c3aed' },
    { label: 'Responsive Design', pct: 90, color: '#38bdf8' },
    { label: 'Performance Optimization', pct: 88, color: '#06b6d4' },
    { label: 'Problem Solving', pct: 92, color: '#a855f7' },
    { label: 'Clean Code', pct: 90, color: '#f97316' },
    { label: 'Team Collaboration', pct: 95, color: '#22c55e' },
  ];

  popularTech: Tech[] = [
    { name: 'Angular', color: '#dd0031', path: P.angular },
    { name: 'Ionic', color: '#3880ff', path: P.ionic },
    { name: 'Flutter', color: '#02569b', path: P.flutter },
    { name: 'TypeScript', color: '#3178c6', path: P.ts },
    { name: 'Firebase', color: '#ffca28', path: P.firebase },
    { name: 'Node.js', color: '#339933', mono: 'N' },
    { name: 'Git', color: '#f05032', path: P.git },
    { name: 'GitHub', color: '#e2e8f0', path: P.github },
    { name: 'Docker', color: '#2496ed', mono: 'D' },
    { name: 'Figma', color: '#f24e1e', path: P.figma },
    { name: 'VS Code', color: '#007acc', mono: 'VS' },
    { name: 'Postman', color: '#ff6c37', mono: 'P' },
  ];

  setCategory(key: string) {
    this.activeCategory.set(key);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
