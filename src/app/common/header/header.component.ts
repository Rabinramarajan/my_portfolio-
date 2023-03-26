import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { Component, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { AnalyticsServiceService } from '../service/analytics/analytics-service.service';
import { AppSettingsService } from '../service/app-settings/app-settings.service';
import { ViewPdfComponent } from '../template/view-pdf/view-pdf.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger("animateMenu", [
      transition(":enter", [
        query("*", [
          style({ opacity: 0, transform: "translateY(-50%)" }),
          stagger(50, [
            animate(
              "250ms cubic-bezier(0.35, 0, 0.25, 1)",
              style({ opacity: 1, transform: "none" }))
          ])
        ])
      ])
    ])
  ]
})
export class HeaderComponent {

  responsiveMenuVisible: Boolean = false;
  pageYPosition: any;
  languageFormControl: FormControl = new FormControl();
  cvName: string = "";


  constructor(
    private router: Router,
    public dialog: MatDialog,
    public analyticsService: AnalyticsServiceService,
    public appSetting: AppSettingsService,
    public appService: AppService,
  ) {
  }

  ngOnInit(): void {

  }

  scroll(el: any) {
    // if(document.getElementById(el)) {
    //   document.getElementById(el).scrollIntoView({behavior: 'smooth'});
    // } else{
    //   this.router.navigate(['/home']).then(()=> document.getElementById(el).scrollIntoView({behavior: 'smooth'}) );
    // }
    this.responsiveMenuVisible = false;
  }


  @HostListener('window:scroll', ['getScrollPosition($event)'])
  getScrollPosition(event: any) {
    this.pageYPosition = window.pageYOffset
  }

  openUserManual() {
    debugger;
    const dialogRef = this.dialog.open(ViewPdfComponent, {
      width: '100%',
      height: '100%',
      data: {
        url: 'assets/cv/my_resume_latest_pdf.pdf'
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

      }
    });
  }

}
