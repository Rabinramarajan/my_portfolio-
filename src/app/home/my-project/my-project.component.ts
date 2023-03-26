import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AnalyticsServiceService } from 'src/app/common/service/analytics/analytics-service.service';

@Component({
  selector: 'app-my-project',
  templateUrl: './my-project.component.html',
  styleUrls: ['./my-project.component.scss']
})
export class MyProjectComponent implements OnInit {

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

  @ViewChild('imgContainer')
  imgContainer!: ElementRef;
  jsonDataResult: any = [];
  slide: any;


  constructor(
    public analyticsService: AnalyticsServiceService,
    private http: HttpClient
  ) {
    this.http.get('assets/i18n/data.json').subscribe((res: any) => {
      this.jsonDataResult = res;
      console.log('--- result :: ', this.jsonDataResult);
console.log(this.jsonDataResult.projectList[0].img);

    });
  }

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
