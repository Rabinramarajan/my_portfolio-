import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PersonalizationService } from '../../core/services/personalization.service';
import { PageLayout, GlassCard, Stagger } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';
import type { ThemeMode, FontFamily, LayoutStyle, ContentDensity } from '../../core/models';
import type { AccentColor } from '../../core/types/common.types';

/** Settings & Personalization page — customize portfolio appearance and behavior. */
@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, PageLayout, GlassCard, Stagger, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  host: { class: 'block' },
})
export class SettingsPage {
  protected readonly personalization = inject(PersonalizationService);

  readonly theme = this.personalization.theme;
  readonly accentColor = this.personalization.accentColor;
  readonly font = this.personalization.font;
  readonly layout = this.personalization.layout;
  readonly contentDensity = this.personalization.contentDensity;
  readonly accessibility = this.personalization.accessibility;
  readonly soundEnabled = this.personalization.soundEnabled;
  readonly animationsEnabled = this.personalization.animationsEnabled;

  protected readonly themes: ThemeMode[] = ['light', 'dark', 'auto'];
  protected readonly accentColors: AccentColor[] = [
    'purple',
    'violet',
    'blue',
    'cyan',
    'green',
    'orange',
    'red',
    'amber',
  ];
  protected readonly fontFamilies: FontFamily[] = [
    'inter',
    'roboto',
    'poppins',
    'opensans',
    'dyslexic',
  ];
  protected readonly layouts: LayoutStyle[] = ['default', 'minimal', 'spacious'];
  protected readonly densities: ContentDensity[] = ['compact', 'normal', 'expanded'];
  protected readonly fontSizes: Array<'normal' | 'large' | 'xlarge'> = [
    'normal',
    'large',
    'xlarge',
  ];

  protected updateTheme(theme: ThemeMode): void {
    this.personalization.setTheme(theme);
  }

  protected updateAccentColor(color: AccentColor): void {
    this.personalization.setAccentColor(color);
  }

  protected updateFont(family: FontFamily): void {
    this.personalization.setFont({ family });
  }

  protected updateDyslexiaFriendly(enabled: boolean): void {
    this.personalization.setFont({ dyslexiaFriendly: enabled });
  }

  protected updateLineHeight(height: 'normal' | 'relaxed' | 'loose'): void {
    this.personalization.setFont({ lineHeight: height });
  }

  protected updateLetterSpacing(spacing: 'normal' | 'wide' | 'wider'): void {
    this.personalization.setFont({ letterSpacing: spacing });
  }

  protected updateLayout(layout: LayoutStyle): void {
    this.personalization.setLayout(layout);
  }

  protected updateContentDensity(density: ContentDensity): void {
    this.personalization.setContentDensity(density);
  }

  protected updateAccessibilityEnabled(enabled: boolean): void {
    this.personalization.setAccessibility({ enabled });
  }

  protected updateHighContrast(enabled: boolean): void {
    this.personalization.setAccessibility({ highContrast: enabled });
  }

  protected updateLargerText(enabled: boolean): void {
    this.personalization.setAccessibility({ largerText: enabled });
  }

  protected updateReduceMotion(enabled: boolean): void {
    this.personalization.setAccessibility({ reduceMotion: enabled });
  }

  protected updateFontSize(size: 'normal' | 'large' | 'xlarge'): void {
    this.personalization.setAccessibility({ fontSize: size });
  }

  protected toggleSound(): void {
    this.personalization.setSoundEnabled(!this.soundEnabled());
  }

  protected toggleAnimations(): void {
    this.personalization.setAnimationsEnabled(!this.animationsEnabled());
  }

  protected resetDefaults(): void {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      this.personalization.resetToDefaults();
    }
  }

  protected getColorLabel(color: AccentColor): string {
    return color.charAt(0).toUpperCase() + color.slice(1);
  }

  protected getThemeLabel(theme: ThemeMode): string {
    return theme === 'auto' ? 'Automatic' : theme.charAt(0).toUpperCase() + theme.slice(1);
  }

  protected getFontLabel(font: FontFamily): string {
    const labels: Record<FontFamily, string> = {
      inter: 'Inter',
      roboto: 'Roboto',
      poppins: 'Poppins',
      opensans: 'Open Sans',
      dyslexic: 'OpenDyslexic',
    };
    return labels[font];
  }
}
