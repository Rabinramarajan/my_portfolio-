import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { GlassCard } from '../../ui/glass-card/glass-card';
import { IconName, Profile } from '../../../../core';
import { Icon } from '../../ui/icon/icon';

interface ContactRow {
  readonly icon: IconName;
  readonly value: string;
}

/** Résumé/identity card: avatar, name, role and contact rows. Data-driven. */
@Component({
  selector: 'app-profile-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, GlassCard],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.scss',
  host: { class: 'block' },
})
export class ProfileCard {
  readonly profile = input.required<Profile>();

  protected readonly contacts = computed<readonly ContactRow[]>(() => {
    const p = this.profile();
    return [
      { icon: 'MapPin', value: p.location },
      { icon: 'Mail', value: p.email },
      { icon: 'Phone', value: p.phone },
      { icon: 'Globe', value: p.website },
    ];
  });
}
