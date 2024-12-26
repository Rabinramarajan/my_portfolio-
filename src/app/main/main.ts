import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from "@angular/core";
import { AppSettingsService } from "../common/services/app-settings/app-settings.service";
import { NgClass } from "@angular/common";
import { HeaderTemplate } from "../common/templates/header-template";
import { LoaderComponent } from "../common/templates/loader/loader.component";
import { BannerComponent } from "./banner/banner.component";
import { AboutComponent } from "./about/about.component";

@Component({
    selector: 'app-main',
    standalone: true,
    imports: [NgClass, HeaderTemplate, LoaderComponent, BannerComponent, AboutComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    template: `

<div class="v-flex h100">
    @if(isLoading) {
    <div [ngClass]="{'loadingStart': isLoading}">
        <app-loader type="preLoaderRing" loadingValues="...gnidaol oiloftroP" />
    </div>
    } @else {
    <div class="a">
        <app-header />
    </div>
    <div class="z-iM">
       <app-banner />
    </div>
    <div class="z-iM">
      <app-about />
    </div>
    }
</div>

    `
})

export class MainComponent implements OnInit {
    isDarkTheme = false;
    isLoading = false;

    constructor() {

    }

    ngOnInit(): void {
        setTimeout(() => {
            this.isLoading = false;
        }, 3000);
    }



}
