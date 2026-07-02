import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { PortfolioDataService } from '../../shared/services/portfolio-data.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-hire-me',
  imports: [],
  templateUrl: './hire-me.html',
  styleUrl: './hire-me.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HireMe {
  protected readonly pds = inject(PortfolioDataService);
  private readonly doc = inject(DOCUMENT);

  protected openFaqIndex = signal<number | null>(null);

  toggleFaq(i: number) {
    this.openFaqIndex.update(curr => curr === i ? null : i);
  }

  openCalendly() {
    const url = this.pds.data()?.scheduling?.calendlyUrl ?? 'https://calendly.com/rabinr/discovery-call';
    this.doc.defaultView?.open(url, '_blank');
  }
}
