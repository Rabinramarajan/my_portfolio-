import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { PortfolioDataService } from '../../shared/services/portfolio-data.service';
import { RouterLink, RouterModule } from '@angular/router';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-blog',
  imports: [RouterLink, RouterModule, SlicePipe],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Blog {
  protected readonly pds = inject(PortfolioDataService);

  protected getCategoryColor(cat: string): string {
    const map: Record<string, string> = {
      'Architecture': '#7c3aed',
      'Performance':  '#f59e0b',
      'Mobile':       '#3880FF',
      'Security':     '#ef4444',
      'Tutorial':     '#10b981',
    };
    return map[cat] ?? '#64748b';
  }
}
