import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { Component, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AnalyticsServiceService } from '../service/analytics/analytics-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations:[
    trigger("animateMenu",[
      transition(":enter",[
        query("*", [
          style({opacity: 0, transform: "translateY(-50%)"}),
          stagger(50,[
            animate(
              "250ms cubic-bezier(0.35, 0, 0.25, 1)",
              style({opacity: 1, transform: "none"}))
          ])
        ])
      ])
    ])
  ]
})
export class HeaderComponent {

  responsiveMenuVisible: Boolean = false;
  pageYPosition: any;
  languageFormControl: FormControl= new FormControl();
  cvName: string = "";

  constructor(
    private router: Router,
    public analyticsService: AnalyticsServiceService,
  ) { }

  ngOnInit(): void {

  }

  scroll(el: any) {
    // if(document.getElementById(el)) {
    //   document.getElementById(el).scrollIntoView({behavior: 'smooth'});
    // } else{
    //   this.router.navigate(['/home']).then(()=> document.getElementById(el).scrollIntoView({behavior: 'smooth'}) );
    // }
    this.responsiveMenuVisible=false;
  }


  @HostListener('window:scroll', ['getScrollPosition($event)'])
    getScrollPosition(event : any) {
        this.pageYPosition=window.pageYOffset
    }

    changeLanguage(language: string) {
      this.languageFormControl.setValue(language);
    }
}
