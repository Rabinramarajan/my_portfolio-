import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AppButton } from "../directives/core.directive";
import { trigger, state, style, transition, animate } from "@angular/animations";

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [AppButton],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    template: `
    <div class="header-container">
        <div class="logo">
            <ion-icon [src]="'image/svg/logo.svg'" />
        </div>
        <div class="menu-container">
            <ul>
                <li>
                    About
                </li>
                <li>
                    Work
                </li>
                <li>
                    About
                </li>
               
                <li (click)="modeChanged(__modeChangedFlags)">
                    <ion-icon 
                        [@iconState]="__modeChangedFlags ? 'dark' : 'light'" 
                        [name]="__modeChangedFlags ? 'sunny' : 'cloudy-night'" 
                        class="theme-icon">
                    </ion-icon>
                </li>
                <li>
                    <button class="btn-primary" appButton="Download CV"></button>
                </li>
            </ul>
        </div>
    </div>
    `,
     animations: [
        trigger('iconState', [
            state('light', style({
                transform: 'rotate(0deg)', // Normal state
            })),
            state('dark', style({
                transform: 'rotate(180deg)', // Rotated state for dark theme
            })),
            transition('light <=> dark', [
                animate('0.5s ease-in-out') // Transition effect
            ])
        ])
    ]
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

    constructor() {

    }

    ngOnInit(): void {

    }


    modeChanged(value: any) {
        value = !value;
        this.screenModeTrigger.emit(value)
    }


}
