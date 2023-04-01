import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { ShareModule } from '../common/share/share.module';
import { BannerComponent } from './banner/banner.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { AboutComponent } from './about/about.component';
import { JobsComponent } from './jobs/jobs.component';
import { MyProjectComponent } from './my-project/my-project.component';
import { TypingAnimatorModule } from 'angular-typing-animator'


@NgModule({
  declarations: [HomeComponent, BannerComponent, AboutComponent, JobsComponent, MyProjectComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    CarouselModule,
    NgbNavModule,
    TypingAnimatorModule
  ]
})
export class HomeModule { }
