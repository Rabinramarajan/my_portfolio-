import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-footer',
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Footer {
  @Input() socialLinks!: SocialLink[];
  @Input() githubUsername: string = '';
  @Input() githubUrl: string = '';

  trackBySocialLink(index: number, item: SocialLink): string {
    return item.platform;
  }
}
