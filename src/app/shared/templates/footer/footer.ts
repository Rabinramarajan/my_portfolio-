import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioDataService } from '../../services/portfolio-data.service';
import { isExternalHref, navFragment, navRouterLink } from '../../utils/nav.utils';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly pds = inject(PortfolioDataService);
  protected readonly isExternalHref = isExternalHref;
  protected readonly navRouterLink = navRouterLink;
  protected readonly navFragment = navFragment;
}
