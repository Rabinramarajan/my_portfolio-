import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { PortfolioDataService } from '../../shared/services/portfolio-data.service';
import { getCategoryColor } from '../../shared/utils/nav.utils';

@Component({
  selector: 'app-blog-article',
  imports: [RouterLink, SlicePipe],
  templateUrl: './blog-article.html',
  styleUrl: './blog-article.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogArticle {
  private readonly route = inject(ActivatedRoute);
  protected readonly pds = inject(PortfolioDataService);

  protected readonly slug = computed(() => this.route.snapshot.paramMap.get('slug') ?? '');
  protected readonly article = computed(() => this.pds.getArticleBySlug(this.slug()));
  protected readonly getCategoryColor = getCategoryColor;
}
