import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-social-links',
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './social-links.html',
  styleUrl: './social-links.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SocialLinks {
  @Input() socialLinks!: SocialLink[];
  @Input() githubUsername: string = '@username';
  @Input() githubUrl: string = '#';

  getSocialIcon(platform: string): string {
    const icons: { [key: string]: string } = {
      twitter: 'fab fa-twitter',
      linkedin: 'fab fa-linkedin-in',
      github: 'fab fa-github'
    };
    return icons[platform] || 'fas fa-link';
  }

  trackBySocialLink(index: number, item: SocialLink): string {
    return item.platform;
  }
}