import { Component, OnInit, HostListener, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { trigger, style, query, transition, stagger, animate } from '@angular/animations'
import { UntypedFormControl } from '@angular/forms';
import { AnalyticsService } from '../../../services/analytics/analytics';
import { LanguageService } from '../../../services/language/language.service';
import { NgStyle } from '@angular/common';
import { NgbModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { DynamicButtonComponent } from '../dynamic-button/dynamic-button.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-header',
  imports: [
    NgStyle,
    NgbModule,
    NgbDropdownModule,
    RouterModule,
    DynamicButtonComponent,
    TranslateModule
  ],
  providers: [
    TranslateService
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger("animateMenu", [
      transition(":enter", [
        query("*", [
          style({ opacity: 0, transform: "translateY(-50%)" }),
          stagger(50, [
            animate("250ms cubic-bezier(0.35, 0, 0.25, 1)", style({ opacity: 1, transform: "none" }))
          ])
        ])
      ])
    ])
  ],
})



export class HeaderComponent implements OnInit {

  responsiveMenuVisible: Boolean = false;
  pageYPosition: number = 0;
  languageFormControl: UntypedFormControl = new UntypedFormControl();
  cvName: string = "";

  public analytics = inject(AnalyticsService);
  public language = inject(LanguageService);
  public router = inject(Router);

  constructor(

  ) { }

  ngOnInit(): void {

    this.languageFormControl.valueChanges.subscribe(val => this.language.changeLanguage(val))

    this.languageFormControl.setValue(this.language.language)

  }

  scroll(el: string) {
    const element = document.getElementById(el);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate(['/home']).then(() => {
        const elAfterNav = document.getElementById(el);
        if (elAfterNav) {
          elAfterNav.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
    this.responsiveMenuVisible = false;
  }

  downloadCV() {
    this.language.translateService.get("Header.cvName").subscribe(val => {
      this.cvName = val
      console.log(val)
      // app url
      let url = window.location.href;

      // Open a new window with the CV
      window.open(url + "/../cv/" + this.cvName, "_blank");
    })

  }

  @HostListener('window:scroll', ['getScrollPosition($event)'])
  getScrollPosition(event: any) {
    this.pageYPosition = window.pageYOffset
  }

  changeLanguage(language: string) {
    this.languageFormControl.setValue(language);
  }
}
