import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioDataService } from '../../shared/services/portfolio-data.service';

@Component({
  selector: 'app-zellavora',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zellavora.html',
  styleUrl: './zellavora.scss',
})
export class Zellavora {
  protected readonly pds = inject(PortfolioDataService);
}
