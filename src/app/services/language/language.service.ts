import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  language: "tn" | "en" = "en";

  constructor(
    public translateService: TranslateService,
    private location: Location,
  ) {}

  initLanguage(){
    this.translateService.addLangs(["en", "tn"])
    let language = navigator.language || (navigator as any).userLanguage;
    language = language.split("-").includes("tn") ? "tn" : "en"
    this.translateService.setDefaultLang(language)

    // Change the URL without navigate:
    this.location.go(language)

    this.language=language
  }

  changeLanguage(language: any){
    this.translateService.setDefaultLang(language)
    this.location.go(language)
    this.language=language
  }
}
