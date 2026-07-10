import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { PortfolioDataService } from '../../../../shared/services/portfolio-data.service';
import { ScrollTriggerDirective } from '../../../../shared/directives';

interface LiStat { value: string; label: string; icon: string; }
interface SkillEnd { name: string; count: string; color: string; path: string; pct: number; }
interface Activity { type: 'Article' | 'Post'; hue: number; title: string; desc: string; date: string; views: string; reactions: string; }
interface ShareItem { name: string; tint: string; icon: string; }

const P = {
  angular: 'M16.712 17.711H7.288l-1.204 2.916L12 24l5.916-3.373-1.204-2.916ZM14.692 0l7.832 16.855.814-12.856L14.692 0ZM9.308 0 .662 3.999l.814 12.856L9.308 0Zm-.405 13.93h6.198L12 6.396 8.903 13.93Z',
  ts: 'M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z',
  ionic: 'M22.922 7.027l-.103-.23-.169.188c-.408.464-.928.82-1.505 1.036l-.159.061.066.155a9.745 9.745 0 0 1 .75 3.759c0 5.405-4.397 9.806-9.806 9.806-5.409 0-9.802-4.397-9.802-9.802 0-5.405 4.402-9.806 9.806-9.806 1.467 0 2.883.319 4.2.947l.155.075.066-.155a3.767 3.767 0 0 1 1.106-1.453l.197-.159-.225-.117A11.905 11.905 0 0 0 12.001.001c-6.619 0-12 5.381-12 12s5.381 12 12 12 12-5.381 12-12c0-1.73-.361-3.403-1.078-4.973zM12 6.53A5.476 5.476 0 0 0 6.53 12 5.476 5.476 0 0 0 12 17.47 5.476 5.476 0 0 0 17.47 12 5.479 5.479 0 0 0 12 6.53zm10.345-2.007a2.494 2.494 0 1 1-4.988 0 2.494 2.494 0 0 1 4.988 0z',
  js: 'M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z',
  html5: 'M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z',
};

@Component({
  selector: 'app-linkedin',
  standalone: true,
  imports: [ScrollTriggerDirective],
  templateUrl: './linkedin.component.html',
  styleUrl: './linkedin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkedinComponent {
  protected readonly pds = inject(PortfolioDataService);

  get linkedinUrl(): string {
    return (this.pds.meta() as Record<string, string> | undefined)?.['linkedin'] || 'https://www.linkedin.com/in/rabinr/';
  }

  headline = 'Frontend Developer | Angular | Ionic | Flutter';
  industry = 'Information Technology & Services';

  stats: LiStat[] = [
    { value: '500+', label: 'Connections', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
    { value: '25K+', label: 'Profile Views', icon: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z' },
    { value: '120+', label: 'Posts & Articles', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M8 13h8M8 17h5' },
    { value: '1.2K+', label: 'Reactions', icon: 'M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z' },
    { value: '300+', label: 'Comments', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
  ];

  skills: SkillEnd[] = [
    { name: 'Angular', count: '99+', color: '#dd0031', path: P.angular, pct: 99 },
    { name: 'TypeScript', count: '99+', color: '#3178c6', path: P.ts, pct: 99 },
    { name: 'Ionic', count: '97+', color: '#3880ff', path: P.ionic, pct: 97 },
    { name: 'JavaScript', count: '95+', color: '#f7df1e', path: P.js, pct: 95 },
    { name: 'HTML5', count: '94+', color: '#e34f26', path: P.html5, pct: 94 },
  ];

  activity: Activity[] = [
    { type: 'Article', hue: 350, title: 'Building Scalable Angular Applications', desc: 'Key strategies and best practices for building large scale Angular applications.', date: 'May 15, 2024', views: '1.1K views', reactions: '120' },
    { type: 'Post', hue: 205, title: 'Why I love Ionic for Cross-platform Development', desc: 'Sharing my experience using Ionic to build powerful mobile apps.', date: 'Apr 28, 2024', views: '860 views', reactions: '95' },
    { type: 'Article', hue: 215, title: 'TypeScript Tips for Better Developer Experience', desc: 'Improve your productivity with these essential TypeScript tips.', date: 'Apr 10, 2024', views: '1.3K views', reactions: '130' },
  ];

  shares: ShareItem[] = [
    { name: 'Technical Articles', tint: '#a855f7', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M8 13h8M8 17h5' },
    { name: 'Project Showcases', tint: '#38bdf8', icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2Z' },
    { name: 'Tips & Tutorials', tint: '#f59e0b', icon: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z' },
    { name: 'Industry Insights', tint: '#22c55e', icon: 'M12 2 3 7v10l9 5 9-5V7l-9-5ZM12 22V12M3 7l9 5 9-5' },
    { name: 'Open Source', tint: '#c084fc', icon: 'm16 18 6-6-6-6M8 6l-6 6 6 6' },
    { name: 'Career Growth', tint: '#ec4899', icon: 'M3 3v18h18M7 15l4-4 3 3 5-6' },
  ];

  // Network Growth chart data (Jan'22 → Now)
  chart = {
    labels: ["Jan '22", "Jul '22", "Jan '23", "Jul '23", "Jan '24", 'Now'],
    yLabels: ['600', '450', '300', '150', '0'],
    values: [150, 180, 300, 290, 380, 500],
  };

  // Build an SVG polyline (viewBox 0..300 x, 0..160 y) from values (max 600)
  get chartPoints(): string {
    const w = 300, h = 150, max = 600;
    const n = this.chart.values.length;
    return this.chart.values
      .map((v, i) => `${((i / (n - 1)) * w).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`)
      .join(' ');
  }
  get chartArea(): string {
    return `0,150 ${this.chartPoints} 300,150`;
  }
  chartDot(i: number): { x: number; y: number } {
    const w = 300, h = 150, max = 600;
    const n = this.chart.values.length;
    return { x: (i / (n - 1)) * w, y: h - (this.chart.values[i] / max) * h };
  }

  // Decorative faux-QR: deterministic 21×21 grid (swap for a real QR image later)
  readonly qrCells: boolean[] = Array.from({ length: 21 * 21 }, (_, i) => {
    const r = Math.floor(i / 21), c = i % 21;
    // finder squares in three corners
    const finder = (br: number, bc: number) =>
      r >= br && r < br + 7 && c >= bc && c < bc + 7 &&
      (r === br || r === br + 6 || c === bc || c === bc + 6 || (r >= br + 2 && r <= br + 4 && c >= bc + 2 && c <= bc + 4));
    if (finder(0, 0) || finder(0, 14) || finder(14, 0)) return true;
    if ((r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8)) return false;
    return (r * 31 + c * 17 + r * c) % 3 === 0;
  });

  trackByIndex(index: number): number {
    return index;
  }
}
