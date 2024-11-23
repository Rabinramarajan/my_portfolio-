import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AppSettingsService } from "../services/app-settings/app-settings.service";
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppButton } from "../core-component/core.directive";
import { ThemeToggleComponent } from "./theme-toggle";


@Component({
    selector: 'app-header',
    standalone: true,
    imports: [AppButton, MatTooltipModule, ThemeToggleComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    template: `
   <div class="header-container">
    <div class="logo">
        <ion-icon [src]="appSetting.userData.logo"></ion-icon>
    </div>
    <div class="menu-container" [class.active]="isMenuOpen">
        <ul>
            @for (menu of appSetting.userData.menu; track $index) {
            <li>
                    @if(!menu.isBtn) {
                        {{ menu.menuName }}
                    }
                    @if(menu.isBtn && menu.menuName === '') {
                        <app-theme-toggle [modeChanged]="menu.themeLst"></app-theme-toggle>
                    }
                    @if(menu.isBtn && menu.menuName !== '') {
                        <button class="btn-primary" [appButton]="menu.menuName"></button>
                    }
            </li>
            }
        </ul>
    </div>
    <div class="menu-toggle" (click)="toggleMenu()">
        <ion-icon [name]="isMenuOpen ? 'close-outline' : 'menu-outline'"></ion-icon>
    </div>
</div>

    `,

})

export class HeaderTemplate implements OnInit {
    @Output() screenModeTrigger = new EventEmitter<any>();
    isMenuOpen = false;
    __modeChangedFlags = false;
    @Input() set modeChangedFlags(modeChangedFlags: boolean) {
        this.__modeChangedFlags = modeChangedFlags || false;
    }
    get modeChangedFlags() {
        return this.__modeChangedFlags;
    }

    constructor(public appSetting: AppSettingsService) { }

    ngOnInit(): void {
        console.log(this.appSetting.userData);
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

}
