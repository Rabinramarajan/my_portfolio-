interface ThemeColors {
    [key: string]: string;
}

import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { trigger, state, style, transition, animate, group } from '@angular/animations';
import { ThemeColorsPipe } from '../pipes/app-theme-color/theme-color.pipe';
import { AppSettingsService } from '../services/app-settings/app-settings.service';
import { StorageService } from '../services/storage/storage.service';

@Component({
    selector: 'app-theme-toggle',
    standalone: true,
    imports: [MatMenuModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    template: `
        <div class="slot-center" [matMenuTriggerFor]="afterMenu" [matMenuTriggerFor]="afterMenu" aria-haspopup="true"
            tabindex="0">
            @if(selectedThemeIcon) {
            <ion-icon [attr.src]="selectedThemeIconType === 'src' ? selectedThemeIcon : null"
                [attr.name]="selectedThemeIconType === 'name' ? selectedThemeIcon : null" aria-label="Selected theme icon">
            </ion-icon>
            }

        </div>

        <mat-menu #afterMenu="matMenu" xPosition="after" class="cus-menu">
            @for (colorMode of __modeChanged; track $index) {
            <div mat-menu-item (click)="setTheme(colorMode.themeValue, colorMode.themeIcon, colorMode.themeType)"
                [class.active]="theme === colorMode.themeValue" [attr.tabindex]="$index"
                (keydown)="onKeydown($event, colorMode.themeValue, colorMode.themeIcon, colorMode.themeType)" role="menuitem"
                [attr.aria-selected]="theme === colorMode.themeValue">
                <ion-icon [@iconState]="themeState" [attr.src]="colorMode.themeType === 'src' ? colorMode.themeIcon : null"
                    [attr.name]="colorMode.themeType !== 'src' ? colorMode.themeIcon : null">
                </ion-icon>
                <span>{{ colorMode.themeName }}</span>
            </div>
            }
        </mat-menu>
        `,
    animations: [
        trigger('iconState', [
            state('light', style({
                color: '#FFA500',
                transform: 'rotate(0deg) scale(1)',
                opacity: 1
            })),
            state('dark', style({
                color: '#FFD700',
                transform: 'rotate(0deg) scale(1)',
                opacity: 1
            })),
            transition('light => dark', [
                group([
                    animate('0.3s ease-in', style({ opacity: 0, transform: 'scale(0.8)' })),
                    animate('0.4s 0.2s ease-out', style({ transform: 'rotate(360deg) scale(1)', opacity: 1 })),
                    animate('0.5s 0.2s ease-in', style({ color: '#FFD700' }))
                ])
            ]),
            transition('dark => light', [
                group([
                    animate('0.3s ease-in', style({ opacity: 0, transform: 'scale(1.2)' })),
                    animate('0.4s 0.2s ease-out', style({ transform: 'rotate(-360deg) scale(1)', opacity: 1 })),
                    animate('0.5s 0.2s ease-in', style({ color: '#FFA500' }))
                ])
            ])
        ])
    ],
    providers: [ThemeColorsPipe]

})
export class ThemeToggleComponent implements OnInit {

    theme: 'system' | 'dark' | 'light' = 'system';
    isDarkTheme = false;

    selectedThemeIcon: any = '';
    selectedThemeIconType: any = '';

    __modeChanged: any = [];
    @Input() set modeChanged(modeChanged: any) {
        this.__modeChanged = modeChanged || [];
    }
    get modeChanged() {
        return this.__modeChanged;
    }

    constructor(
        private appSetting: AppSettingsService,
        public storage: StorageService,
        private themeColorsPipe: ThemeColorsPipe) { }


    async ngOnInit(): Promise<void> {
        await this.loadTheme();
        this.setInitialThemeIcon();
        this.applyTheme();
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.applyTheme.bind(this));
    }

    private setInitialThemeIcon(): void {
        const matchedTheme = this.__modeChanged.find((mode: any) => mode.themeValue === this.theme);
        this.selectedThemeIcon = matchedTheme ? matchedTheme.themeIcon : this.appSetting.environment.currentThemeIcon;
        this.selectedThemeIconType = matchedTheme ? matchedTheme.themeType : this.appSetting.environment.currentTheme;
    }

    async setTheme(theme: 'system' | 'dark' | 'light', themeIcon: any, themeType: any): Promise<void> {
        this.theme = theme;
        this.selectedThemeIcon = themeIcon;
        this.selectedThemeIconType = themeType;
        await this.applyTheme();
    }

    private async loadTheme(): Promise<void> {
        const savedTheme = (await this.storage.get('theme')) as 'system' | 'dark' | 'light' | null;
        this.theme = savedTheme || this.appSetting.environment.currentTheme;
    }

    private async applyTheme(): Promise<void> {
        this.isDarkTheme = this.theme === 'dark' || (this.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.body.classList.toggle('dark-theme', this.isDarkTheme);
        document.body.classList.toggle('light-theme', !this.isDarkTheme);
        this.setCSSVariables(this.isDarkTheme);
        await this.storage.set('theme', this.theme);
    }

    private setCSSVariables(isDarkTheme: boolean): void {
        const themeColors: ThemeColors = this.themeColorsPipe.transform(isDarkTheme);
        Object.entries(themeColors).forEach(([key, value]) => {
            document.body.style.setProperty(`--${key}`, value);
        });
    }


    onKeydown(event: KeyboardEvent, theme: 'system' | 'dark' | 'light', themeIcon: any, themeType: any) {
        if (['Enter', ' '].includes(event.key)) {
            this.setTheme(theme, themeIcon, themeType);
            event.preventDefault();
        }
    }

    get themeState(): string {
        return this.isDarkTheme ? 'dark' : 'light';
    }

}
