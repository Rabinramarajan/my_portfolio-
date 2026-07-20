import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PersonalizationService } from '../../core/services/personalization.service';
import { DataService } from '../../core';
import { PageLayout, GlassCard } from '../../shared';
import { Icon } from '../../shared/components/ui/icon/icon';
import type { ThemeMode, FontFamily, LayoutStyle, ContentDensity } from '../../core/models';
import type { AccentColor } from '../../core/types/common.types';

/** Left-nav section keys for the settings panel. */
type SettingsSection =
  'profile' | 'appearance' | 'typography' | 'accessibility' | 'preferences' | 'danger';

interface NavItem {
  readonly key: SettingsSection;
  readonly label: string;
  readonly icon: string;
}

/** Locally-edited profile fields (prefilled from profile.json; not persisted server-side). */
interface ProfileForm {
  name: string;
  title: string;
  email: string;
  location: string;
  bio: string;
  website: string;
}

/**
 * Settings & Personalization — a two-panel layout with a left section nav and a
 * right content panel. Appearance, typography, accessibility and preferences are
 * real, live-persisted personalization controls; the Profile tab is a local-only
 * form prefilled from profile.json (a static portfolio has no profile backend).
 */
@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, PageLayout, GlassCard, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  host: { class: 'block' },
})
export class SettingsPage {
  protected readonly personalization = inject(PersonalizationService);
  private readonly data = inject(DataService);
  private readonly profileResource = this.data.load('profile');

  // ── Section navigation ──────────────────────────────
  protected readonly section = signal<SettingsSection>('profile');
  protected readonly nav: readonly NavItem[] = [
    { key: 'profile', label: 'Profile', icon: 'User' },
    { key: 'appearance', label: 'Appearance', icon: 'Sparkles' },
    { key: 'typography', label: 'Typography', icon: 'PenTool' },
    { key: 'accessibility', label: 'Accessibility', icon: 'Accessibility' },
    { key: 'preferences', label: 'Preferences', icon: 'Wrench' },
    { key: 'danger', label: 'Danger Zone', icon: 'AlertTriangle' },
  ];

  protected setSection(key: SettingsSection): void {
    this.section.set(key);
  }

  // ── Profile form (local-only) ───────────────────────
  protected readonly avatar = computed(() => this.profileResource.value()?.avatar ?? '');
  protected readonly form = signal<ProfileForm>({
    name: '',
    title: '',
    email: '',
    location: '',
    bio: '',
    website: '',
  });
  protected readonly saved = signal(false);

  constructor() {
    // Seed the editable form once profile.json resolves.
    let seeded = false;
    effect(() => {
      const p = this.profileResource.value();
      if (!p || seeded) return;
      seeded = true;
      this.form.set({
        name: p.name ?? '',
        title: p.role ?? '',
        email: p.email ?? '',
        location: p.location ?? '',
        bio: p.bio ?? '',
        website: p.website ?? '',
      });
    });
  }

  protected updateField<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
    this.saved.set(false);
  }

  /** Local-only save — flashes confirmation. No profile backend on a static site. */
  protected saveChanges(): void {
    this.saved.set(true);
  }

  // ── Profile display toggles (local) ─────────────────
  protected readonly showEmail = signal(true);
  protected readonly showLocation = signal(true);
  protected readonly showSocial = signal(true);

  // ── Personalization state (real, live) ──────────────
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

  protected titleCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
