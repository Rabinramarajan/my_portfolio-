import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { AnalyticsService } from '../../../services/analytics/analytics';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-proyects',
  imports: [CarouselModule, TranslateModule],
  providers: [
    TranslateService
  ],
  templateUrl: './proyects.component.html',
  styleUrls: ['./proyects.component.scss'],
})
export class ProyectsComponent implements OnInit {

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    navSpeed: 700,
    items: 1,
    autoplay: true,
    autoplayTimeout: 3000
  }

  @ViewChild('imgContainer', { static: false }) imgContainer!: ElementRef;

  private readonly analytics = inject(AnalyticsService);

  constructor() { }

  ngOnInit(): void {



  }

  debug() {

    this.imgContainer.nativeElement.scroll({
      top: this.imgContainer.nativeElement.scrollHeight,
      left: 0,
      behavior: 'smooth',
    });
  }

}
