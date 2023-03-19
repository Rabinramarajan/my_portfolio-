import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AnimateOnScrollModule } from 'ng2-animate-on-scroll';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './common/header/header.component';
import { ShareModule } from './common/share/share.module';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ShareModule,
    AnimateOnScrollModule.forRoot(),
    NgxGoogleAnalyticsModule.forRoot(environment.trackAnalyticID),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
