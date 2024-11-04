import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AppSettingsService } from "../services/app-settings/app-settings.service";
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeToggleComponent } from "./theme-toggle";
import { AppButton } from "../core-component/core.directive";

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [AppButton, MatTooltipModule, ThemeToggleComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    template: `
    <div class="header-container">
        <div class="logo">
            <ion-icon [src]="appSetting.userData.logo" />
        </div>
        <div class="menu-container">
            <ul>
                @for (menu of appSetting.userData.menu; track $index) {
                    @if(!menu.isBtn){
                        <li>
                            {{ menu.menuName }}
                        </li>
                    } @else if (menu.isBtn && menu.menuName === '') {
                        <li>
                            <app-theme-toggle [modeChanged]="menu.themeLst"></app-theme-toggle>
                        </li>
                    } @else {
                        <li>
                            <button class="btn-primary" [appButton]="menu.menuName"></button>
                        </li>
                    }
                }
            </ul>
        </div>
    </div>
    `,

})

export class HeaderTemplate implements OnInit {

    @Output() screenModeTrigger = new EventEmitter<any>();

    __modeChangedFlags = false;
    @Input() set modeChangedFlags(modeChangedFlags: boolean) {
        this.__modeChangedFlags = modeChangedFlags || false;
    }
    get modeChangedFlags() {
        return this.__modeChangedFlags;
    }

    constructor(public appSetting: AppSettingsService) {

    }

    ngOnInit(): void {

    }


    modeChanged(value: any) {
        value = !value;
        this.screenModeTrigger.emit(value)
    }


}
