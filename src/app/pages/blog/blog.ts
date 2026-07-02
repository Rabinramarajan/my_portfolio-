import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { PortfolioDataService } from '../../shared/services/portfolio-data.service';
import { getCategoryColor } from '../../shared/utils/nav.utils';

@Component({
  selector: 'app-blog',
  imports: [RouterLink, SlicePipe],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Blog {
  protected readonly pds = inject(PortfolioDataService);
  protected readonly getCategoryColor = getCategoryColor;
}
